class Apartment < ApplicationRecord
  belongs_to :wohnung
  has_one_attached :image
end
