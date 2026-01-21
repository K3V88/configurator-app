# app/controllers/apartment_configurations_controller.rb
class ApartmentConfigurationsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_apartment

  # GET /wohnungs/:wohnung_id/apartments/:apartment_id/configuration
  def show
    @configuration = ApartmentConfiguration.find_or_create_by!(
      user: current_user,
      apartment: @apartment
    )

    # Ensure data is always a hash
    @configuration.data ||= {}
  end

  # PATCH /wohnungs/:wohnung_id/apartments/:apartment_id/configuration
  def update
    @configuration = ApartmentConfiguration.find_or_create_by!(
      user: current_user,
      apartment: @apartment
    )

    # Ensure data is always a hash
    @configuration.data ||= {}

    # Merge new selections
    @configuration.update!(data: @configuration.data.merge(configuration_params.to_h))
    head :ok
  end

  # GET /wohnungs/:wohnung_id/apartments/:apartment_id/configuration/finalize
  def finalize
    @configuration = ApartmentConfiguration.find_or_create_by!(
      user: current_user,
      apartment: @apartment
    )

    # Make sure data is a hash
    data = @configuration.data || {}

    # Base price
    base_price = @apartment.price
    total_price = base_price

    # Add single-select prices safely
    total_price += data["wall_color_price"].to_i if data["wall_color_price"]
    total_price += data["floor_texture_price"].to_i if data["floor_texture_price"]
    total_price += data["lighting_price"].to_i if data["lighting_price"]

    # Add multi-select additional options
    if data["additional_options"].present?
      data["additional_options"].each do |opt|
        total_price += opt["price"].to_i
      end
    end

    # Pass local variables to the view
    respond_to do |format|
      format.html do
        render "apartments/summary",
               locals: { apartment: @apartment, config: @configuration, total_price: total_price }
      end

      format.pdf do
        pdf = render_to_string(
          pdf: "apartment-configuration",
          template: "apartments/summary",
          locals: { apartment: @apartment, config: @configuration, total_price: total_price }
        )

        send_data pdf,
                  filename: "apartment_configuration.pdf",
                  type: "application/pdf",
                  disposition: "attachment"
      end
    end
  end

  private

  def set_apartment
    @apartment = Apartment.find(params[:apartment_id] || params[:id])
  end

  def configuration_params
    params.fetch(:configuration, {}).permit(
      :style,
      :wall_color,
      :floor_texture,
      :lighting,
      :wall_color_price,
      :floor_texture_price,
      :lighting_price,
      additional_options: [:value, :price]
    )
  end
end
