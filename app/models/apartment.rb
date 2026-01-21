class Apartment < ApplicationRecord
  belongs_to :wohnung
  has_one_attached :image
  has_many :apartment_configurations
end
