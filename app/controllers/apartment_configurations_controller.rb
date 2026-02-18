# app/controllers/apartment_configurations_controller.rb
class ApartmentConfigurationsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_apartment
  before_action :set_configuration

  # GET /wohnungs/:wohnung_id/apartments/:apartment_id/configuration
  def show
    @configuration.data ||= {}
  end

  # PATCH /wohnungs/:wohnung_id/apartments/:apartment_id/configuration
  def update
    @configuration.data ||= {}

    # Merge nested configuration safely
    updated_data = @configuration.data.deep_merge(configuration_params.to_h)

    @configuration.update!(data: updated_data)

    head :ok
  end

  # GET /wohnungs/:wohnung_id/apartments/:apartment_id/configuration/finalize
  def finalize
    data = @configuration.data || {}

    total_price = calculate_total_price(data)

    respond_to do |format|
      format.html do
        render "apartments/summary",
               locals: {
                 apartment: @apartment,
                 config: @configuration,
                 total_price: total_price
               }
      end

      format.pdf do
        pdf = render_to_string(
          pdf: "apartment-configuration",
          template: "apartments/summary",
          locals: {
            apartment: @apartment,
            config: @configuration,
            total_price: total_price
          }
        )

        send_data pdf,
                  filename: "apartment_configuration.pdf",
                  type: "application/pdf",
                  disposition: "attachment"
      end
    end
  end

  private

  # --------------------------------------------------
  # Setup
  # --------------------------------------------------

  def set_apartment
    @apartment = Apartment.find(params[:apartment_id] || params[:id])
  end

  def set_configuration
    @configuration = ApartmentConfiguration.find_or_create_by!(
      user: current_user,
      apartment: @apartment
    )
  end

  # --------------------------------------------------
  # Strong Params (NEW STRUCTURE)
  # --------------------------------------------------

  def configuration_params
    params.fetch(:configuration, {}).permit(
      :base_price,
      :apartment_size,
      style: [:value, :price],
      wall_color: [:value, :pricePerM2, :totalPrice],
      floor_texture: [:value, :pricePerM2, :totalPrice],
      lighting: [:value, :price],
      additional_options: [:value, :price]
    )
  end

  # --------------------------------------------------
  # Price Calculation
  # --------------------------------------------------

  def calculate_total_price(data)
    base_price = data["base_price"].presence || @apartment.price
    total = base_price.to_i

    # Wall Color
    if data["wall_color"].present?
      total += data["wall_color"]["totalPrice"].to_i
    end

    # Floor Texture
    if data["floor_texture"].present?
      total += data["floor_texture"]["totalPrice"].to_i
    end

    # Lighting
    if data["lighting"].present?
      total += data["lighting"]["price"].to_i
    end

    # Additional Options
    if data["additional_options"].present?
      data["additional_options"].each do |opt|
        total += opt["price"].to_i
      end
    end

    total
  end
end
