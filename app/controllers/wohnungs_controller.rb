class WohnungsController < ApplicationController
  before_action :set_wohnung, only: %i[show edit update destroy]
  before_action :authenticate_user! # Ensure user is signed in for actions

  # GET /wohnungs or /wohnungs.json
  def index
    @wohnungs = Wohnung.all
  end

  # GET /wohnungs/1 or /wohnungs/1.json
  def show
  end

  # GET /wohnungs/new
  def new
    @wohnung = current_user.wohnungs.new # Associate with current_user
  end

  # GET /wohnungs/1/edit
  def edit
    # Ensure only the owner can edit
    redirect_to wohnungs_path, alert: "You are not authorized to edit this Wohnung" unless @wohnung.user == current_user
  end

  # POST /wohnungs or /wohnungs.json
  def create
    @wohnung = current_user.wohnungs.new(wohnung_params) # Associate with current_user

    respond_to do |format|
      if @wohnung.save
        format.html { redirect_to @wohnung, notice: "Wohnung was successfully created." }
        format.json { render :show, status: :created, location: @wohnung }
      else
        format.html { render :new, status: :unprocessable_entity }
        format.json { render json: @wohnung.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /wohnungs/1 or /wohnungs/1.json
  def update
    # Ensure only the owner can update
    if @wohnung.user != current_user
      redirect_to wohnungs_path, alert: "You are not authorized to update this Wohnung"
      return
    end

    respond_to do |format|
      if @wohnung.update(wohnung_params)
        format.html { redirect_to @wohnung, notice: "Wohnung was successfully updated." }
        format.json { render :show, status: :ok, location: @wohnung }
      else
        format.html { render :edit, status: :unprocessable_entity }
        format.json { render json: @wohnung.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /wohnungs/1 or /wohnungs/1.json
  def destroy
    # Ensure only the owner can destroy
    if @wohnung.user != current_user
      redirect_to wohnungs_path, alert: "You are not authorized to destroy this Wohnung"
      return
    end

    @wohnung.destroy!

    respond_to do |format|
      format.html { redirect_to wohnungs_path, status: :see_other, notice: "Wohnung was successfully destroyed." }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_wohnung
      @wohnung = Wohnung.find(params[:id])
    end

    # Only allow a list of trusted parameters through.
    def wohnung_params
      params.require(:wohnung).permit(:name, :description, :price, :size, :location, :year_built, :image)
    end
end
