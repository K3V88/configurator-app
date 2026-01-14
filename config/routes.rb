Rails.application.routes.draw do
  get 'pages/database'
  # Define Devise routes for user authentication
  devise_for :users, path: "", path_names: {
    sign_in: "login",
    sign_out: "logout",
    sign_up: "register"
  }

  # Wrap logout route in devise_scope to specify the mapping for the user
  devise_scope :user do
    delete 'logout', to: 'devise/sessions#destroy', as: :logout
  end

  # Define your resources for wohnungs
  resources :wohnungs do
    resources :apartments, only: [:index, :show, :new, :create, :edit, :update, :destroy] do
      member do
        get 'configure'
      end
    end
  end

  # Health check route
  get "up" => "rails/health#show", as: :rails_health_check
  get '/database', to: 'pages#database'
  get "/contact", to: "pages#contact", as: :contact
  post "/contact", to: "contacts#create"
  # Root route
  root "wohnungs#index"
end
