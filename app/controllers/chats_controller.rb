class ChatsController < ApplicationController
  include ActionController::Live

  def index
  end

  def show
    @chat = Current.session.user.chats.find_by!(uuid: params[:uuid])

    respond_to do |format|
      format.html { render template: "chats/index" }
      format.turbo_stream
    end
  end

  def create
    set_streaming_headers
    sse = SSE.new(response.stream, event: "message")
    chat_model = Chat::MODELS.index_by { |m| m[:id] }[params[:chat_model]]
    unless chat_model
      raise "Invalid model specified"
    end
    client = OpenAI::Client.new(chat_model.slice(:access_token, :uri_base))

    begin
      content = stream_chat_response(client, sse, chat_model)
      chat = Chat.find_or_initialize_by(uuid: params[:uuid]) do |chat|
        chat.user = Current.session.user
        chat.title = generate_title(client)
      end
      Rails.logger.debug("chat: #{chat.inspect}")
      if chat.user != Current.session.user
        raise "User mismatch"
      end
      chat.messages.build(role: "user", content: params[:prompt])
      chat.messages.build(role: "assistant", content: content)
      chat.save!
    rescue ActiveRecord::RecordInvalid => e
      Rails.logger.error("Failed to save chat: #{e.message}")
    ensure
      sse.close
    end
  end

  def delete_modal
    @chat = Current.session.user.chats.find_by!(uuid: params[:uuid])
    respond_to do |format|
      format.turbo_stream { render "chats/delete_modal" }
    end
  end

  def destroy
    @chat = Current.session.user.chats.find_by!(uuid: params[:uuid])
    @chat.destroy
    redirect_to chats_path, notice: "チャットを削除しました"
  end

  private

  def set_streaming_headers
    response.headers["Content-Type"]  = "text/event-stream"
    response.headers["Last-Modified"] = Time.now.httpdate
  end

  def stream_chat_response(client, sse, chat_model)
    full_content = ""

    client.chat(
      parameters: {
        model: chat_model[:id],
        messages: [ { role: "user", content: params[:prompt] } ],
        stream: proc do |chunk|
          content = chunk.dig("choices", 0, "delta", "content")
          if content
            sse.write({ message: content })
            full_content += content
          end
        end
      }
    )
    full_content
  end

  def generate_title(client)
    system_prompt = <<~SYSTEM_PROMPT
      - ユーザーが会話を始める最初のメッセージに基づいて、短いタイトルを生成します
      - タイトルは80文字以内に収めてください
      - タイトルはユーザーのメッセージの要約であるべきです
      - 引用符やコロンは使用しないでください
      - タイトルは日本語で生成してください
    SYSTEM_PROMPT
    client.chat(
      parameters: {
        model: "gemini-2.0-flash",
        messages: [
          { role: "system", content: system_prompt },
          { role: "user", content: "Generate a title for the following chat: #{params[:prompt]}" }
        ]
      }
    ).dig("choices", 0, "message", "content").chomp
  end
end
