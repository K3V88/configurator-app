class CreateApartmentConfigurations < ActiveRecord::Migration[7.1]
  def change
    create_table :apartment_configurations do |t|
      t.references :user, null: false, foreign_key: true
      t.references :apartment, null: false, foreign_key: true
      t.jsonb :data

      t.timestamps
    end
  end
end
