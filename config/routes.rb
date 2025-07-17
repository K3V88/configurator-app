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
  resources :wohnungs

  # Health check route
  get "up" => "rails/health#show", as: :rails_health_check
  get '/database', to: 'pages#database'
  # Root route
  root "wohnungs#index"
end
