import {Controller} from "@hotwired/stimulus"
import { marked } from "marked";
import DOMPurify from "dompurify";

const DEFAULT_CHAT_MODEL = "gemini-2.0-flash"

// Connects to data-controller="chat"
export default class extends Controller {
  static targets = ["prompt", "conversation", "scroll", "greeting"]

  generateResponse(event) {
    event.preventDefault()

    if (this.hasGreetingTarget) {
      this.greetingTarget.remove()
    }

    const template = document.getElementById('chat-message')
    const clone = template.content.cloneNode(true)
    clone.firstElementChild.setAttribute('data-role', 'user')
    const message = clone.querySelector('.message')
    message.innerHTML = this.promptTarget.value
    this.conversationTarget.appendChild(clone)
    const assistantClone = template.content.cloneNode(true)
    assistantClone.firstElementChild.setAttribute('data-role', 'assistant')
    const assistantMessage = assistantClone.querySelector('.message')
    this.assistantMessage = assistantMessage
    this.conversationTarget.appendChild(assistantClone)

    this.#streamAssistantResponse()

    this.promptTarget.value = ""
  }

  async #streamAssistantResponse() {
    const prompt = this.promptTarget.value;
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    const chatModel = document.cookie.split('; ')
                        .find(row => row.startsWith('chat_model='))
                        ?.split('=')[1] || DEFAULT_CHAT_MODEL;
    let body = { prompt, chat_model: chatModel };
    // root urlのときは、/chats/uuidにリダイレクトする
    let uuid;
    let newRecord = false;
    if (window.location.pathname === "/") {
      uuid = crypto.randomUUID();
      window.history.replaceState({}, '', `/chats/${uuid}`);
      newRecord = true;
      body = { ...body, uuid };
    } else {
      uuid = window.location.pathname.split('/').pop();
      body = { ...body, uuid };
    }

    const response = await fetch('/chats', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
        'X-CSRF-Token': csrfToken
      },
      body: JSON.stringify(body),
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let rawContent = "";

    while (true) {
      const {
        done,
        value
      } = await reader.read();
      if (done) {
        console.log("Stream finished");
        if (newRecord) {
          // turboを呼び出してサイドバーの更新を行う
          fetch(`/chats/${uuid}`, {
            headers: {
              'X-CSRF-Token': csrfToken,
              'Accept': 'text/vnd.turbo-stream.html',
            },
          }).then(response => response.text())
          .then(html => Turbo.renderStreamMessage(html))
        }

        break;
      }
      if (!value) continue;

      const lines = decoder.decode(value).trim().split('\n');
      console.log("lines = ", lines)
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const raw = line.slice(6);
          try {
            const { message } = JSON.parse(raw);
            rawContent += message;
            this.assistantMessage.innerHTML = DOMPurify.sanitize(marked.parse(rawContent));
            this.scrollTarget.scrollIntoView({ behavior: "smooth", block: "end" });
          } catch (e) {
            console.error('Error parsing JSON:', e);
            console.log('Raw data:', raw);
          }
        }
      }
    }
  }
}
