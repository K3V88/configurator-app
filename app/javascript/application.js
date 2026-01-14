// Entry point for the build script in Rails 7 with importmaps
import "@hotwired/turbo-rails"

document.addEventListener("turbo:load", () => {
  const flashMessages = document.querySelectorAll(".flash-message");
  flashMessages.forEach((msg) => {
    setTimeout(() => {
      msg.style.transition = "opacity 0.5s ease, transform 0.5s ease";
      msg.style.opacity = "0";
      msg.style.transform = "translateY(-20px)";
      setTimeout(() => msg.remove(), 500);
    }, 3000);
  });
});
