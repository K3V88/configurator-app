class AddDetailsToWohnungs < ActiveRecord::Migration[7.1]
  def change
    add_column :wohnungs, :price, :decimal
    add_column :wohnungs, :size, :integer
    add_column :wohnungs, :location, :string
    add_column :wohnungs, :year_built, :integer
  end
end
