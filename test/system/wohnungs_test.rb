require "application_system_test_case"

class WohnungsTest < ApplicationSystemTestCase
  setup do
    @wohnung = wohnungs(:one)
  end

  test "visiting the index" do
    visit wohnungs_url
    assert_selector "h1", text: "Wohnungs"
  end

  test "should create wohnung" do
    visit wohnungs_url
    click_on "New wohnung"

    fill_in "Description", with: @wohnung.description
    fill_in "Name", with: @wohnung.name
    click_on "Create Wohnung"

    assert_text "Wohnung was successfully created"
    click_on "Back"
  end

  test "should update Wohnung" do
    visit wohnung_url(@wohnung)
    click_on "Edit this wohnung", match: :first

    fill_in "Description", with: @wohnung.description
    fill_in "Name", with: @wohnung.name
    click_on "Update Wohnung"

    assert_text "Wohnung was successfully updated"
    click_on "Back"
  end

  test "should destroy Wohnung" do
    visit wohnung_url(@wohnung)
    click_on "Destroy this wohnung", match: :first

    assert_text "Wohnung was successfully destroyed"
  end
end
