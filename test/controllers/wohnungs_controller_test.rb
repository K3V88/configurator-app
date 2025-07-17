require "test_helper"

class WohnungsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @wohnung = wohnungs(:one)
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
      post wohnungs_url, params: { wohnung: { description: @wohnung.description, name: @wohnung.name } }
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
    patch wohnung_url(@wohnung), params: { wohnung: { description: @wohnung.description, name: @wohnung.name } }
    assert_redirected_to wohnung_url(@wohnung)
  end

  test "should destroy wohnung" do
    assert_difference("Wohnung.count", -1) do
      delete wohnung_url(@wohnung)
    end

    assert_redirected_to wohnungs_url
  end
end
