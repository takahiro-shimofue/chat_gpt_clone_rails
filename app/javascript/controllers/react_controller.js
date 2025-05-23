import { Controller } from "@hotwired/stimulus"
import React from "react"
import { createRoot } from "react-dom/client"
import BoringAvatar from "components/BoringAvatar"

// 使い方
{/* <div
  data-controller="react"
  data-react-component="BoringAvatar"
  data-props='{"name": "John Doe"}'>
</div> */}

// 使用したいコンポーネントをここに追加
const components = {
  BoringAvatar
}

export default class extends Controller {
  connect() {
    const name = this.element.dataset.reactComponent
    if (!name) {
      console.warn("WARNING: data-react-component が指定されていません", this.element)
      return
    }

    const Component = components[name]
    if (!Component) {
      console.warn("WARNING: コンポーネントが見つかりません:", name, components)
      return
    }

    let props = {}
    if (this.element.dataset.props) {
      try {
        props = JSON.parse(this.element.dataset.props)
      } catch (e) {
        console.error("data-props の JSON パースに失敗しました:", e)
      }
    }

    const root = createRoot(this.element)
    root.render(React.createElement(Component, props));
  }
}
