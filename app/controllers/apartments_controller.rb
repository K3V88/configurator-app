class ApartmentsController < ApplicationController
  before_action :set_wohnung
  before_action :set_apartment, only: %i[show edit update destroy configure]

  def new
    @apartment = @wohnung.apartments.new
  end

  def show
  # optional: display a single apartment page
  end

  def create
    @apartment = @wohnung.apartments.new(apartment_params)
    if @apartment.save
      redirect_to wohnung_path(@wohnung), notice: "Apartment created"
    else
      render :new
    end
  end

  def edit
  end

  def update
    if @apartment.update(apartment_params)
      redirect_to wohnung_path(@wohnung), notice: "Apartment updated"
    else
      render :edit
    end
  end

  def destroy
    @apartment.destroy
    redirect_to wohnung_path(@wohnung), notice: "Apartment deleted"
  end

  def configure
    # This will be your configurator page
  end

  private

  def set_wohnung
    @wohnung = Wohnung.find(params[:wohnung_id])
  end

  def set_apartment
    @apartment = @wohnung.apartments.find(params[:id])
  end

  def apartment_params
    params.require(:apartment).permit(:floor, :size, :rooms, :price, :image)
  end
end
