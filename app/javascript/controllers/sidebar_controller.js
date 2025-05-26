import { Controller } from "@hotwired/stimulus"

const SIDEBAR_COOKIE_NAME = "sidebar:state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

// Connects to data-controller="sidebar"
export default class extends Controller {
  static targets = ["sidebar", "openButton"]
  connect() {
    const sidebarState = document.cookie.split('; ').find(row => row.startsWith(SIDEBAR_COOKIE_NAME));
    if (sidebarState && sidebarState.split('=')[1] === 'open') {
      this.sidebarTarget.classList.remove('hidden');
      this.openButtonTarget.classList.add('hidden');
    }
    else {
      this.sidebarTarget.classList.add('hidden');
      this.openButtonTarget.classList.remove('hidden');
    }
  }

  toggle() {
    if (this.sidebarTarget.classList.contains('hidden')) {
      this.sidebarTarget.classList.remove('hidden')
      this.openButtonTarget.classList.add('hidden')
      // Set a cookie to remember the sidebar state
      document.cookie = `${SIDEBAR_COOKIE_NAME}=open; max-age=${SIDEBAR_COOKIE_MAX_AGE}; path=/`;
    } else {
      this.sidebarTarget.classList.add('hidden')
      this.openButtonTarget.classList.remove('hidden')
      // Set a cookie to remember the sidebar state
      document.cookie = `${SIDEBAR_COOKIE_NAME}=closed; max-age=${SIDEBAR_COOKIE_MAX_AGE}; path=/`;
    }
  }
}
