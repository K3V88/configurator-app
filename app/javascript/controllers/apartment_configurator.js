document.addEventListener("turbo:load", () => {

  /* =====================================================
     INITIAL SETUP
  ===================================================== */

  const container = document.querySelector("[data-update-url]");
  if (!container) return;

  const updateUrl     = container.dataset.updateUrl;
  const basePrice     = parseInt(container.dataset.basePrice, 10) || 0;
  const apartmentSize = parseInt(container.dataset.apartmentSize, 10) || 0;
  const apartmentId   = container.dataset.apartmentId;
  const wohnungId     = container.dataset.wohnungId;

  let currentStep = 1;

  const selections = {
    style: null,
    rooms: {},
    additional_options: []
  };

  /* =====================================================
     STEP NAVIGATION
  ===================================================== */

  const showStep = (step) => {
    document.querySelectorAll(".step").forEach(s => s.style.display = "none");
    const el = document.getElementById(`step-${step}`);
    if (el) el.style.display = "block";
    currentStep = parseInt(step, 10);
    if (currentStep === 5) generateSummary();
  };

  document.querySelectorAll(".prev-step").forEach(btn =>
    btn.addEventListener("click", () => showStep(btn.dataset.prev))
  );

  document.querySelectorAll(".next-step").forEach(btn =>
    btn.addEventListener("click", () => showStep(btn.dataset.next))
  );

  /* =====================================================
     SAVE TO BACKEND
  ===================================================== */

  const saveSelection = () => {
    fetch(updateUrl, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": document.querySelector("meta[name=csrf-token]").content
      },
      body: JSON.stringify({ configuration: selections })
    }).catch(err => console.error("Save error:", err));
  };

  /* =====================================================
     STYLE SELECTION
  ===================================================== */

  const styleCards = document.querySelectorAll(".style-card");
  const selectedStyleHero = document.getElementById("selected-style-hero");

  styleCards.forEach(card => {
    card.addEventListener("click", () => {

      styleCards.forEach(c => c.classList.remove("selected"));
      card.classList.add("selected");

      selections.style = {
        value: card.dataset.style,
        price: 0
      };

      if (selectedStyleHero) {
        selectedStyleHero.textContent =
          card.dataset.style.charAt(0).toUpperCase() +
          card.dataset.style.slice(1);
      }

      saveSelection();
    });
  });

  const defaultStyle = document.querySelector('.style-card[data-style="functional"]');
  if (defaultStyle) defaultStyle.click();

  /* =====================================================
     ROOM OPTION SELECTION (WALL / FLOOR / LIGHTING)
  ===================================================== */

  const roomOptions = document.querySelectorAll("[data-category][data-room]");

  roomOptions.forEach(el => {

    el.addEventListener("click", () => {

      const category = el.dataset.category;
      const room     = el.dataset.room;
      const value    = el.dataset.value;
      const price    = parseInt(el.dataset.price, 10) || 0;
      const pricePerM2 = parseInt(el.dataset.pricePerM2, 10) || 0;

      if (!selections.rooms[room]) {
        selections.rooms[room] = {};
      }

      /* ---- WALL COLORS ---- */
      if (category === "wall_color") {

        document.querySelectorAll(
          `[data-category="wall_color"][data-room="${room}"]`
        ).forEach(o => {
          o.classList.remove("selected");
          const c = o.querySelector(".color-circle");
          if (c) {
            c.style.filter = "brightness(0.3)";
            c.style.transform = "scale(1)";
            c.style.boxShadow = "none";
          }
        });

        el.classList.add("selected");

        const circle = el.querySelector(".color-circle");
        if (circle) {
          circle.style.filter = "brightness(1)";
          circle.style.transform = "scale(1.15)";
          circle.style.boxShadow = "0 0 8px rgba(255,255,255,0.6)";
        }

        selections.rooms[room].wall_color = {
          value,
          pricePerM2
        };
      }

      /* ---- FLOOR ---- */
      else if (category === "floor_texture") {

        document.querySelectorAll(
          `[data-category="floor_texture"][data-room="${room}"]`
        ).forEach(o => o.classList.remove("selected"));

        el.classList.add("selected");

        selections.rooms[room].floor_texture = {
          value,
          pricePerM2
        };
      }




      /* ---- LIGHTING ---- */
      else if (category === "lighting") {

        document.querySelectorAll(
          `[data-category="lighting"][data-room="${room}"]`
        ).forEach(o => o.classList.remove("selected"));

        el.classList.add("selected");

        selections.rooms[room].lighting = {
          value,
          price
        };
      }

      saveSelection();
    });
  });

  /* =====================================================
     ADDITIONAL OPTIONS (MULTI SELECT)
  ===================================================== */

  const additionalOptions = document.querySelectorAll(
    "[data-category='additional_option']"
  );

  additionalOptions.forEach(el => {
    el.addEventListener("click", () => {

      const value = el.dataset.value;
      const price = parseInt(el.dataset.price, 10) || 0;

      el.classList.toggle("selected");

      if (el.classList.contains("selected")) {
        selections.additional_options.push({ value, price });
      } else {
        selections.additional_options =
          selections.additional_options.filter(o => o.value !== value);
      }

      saveSelection();
    });
  });

  /* =====================================================
     SUMMARY
  ===================================================== */

  const generateSummary = () => {

    const list = document.getElementById("summary-options");
    const totalEl = document.getElementById("total-price");
    if (!list || !totalEl) return;

    list.innerHTML = "";
    let total = basePrice;

    const addLine = (label, price) => {
      const li = document.createElement("li");
      li.textContent = `${label} – €${price}`;
      list.appendChild(li);
      total += price;
    };

    if (selections.style)
      addLine(`Style: ${selections.style.value}`, 0);

    Object.keys(selections.rooms).forEach(room => {

      const r = selections.rooms[room];

      if (r.wall_color)
        addLine(
          `${room} Wall Color: ${r.wall_color.value}`,
          r.wall_color.pricePerM2 * apartmentSize
        );

      if (r.floor_texture)
        addLine(
          `${room} Floor: ${r.floor_texture.value}`,
          r.floor_texture.pricePerM2 * apartmentSize
        );

      if (r.lighting)
        addLine(
          `${room} Lighting: ${r.lighting.value}`,
          r.lighting.price
        );
    });

    selections.additional_options.forEach(opt =>
      addLine(opt.value, opt.price)
    );

    totalEl.textContent = total;
  };

  /* =====================================================
     FINISH + PDF
  ===================================================== */

  const finishBtn = document.getElementById("finish-configurator");

  if (finishBtn) {
    finishBtn.addEventListener("click", () => {

      generateSummary();

      fetch(updateUrl, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": document.querySelector("meta[name=csrf-token]").content
        },
        body: JSON.stringify({ configuration: selections })
      }).then(() => {

        const link = document.createElement("a");
        link.href = `/wohnungs/${wohnungId}/apartments/${apartmentId}/configure/finalize.pdf`;
        link.download = "apartment_configuration.pdf";
        document.body.appendChild(link);
        link.click();
        link.remove();

      }).catch(() => {
        alert("Failed to save configuration.");
      });
    });
  }
  showStep(1);

});