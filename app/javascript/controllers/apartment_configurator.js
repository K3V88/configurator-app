document.addEventListener("turbo:load", () => {
  let currentStep = 1;

  const container = document.querySelector("[data-update-url]");
  if (!container) return;

  const updateUrl = container.dataset.updateUrl;
  const basePrice = parseInt(container.dataset.basePrice, 10) || 0;
  const apartmentSize = parseInt(container.dataset.apartmentSize, 10) || 0;
  const apartmentId = container.dataset.apartmentId;
  const wohnungId = container.dataset.wohnungId;

  const selections = { style:null, wall_color:null, floor_texture:null, lighting:null, additional_options:[] };
  let selectedWallCard = null;
  let selectedFloorCard = null;

  const showStep = (step) => {
    document.querySelectorAll(".step").forEach(s => s.style.display = "none");
    const el = document.getElementById(`step-${step}`);
    if (el) el.style.display = "block";
    currentStep = parseInt(step, 10);
    if (currentStep === 6) generateSummary();
  };

  document.querySelectorAll(".prev-step").forEach(btn =>
    btn.addEventListener("click", () => showStep(btn.dataset.prev))
  );
  document.querySelectorAll(".next-step").forEach(btn =>
    btn.addEventListener("click", () => showStep(btn.dataset.next))
  );

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

  // ----------------- Style Selection -----------------
  const styleCards = document.querySelectorAll(".style-card");
  const selectedStyleHero = document.getElementById("selected-style-hero");
  styleCards.forEach(card => {
    card.addEventListener("click", () => {
      styleCards.forEach(c => c.classList.remove("selected"));
      card.classList.add("selected");
      selections.style = { value: card.dataset.style, price:0 };
      selectedStyleHero.textContent = card.dataset.style.charAt(0).toUpperCase() + card.dataset.style.slice(1);
      saveSelection({ style: selections.style });
    });
  });
  // Default
  const defaultStyle = document.querySelector('.style-card[data-style="functional"]');
  if(defaultStyle) { defaultStyle.classList.add("selected"); selectedStyleHero.textContent = "Functional"; selections.style = { value: "functional", price:0 }; }

  // ----------------- Wall Color Selection (circle layout) -----------------
// ----------------- Wall Color Selection (circle layout) -----------------
const wallOptions = document.querySelectorAll(".color-option[data-category='wall_color']");

wallOptions.forEach(option => {
  const circle = option.querySelector(".color-circle");

  // Initial state: grayed out and normal size
  circle.style.filter = "brightness(0.3)";
  circle.style.transform = "scale(1)";
  circle.style.transition = "all 0.25s ease";

  // Hover effect (slight glow)
  option.addEventListener("mouseenter", () => {
    if(option !== selectedWallCard) circle.style.boxShadow = "0 0 6px rgba(255,255,255,0.4)";
  });
  option.addEventListener("mouseleave", () => {
    if(option !== selectedWallCard) circle.style.boxShadow = "none";
  });

  // Click / selection
  option.addEventListener("click", () => {
    // Deselect all
    wallOptions.forEach(o => {
      o.classList.remove("selected");
      const c = o.querySelector(".color-circle");
      c.style.filter = "brightness(0.3)"; // revert to grayed out
      c.style.transform = "scale(1)";      // revert size
      c.style.boxShadow = "none";
    });

    // Select clicked option
    option.classList.add("selected");
    circle.style.filter = "brightness(1)";  // true color
    circle.style.transform = "scale(1.15)"; // slightly bigger
    circle.style.boxShadow = "0 0 8px rgba(255,255,255,0.6)";

    // Save selection
    selections.wall_color = {
      value: option.dataset.value,
      pricePerM2: parseInt(option.dataset.pricePerM2, 10) || 0
    };
    selectedWallCard = option;
    saveSelection({ wall_color: selections.wall_color });
  });
});


  // ----------------- Option Selection (floors, lighting, additional) -----------------
  const optionCards = document.querySelectorAll(".option-card[data-category]");
  optionCards.forEach(card => {
    const category = card.dataset.category;
    const value = card.dataset.value;
    const pricePerM2 = parseInt(card.dataset.pricePerM2,10) || 0;
    const price = parseInt(card.dataset.price,10) || 0;

    card.addEventListener("click", () => {
      if(category==="floor_texture" || category==="lighting") {
        document.querySelectorAll(`.option-card[data-category="${category}"]`).forEach(c=>c.classList.remove("selected"));
        card.classList.add("selected");
        if(category==="floor_texture") selections.floor_texture={value, pricePerM2}; 
        else selections.lighting={value, price};
      } else if(category==="additional_option") {
        card.classList.toggle("selected");
        if(card.classList.contains("selected")) selections.additional_options.push({value,price});
        else selections.additional_options = selections.additional_options.filter(o=>o.value!==value);
      }
      saveSelection({ [category]: selections[category] });
    });
  });

  // ----------------- Summary -----------------
  const generateSummary = () => {
    const list = document.getElementById("summary-options");
    const totalEl = document.getElementById("total-price");
    if(!list || !totalEl) return;
    list.innerHTML="";
    let total=basePrice;

    const addLine = (label, price)=>{ const li=document.createElement("li"); li.textContent=`${label} – €${price}`; list.appendChild(li); total+=price; };

    if(selections.style) addLine(`Style: ${selections.style.value}`, selections.style.price);
    if(selections.wall_color) addLine(`Wall Color: ${selections.wall_color.value}`, selections.wall_color.pricePerM2*apartmentSize);
    if(selections.floor_texture) addLine(`Floor Texture: ${selections.floor_texture.value}`, selections.floor_texture.pricePerM2*apartmentSize);
    if(selections.lighting) addLine(`Lighting: ${selections.lighting.value}`, selections.lighting.price);
    selections.additional_options.forEach(opt=>addLine(opt.value,opt.price));

    totalEl.textContent=total;
  };

  // ----------------- Finish PDF -----------------
  const finishBtn = document.getElementById("finish-configurator");
  if(finishBtn){
    finishBtn.addEventListener("click",()=>{
      generateSummary();
      const payload = { ...selections, base_price: basePrice, apartment_size: apartmentSize };
      fetch(updateUrl,{method:"PATCH", headers:{"Content-Type":"application/json","X-CSRF-Token":document.querySelector("meta[name=csrf-token]").content}, body:JSON.stringify({configuration:payload})})
      .then(()=>{
        const link=document.createElement("a");
        link.href=`/wohnungs/${wohnungId}/apartments/${apartmentId}/configure/finalize.pdf`;
        link.download="apartment_configuration.pdf";
        document.body.appendChild(link); link.click(); link.remove();
      }).catch(err=>{console.error(err); alert("Failed to save configuration. Please try again.");});
    });
  }

  showStep(1);
});
