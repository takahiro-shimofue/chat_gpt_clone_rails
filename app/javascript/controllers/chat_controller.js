import {Controller} from "@hotwired/stimulus"
import { marked } from "marked";
import DOMPurify from "dompurify";
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

    let body = { prompt }
    // root urlのときは、/chats/uuidにリダイレクトする
    if (window.location.pathname === "/") {
      const uuid = crypto.randomUUID();
      window.history.replaceState({}, '', `/chats/${uuid}`);
      body = { prompt, uuid }
    } else {
      const uuid = window.location.pathname.split('/').pop();
      body = { prompt, uuid }
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
      if (done) break;
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
