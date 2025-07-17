class AddUserToWohnungs < ActiveRecord::Migration[7.1]
  def change
    add_reference :wohnungs, :user, null: true, foreign_key: true
  end
end
