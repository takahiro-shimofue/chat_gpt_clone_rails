class ChatsController < ApplicationController
  include ActionController::Live

  def index
  end

  def create
    set_streaming_headers
    sse = SSE.new(response.stream, event: "message")
    client = OpenAI::Client.new(
      access_token: Rails.application.credentials.dig(:gemini, :api_key),
      uri_base: "https://generativelanguage.googleapis.com/v1beta/openai/"
    )

    begin
      stream_chat_response(client, sse)
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
    client.chat(
      parameters: {
        model: "gemini-2.0-flash",
        messages: [ { role: "user", content: params[:prompt] } ],
        stream: proc do |chunk|
          content = chunk.dig("choices", 0, "delta", "content")
          puts "content: #{content}"
          puts "chunk: #{chunk}"
          sse.write({ message: content }) if content
        end
      }
    )
  end
end
