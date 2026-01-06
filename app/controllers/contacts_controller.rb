class ContactsController < ApplicationController
  def create
    ContactMailer.inquiry(contact_params).deliver_now
    redirect_to contact_path, notice: "Thank you — we will contact you shortly."
  end

  private

  def contact_params
    params.permit(:name, :email, :phone, :contact_method, :request_type, :message)
  end
end
