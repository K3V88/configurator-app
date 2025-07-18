class AddRoomsToWohnungs < ActiveRecord::Migration[7.1]
  def change
    add_column :wohnungs, :rooms, :float
  end
end
