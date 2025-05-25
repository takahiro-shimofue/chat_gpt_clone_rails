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
    client = OpenAI::Client.new(
      access_token: Rails.application.credentials.dig(:gemini, :api_key),
      uri_base: "https://generativelanguage.googleapis.com/v1beta/openai/"
    )

    begin
      content = stream_chat_response(client, sse)
      chat = Chat.find_or_initialize_by(uuid: params[:uuid]) do |chat|
        chat.user = Current.session.user
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

  private

  def set_streaming_headers
    response.headers["Content-Type"]  = "text/event-stream"
    response.headers["Last-Modified"] = Time.now.httpdate
  end

  def stream_chat_response(client, sse)
    full_content = ""
    client.chat(
      parameters: {
        model: "gemini-2.0-flash",
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
end
