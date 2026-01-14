class CreateApartments < ActiveRecord::Migration[7.1]
  def change
    create_table :apartments do |t|
      t.references :wohnung, null: false, foreign_key: true
      t.integer :floor
      t.decimal :size
      t.decimal :rooms
      t.decimal :price

      t.timestamps
    end
  end
end
