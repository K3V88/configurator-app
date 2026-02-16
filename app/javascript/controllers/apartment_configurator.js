document.addEventListener("turbo:load", () => {
  let currentStep = 1;

  // -----------------
  // Grab container and data attributes
  // -----------------
  const configuratorContainer = document.querySelector("[data-update-url]");
  if (!configuratorContainer) return;

  const updateUrl = configuratorContainer.dataset.updateUrl;
  const basePrice = parseInt(configuratorContainer.dataset.basePrice, 10) || 0;
  const apartmentSize = parseInt(configuratorContainer.dataset.apartmentSize, 10) || 0;
  const apartmentId = configuratorContainer.dataset.apartmentId;
  const wohnungId = configuratorContainer.dataset.wohnungId;

  // -----------------
  // Frontend state
  // -----------------
  const selections = {
    style: null,
    wall_color: null,
    floor_texture: null,
    lighting: null,
    additional_options: []
  };

  // Track the currently selected cards
  let selectedWallColorCard = null;
  let selectedFloorCard = null;

  // -----------------
  // Step navigation
  // -----------------
  const showStep = (step) => {
    document.querySelectorAll(".step").forEach(s => s.style.display = "none");
    const el = document.getElementById(`step-${step}`);
    if (el) el.style.display = "block";
    currentStep = parseInt(step, 10);

    if (currentStep === 6) generateSummary();
  };

  document.querySelectorAll(".prev-step").forEach(btn => {
    btn.addEventListener("click", () => showStep(btn.dataset.prev));
  });
  document.querySelectorAll(".next-step").forEach(btn => {
    btn.addEventListener("click", () => showStep(btn.dataset.next));
  });

  // -----------------
  // Save selection to backend
  // -----------------
  const saveSelection = (payload) => {
    fetch(updateUrl, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": document.querySelector("meta[name=csrf-token]").content
      },
      body: JSON.stringify({ configuration: payload })
    }).catch(err => console.error("Error saving selection:", err));
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
  // Steps 4 & 5: Options (single & multi-select)
  // -----------------
  document.querySelectorAll(".option-card[data-category]").forEach(card => {
    const category = card.dataset.category;
    const value = card.dataset.value;

    if (category === "wall_color" || category === "floor_texture") {
      const pricePerM2 = parseInt(card.dataset.pricePerM2, 10) || 0;

      card.addEventListener("click", () => {
        // Deselect other cards in the category
        document.querySelectorAll(`.option-card[data-category="${category}"]`).forEach(c => {
          c.classList.remove("selected");

          if (category === "wall_color" && c !== card) {
            c.style.backgroundColor = '';
            c.style.color = '';
          }

          if (category === "floor_texture" && c !== card) {
            c.style.backgroundImage = '';
            c.style.color = '';
          }
        });

        // Select current card
        card.classList.add("selected");

        if (category === "wall_color") {
          card.style.backgroundColor = card.dataset.color;
          card.style.color = '#000';
          selectedWallColorCard = card;
        }

        if (category === "floor_texture") {
          card.style.backgroundImage = `url('/images/floors/${value.toLowerCase().replace(/\s+/g, '_')}.png')`;
          card.style.color = '#000';
          selectedFloorCard = card;
        }

        selections[category] = { value, pricePerM2 };
        saveSelection({ [category]: value, pricePerM2 });
      });
    } else if (category === "additional_option") {
      const price = parseInt(card.dataset.price, 10) || 0;

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
      const price = parseInt(card.dataset.price, 10) || 0;
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

    if (selections.style) addLine("Style: " + selections.style, 0);

    if (selections.wall_color) {
      const wallCost = selections.wall_color.pricePerM2 * apartmentSize;
      addLine(`Wall Color: ${selections.wall_color.value}`, wallCost);
    }

    if (selections.floor_texture) {
      const floorCost = selections.floor_texture.pricePerM2 * apartmentSize;
      addLine(`Floor Texture: ${selections.floor_texture.value}`, floorCost);
    }

    if (selections.lighting) addLine(`Lighting: ${selections.lighting.value}`, selections.lighting.price);
    selections.additional_options.forEach(opt => addLine(opt.value, opt.price));

    totalEl.textContent = total;
  };

  // -----------------
  // Finish button → save & generate PDF
  // -----------------
  const finishBtn = document.getElementById("finish-configurator");
  if (finishBtn) {
    finishBtn.addEventListener("click", () => {
      generateSummary();

      const finalPayload = {
        style: selections.style,
        wall_color: selections.wall_color?.value,
        floor_texture: selections.floor_texture?.value,
        lighting: selections.lighting?.value,
        additional_options: selections.additional_options
      };

      fetch(updateUrl, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": document.querySelector("meta[name=csrf-token]").content
        },
        body: JSON.stringify({ configuration: finalPayload })
      })
      .then(() => {
        const link = document.createElement("a");
        link.href = `/wohnungs/${wohnungId}/apartments/${apartmentId}/configure/finalize.pdf`;
        link.download = "apartment_configuration.pdf";
        document.body.appendChild(link);
        link.click();
        link.remove();
      })
      .catch(err => {
        console.error("Failed to save configuration:", err);
        alert("Failed to save configuration. Please try again.");
      });
    });
  }

  // -----------------
  // Wall color hover effect
  // -----------------
  document.querySelectorAll('.option-card[data-category="wall_color"]').forEach(card => {
    const originalBackground = card.style.backgroundColor || '';
    const originalColor = card.style.color || '';

    card.addEventListener('mouseenter', () => {
      if (card !== selectedWallColorCard) {
        card.style.backgroundColor = card.dataset.color;
        card.style.color = '#000';
      }
    });

    card.addEventListener('mouseleave', () => {
      if (card !== selectedWallColorCard) {
        card.style.backgroundColor = originalBackground;
        card.style.color = originalColor;
      }
    });
  });

  // -----------------
  // Floor texture hover effect
  // -----------------
  document.querySelectorAll('.option-card[data-category="floor_texture"]').forEach(card => {
    const originalBackground = card.style.backgroundImage || '';
    const originalColor = card.style.color || '';

    card.addEventListener('mouseenter', () => {
      if (card !== selectedFloorCard) {
        card.style.backgroundImage = `url('/images/floors/${card.dataset.value.toLowerCase().replace(/\s+/g, '_')}.png')`;
        card.style.color = '#000';
      }
    });

    card.addEventListener('mouseleave', () => {
      if (card !== selectedFloorCard) {
        card.style.backgroundImage = originalBackground;
        card.style.color = originalColor;
      }
    });
  });

  // -----------------
  // Init
  // -----------------
  showStep(1);
});
