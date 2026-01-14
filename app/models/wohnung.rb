class Wohnung < ApplicationRecord
  belongs_to :user
  has_one_attached :image
  has_many :apartments, dependent: :destroy

  validates :name, presence: true
  validates :description, presence: true
  validates :price, numericality: { greater_than_or_equal_to: 0 }, allow_nil: true
  validates :size, numericality: { only_integer: true, greater_than_or_equal_to: 0 }, allow_nil: true
  validates :location, presence: true
  validates :year_built, numericality: { only_integer: true, greater_than_or_equal_to: 1000, less_than_or_equal_to: Time.now.year }, allow_nil: true
end
