Turbo.StreamActions.show_modal = function() {
  const container = document.querySelector("remote-modal-container")
  container.replaceChildren(this.templateContent)
  container.querySelector("dialog").showModal()
}
