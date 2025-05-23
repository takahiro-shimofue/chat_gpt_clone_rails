# Pin npm packages by running ./bin/importmap

pin "application"
pin "@hotwired/turbo-rails", to: "turbo.min.js"
pin "@hotwired/stimulus", to: "stimulus.min.js"
pin "@hotwired/stimulus-loading", to: "stimulus-loading.js"
pin_all_from "app/javascript/controllers", under: "controllers"
pin "marked" # @15.0.12
pin "dompurify" # @3.2.6
pin "toastr" # @2.1.4
pin "jquery" # @3.7.1
pin "react" # @19.1.0
pin "boring-avatars" # @1.11.2
pin_all_from "app/javascript/components", under: "components", to: "components"
pin "react-dom/client", to: "react-dom--client.js" # @19.1.0
pin "react-dom" # @19.1.0
pin "scheduler" # @0.26.0
