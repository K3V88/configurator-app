document.addEventListener("turbo:load", () => {
  let currentStep = 1;

  // -----------------
  // Grab container and data attributes
  // -----------------
  const configuratorContainer = document.querySelector("[data-update-url]");
  if (!configuratorContainer) return;

  const updateUrl = configuratorContainer.dataset.updateUrl;
  const basePrice = parseInt(configuratorContainer.dataset.basePrice, 10) || 0;

  // -----------------
  // Frontend state
  // -----------------
  const selections = {
    style: null,
    wall_color: null,
    floor_texture: null,
    lighting: null,
    additional_options: [] // [{ value, price }]
  };

  // -----------------
  // Show a step
  // -----------------
  const showStep = (step) => {
    document.querySelectorAll(".step").forEach(s => s.style.display = "none");

    const el = document.getElementById(`step-${step}`);
    if (el) el.style.display = "block";

    currentStep = parseInt(step, 10);

    if (currentStep === 6) generateSummary();
  };

  // -----------------
  // Navigation buttons
  // -----------------
  document.querySelectorAll(".prev-step").forEach(btn => {
    btn.addEventListener("click", () => showStep(btn.dataset.prev));
  });

  document.querySelectorAll(".next-step").forEach(btn => {
    btn.addEventListener("click", () => showStep(btn.dataset.next));
  });

  // -----------------
  // Utility: save selection to backend
  // -----------------
  const saveSelection = (payload) => {
    fetch(updateUrl, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": document.querySelector("meta[name=csrf-token]").content
      },
      body: JSON.stringify({ configuration: payload })
    });
  };

  // -----------------
  // Step 3: Style (single select)
  // -----------------
  document.querySelectorAll(".style-card").forEach(card => {
    card.addEventListener("click", () => {
      document.querySelectorAll(".style-card").forEach(c => c.classList.remove("selected"));
      card.classList.add("selected");

      selections.style = card.dataset.style;
      saveSelection({ style: selections.style });
    });
  });

  // -----------------
  // Step 4 & 5: Options
  // -----------------
  document.querySelectorAll(".option-card[data-category]").forEach(card => {
    const category = card.dataset.category;
    const value = card.dataset.value;
    const price = parseInt(card.dataset.price, 10) || 0;

    if (category === "additional_option") {
      // MULTI-SELECT
      card.addEventListener("click", () => {
        card.classList.toggle("selected");

        if (card.classList.contains("selected")) {
          selections.additional_options.push({ value, price });
        } else {
          selections.additional_options = selections.additional_options.filter(o => o.value !== value);
        }

        saveSelection({ additional_options: selections.additional_options });
      });
    } else {
      // SINGLE-SELECT
      card.addEventListener("click", () => {
        document.querySelectorAll(`.option-card[data-category="${category}"]`).forEach(c => c.classList.remove("selected"));
        card.classList.add("selected");

        selections[category] = { value, price };
        saveSelection({ [category]: value, price });
      });
    }
  });

  // -----------------
  // Step 6: Summary
  // -----------------
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

    if (selections.style) {
      const li = document.createElement("li");
      li.textContent = `Style: ${selections.style}`;
      list.appendChild(li);
    }

    if (selections.wall_color) addLine(`Wall Color: ${selections.wall_color.value}`, selections.wall_color.price);
    if (selections.floor_texture) addLine(`Floor Texture: ${selections.floor_texture.value}`, selections.floor_texture.price);
    if (selections.lighting) addLine(`Lighting: ${selections.lighting.value}`, selections.lighting.price);

    selections.additional_options.forEach(opt => addLine(opt.value, opt.price));

    totalEl.textContent = total;
  };

  // -----------------
  // Finish button → generate PDF
  // -----------------
finishBtn.addEventListener("click", () => {
  const finalPayload = {
    style: selections.style,
    wall_color: selections.wall_color?.value,
    floor_texture: selections.floor_texture?.value,
    lighting: selections.lighting?.value,
    additional_options: selections.additional_options
  };

  // Save configuration first
  fetch(configuratorContainer.dataset.updateUrl, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": document.querySelector("meta[name=csrf-token]").content
    },
    body: JSON.stringify({ configuration: finalPayload })
  })
    .then(() => {
      // Trigger PDF download by adding .pdf
      const apartmentId = configuratorContainer.dataset.apartmentId;
      const wohnungId = configuratorContainer.dataset.wohnungId;

      // Create a real link to force browser to download
      const link = document.createElement("a");
      link.href = `/wohnungs/${wohnungId}/apartments/${apartmentId}/configure/finalize.pdf`;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      link.remove();
    })
    .catch(err => {
      console.error("Failed to save configuration:", err);
      alert("Failed to save configuration. Please try again.");
    });
});





  // -----------------
  // Init
  // -----------------
  showStep(1);
});
