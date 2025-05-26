import { Controller } from "@hotwired/stimulus"
const COOKIE_NAME = "dark-mode"
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7

// Connects to data-controller="color-mode"
export default class extends Controller {
  static targets = ["button"]

  connect() {
    this.updateMode(this.#isDarkModeFromCookie())
  }

  toggle() {
    this.updateMode(!this.#isDarkModeFromCookie())
  }

  updateMode(isDark) {
    this.#applyDarkMode(isDark)
    this.buttonTarget.innerText = isDark
      ? "ライトモードに切り替え"
      : "ダークモードに切り替え"
  }

  #isDarkModeFromCookie() {
    const c = document.cookie.split("; ").find(r => r.startsWith(`${COOKIE_NAME}=`))
    return c?.split("=")[1] === "true"
  }

  #applyDarkMode(isDark) {
    document.documentElement.style.colorScheme = isDark ? "dark" : "light"
    document.documentElement.classList.toggle("dark", isDark)
    document.cookie = `${COOKIE_NAME}=${isDark}; max-age=${COOKIE_MAX_AGE}; path=/; SameSite=Lax; Secure`
  }
}
