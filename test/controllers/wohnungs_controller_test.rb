require "test_helper"

class WohnungsControllerTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers # Include this to use sign_in helper

  setup do
    # Create a unique user each time
    @user = User.create!(email: "test#{Time.now.to_i}@example.com", password: "password", password_confirmation: "password")

    # Sign in the user
    sign_in @user

    # Ensure the Wohnung is associated with this user
    @wohnung = @user.wohnungs.create!(name: "Test Wohnung", description: "A lovely apartment", price: 1000, size: 70, location: "Berlin", year_built: 1999, rooms: 3)
  end

  test "should get index" do
    get wohnungs_url
    assert_response :success
  end

  test "should get new" do
    get new_wohnung_url
    assert_response :success
  end

  test "should create wohnung" do
    assert_difference("Wohnung.count") do
      post wohnungs_url, params: { wohnung: { name: "New Wohnung", description: "Spacious apartment", price: 1500, size: 80, location: "Berlin", year_built: 2000, rooms: 4 } }
    end
    assert_redirected_to wohnung_url(Wohnung.last)
  end

  test "should show wohnung" do
    get wohnung_url(@wohnung)
    assert_response :success
  end

  test "should get edit" do
    get edit_wohnung_url(@wohnung)
    assert_response :success
  end

  test "should update wohnung" do
    patch wohnung_url(@wohnung), params: { wohnung: { name: "Updated Wohnung", description: "Updated description", price: 1200, size: 85, location: "Berlin", year_built: 2001, rooms: 5 } }
    assert_redirected_to wohnung_url(@wohnung)
    @wohnung.reload
    assert_equal "Updated Wohnung", @wohnung.name
    assert_equal "Updated description", @wohnung.description
    assert_equal 1200, @wohnung.price
    assert_equal 85, @wohnung.size
    assert_equal 5, @wohnung.rooms
  end

  test "should destroy wohnung" do
    assert_difference("Wohnung.count", -1) do
      delete wohnung_url(@wohnung)
    end
    assert_redirected_to wohnungs_url
  end
end
