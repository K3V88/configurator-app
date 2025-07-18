module ApplicationHelper
  def sortable_column(title, column)
    direction = (params[:sort_by] == column && params[:direction] == "asc") ? "desc" : "asc"
    arrow = ""

    if params[:sort_by] == column
      arrow = params[:direction] == "asc" ? " ↑" : " ↓"
    end

    link_to "#{title}#{arrow}".html_safe, { sort_by: column, direction: direction }
  end
end
