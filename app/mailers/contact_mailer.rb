class ContactMailer < ApplicationMailer
  default to: "Kevin.stal@gmx.ch",
          from: "Kevin Stal <Kevin.stal@gmx.ch>"

  def inquiry(data)
    @data = data
    mail(
      subject: "New Apartment Inquiry – #{@data[:name]}"
    )
  end
end
