import { Controller } from "@hotwired/stimulus"
import { marked } from "marked";
import DOMPurify from "dompurify";

// Connects to data-controller="markdown"
export default class extends Controller {
  connect() {
    const trimmed = this.element.innerHTML.trim();
    this.element.innerHTML = DOMPurify.sanitize(marked.parse(trimmed));
  }
}
