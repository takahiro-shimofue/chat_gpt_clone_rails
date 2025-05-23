import {Controller} from "@hotwired/stimulus"

// Connects to data-controller="chat"
export default class extends Controller {
  static targets = ["prompt", "conversation"]

  generateResponse(event) {
    event.preventDefault()

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

    const response = await fetch('/chats', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
        'X-CSRF-Token': csrfToken
      },
      body: JSON.stringify({
        prompt
      })
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

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
            const parsedData = JSON.parse(raw);
            this.assistantMessage.innerHTML += parsedData.message;
          } catch (e) {
            console.error('Error parsing JSON:', e);
            console.log('Raw data:', raw);
          }
        }
      }
    }
  }
}
