class User < ApplicationRecord
  has_many :wohnungs, dependent: :destroy
  has_many :apartment_configurations
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable
end
