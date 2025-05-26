import { Controller } from "@hotwired/stimulus"
const DEFAULT_CHAT_MODEL = "gemini-2.0-flash"
const CHAT_MODEL_COOKIE_NAME = "chat_model";
const CHAT_MODEL_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
// Connects to data-controller="chat-model"
export default class extends Controller {
  static targets = ["selectedModel", "checked"]
  connect() {
    const chatModel = document.cookie.split('; ').find(row => row.startsWith(CHAT_MODEL_COOKIE_NAME));
    if (chatModel) {
      const selectedModel = chatModel.split('=')[1];
      this.selectedModelTarget.innerText = selectedModel;
      this.selectedModel = selectedModel;
    } else {
      this.selectedModelTarget.innerText = DEFAULT_CHAT_MODEL;
      this.selectedModel = DEFAULT_CHAT_MODEL;
    }

    this.#checkedTargets()
  }

  select(event) {
    const selectedModel = event.currentTarget.dataset.model;
    this.selectedModel = selectedModel;
    this.selectedModelTarget.innerText = selectedModel;
    document.cookie = `${CHAT_MODEL_COOKIE_NAME}=${selectedModel}; max-age=${CHAT_MODEL_COOKIE_MAX_AGE}; path=/`;
    this.#checkedTargets();
  }

  #checkedTargets() {
    this.checkedTargets.forEach((target) => {
      if (target.dataset.model === this.selectedModel) {
        target.classList.remove("hidden")
      } else {
        target.classList.add("hidden")
      }
    });
  }
}
