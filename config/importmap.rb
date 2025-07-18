# Pin npm packages by running ./bin/importmap
pin "application", preload: true
pin "bootstrap", to: "bootstrap@5.3.5/dist/js/bootstrap.bundle.min.js"
pin "@hotwired/turbo-rails", to: "turbo.min.js"
pin "@rails/ujs", to: "https://cdn.jsdelivr.net/npm/@rails/ujs@latest"
pin_all_from "app/javascript/controllers", under: "controllers"
