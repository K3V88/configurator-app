class PagesController < ApplicationController
  def database
    allowed_columns = %w[id name rooms size price]
    sort_column = params[:sort_by].presence_in(allowed_columns) || "id"
    sort_direction = params[:direction] == "desc" ? "desc" : "asc"

    @wohnungs = Wohnung.order("#{sort_column} #{sort_direction}")
  end
end
