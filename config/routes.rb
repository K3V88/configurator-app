Rails.application.routes.draw do
  # -------------------------
  # Static / Pages
  # -------------------------
  get "/database", to: "pages#database"
  get "/contact", to: "pages#contact", as: :contact
  post "/contact", to: "contacts#create"

  # -------------------------
  # Devise (Authentication)
  # -------------------------
  devise_for :users, path: "", path_names: {
    sign_in: "login",
    sign_out: "logout",
    sign_up: "register"
  }

  devise_scope :user do
    delete "logout", to: "devise/sessions#destroy", as: :logout
  end

  # -------------------------
  # Core domain: Wohnungs & Apartments
  # -------------------------
resources :wohnungs do
  resources :apartments do
    # Configure page (GET /wohnungs/:wohnung_id/apartments/:id/configure)
    member do
      get :configure

      # Finalize PDF download (GET /wohnungs/:wohnung_id/apartments/:id/configure/finalize)
      get 'configure/finalize', to: 'apartment_configurations#finalize', as: :finalize_configure
    end

    # Apartment configuration (AJAX save)
    resource :configuration, only: [:show, :update], controller: "apartment_configurations"
  end
end

  # -------------------------
  # Health check
  # -------------------------
  get "up", to: "rails/health#show", as: :rails_health_check

  # -------------------------
  # Root
  # -------------------------
  root "wohnungs#index"
end
