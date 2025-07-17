require "test_helper"

class PagesControllerTest < ActionDispatch::IntegrationTest
  test "should get database" do
    get pages_database_url
    assert_response :success
  end
end
