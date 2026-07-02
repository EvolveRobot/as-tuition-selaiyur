const P = window.SITE_PROFILE || {};

function getNested(obj, path) {
  return path.split(".").reduce((v, k) => (v ? v[k] : undefined), obj);
}

function applyProfile() {
  if (!P.businessName) return;

  if (P.metaTitle) document.title = P.metaTitle;
  const meta = document.querySelector('meta[name="description"]');
  if (meta && P.metaDescription) meta.content = P.metaDescription;

  if (P.theme) {
    const root = document.documentElement;
    if (P.theme.primary) root.style.setProperty("--teal", P.theme.primary);
    if (P.theme.accent) root.style.setProperty("--orange", P.theme.accent);
    if (P.theme.background) root.style.setProperty("--sand", P.theme.background);
  }

  document.querySelectorAll("[data-profile]").forEach((el) => {
    const key = el.dataset.profile;
    let val = getNested(P, key);
    if (key === "localityLine" && P.locality) {
      val = P.localityLine || `📍 ${P.locality}, ${P.city}`;
    }
    if (val !== undefined) el.textContent = val;
  });

  document.querySelectorAll("[data-profile-rating]").forEach((el) => {
    if (!P.rating) { el.hidden = true; return; }
    el.hidden = false;
    el.textContent = `★ ${P.rating} Google`;
  });

  document.querySelectorAll('[data-profile="hero.image"]').forEach((img) => {
    if (P.hero?.image) img.src = P.hero.image;
    if (P.hero?.imageAlt) img.alt = P.hero.imageAlt;
  });

  document.querySelectorAll('[data-profile="phoneLink"]').forEach((a) => {
    a.href = `tel:+${P.phoneWa}`;
    if (!a.classList.contains("btn")) a.textContent = `+91 ${P.phoneDisplay}`;
    else a.textContent = `Call +91 ${P.phoneDisplay}`;
  });

  document.querySelectorAll('[data-profile="whatsappLink"]').forEach((a) => {
    a.href = `https://wa.me/${P.phoneWa}`;
  });

  document.querySelectorAll('[data-profile="mapsLink"]').forEach((a) => {
    if (P.mapsLink) a.href = P.mapsLink;
  });

  document.querySelectorAll(".brand strong").forEach((el) => { el.textContent = P.brandPrimary; });
  document.querySelectorAll(".brand small").forEach((el) => { el.textContent = P.brandSecondary; });
  document.querySelectorAll(".brand-mark").forEach((el) => { el.textContent = P.brandInitials; });
}

function renderHighlights() {
  document.querySelectorAll('[data-render="highlights"]').forEach((el) => {
    const items = P.highlights || [];
    el.innerHTML = items.map((h) => `
      <div class="trust-item">
        <strong>${h.value}</strong>
        <span>${h.label}</span>
      </div>
    `).join("");
  });
}

function renderHeroProof() {
  const el = document.querySelector('[data-render="hero-proof"]');
  if (!el || !P.hero?.proof) return;
  el.innerHTML = P.hero.proof.map((item) =>
    `<span><strong>${item.value}</strong> ${item.label}</span>`
  ).join("");
}

function renderHeroBadge() {
  const el = document.querySelector('[data-render="hero-badge"]');
  const badge = P.hero?.badge;
  if (!el || !badge) { el && (el.hidden = true); return; }
  el.innerHTML = `<span>${badge.value}</span><strong>${badge.label}</strong>`;
}

function renderCourses() {
  const accents = ["accent-1", "accent-2", "accent-3", "accent-4"];
  document.querySelectorAll('[data-render="courses"]').forEach((el) => {
    const list = P.courses || [];
    el.innerHTML = list.map((c, i) => `
      <article class="program-card ${accents[i % accents.length]}" id="${c.id}">
        <div class="program-top">
          <span class="program-icon">${c.icon || i + 1}</span>
          <h3>${c.title}</h3>
        </div>
        <p>${c.text}</p>
        <ul>${(c.points || []).map((p) => `<li>${p}</li>`).join("")}</ul>
      </article>
    `).join("");
  });
}

function renderWhy() {
  document.querySelectorAll('[data-render="why"]').forEach((el) => {
    const items = P.whyChoose || [];
    el.innerHTML = items.map((w) => `
      <article class="why-card">
        <div class="icon">${w.icon}</div>
        <h3>${w.title}</h3>
        <p>${w.text}</p>
      </article>
    `).join("");
  });
}

function renderTestimonials() {
  document.querySelectorAll('[data-render="testimonials"]').forEach((el) => {
    const list = P.testimonials || [];
    el.innerHTML = list.map((t) => `
      <article class="review-card">
        <div class="stars">${t.rating || "★ 5.0"}</div>
        <blockquote>"${t.quote}"</blockquote>
        <cite>— ${t.person}</cite>
      </article>
    `).join("");
  });
}

function renderCourseOptions() {
  document.querySelectorAll('[data-render="course-options"]').forEach((sel) => {
    const opts = P.courseFormOptions || [];
    sel.innerHTML = ['<option value="">Select</option>', ...opts.map((o) => `<option>${o}</option>`)].join("");
  });
}

function setupMenu() {
  const toggle = document.querySelector(".menu-toggle");
  const menu = document.querySelector("#mobile-menu");
  if (!toggle || !menu) return;
  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!open));
    menu.hidden = open;
    document.body.classList.toggle("menu-open", !open);
  });
  menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => {
    toggle.setAttribute("aria-expanded", "false");
    menu.hidden = true;
    document.body.classList.remove("menu-open");
  }));
}

function setupForm() {
  document.querySelectorAll("[data-lead-form]").forEach((form) => {
    const status = form.querySelector(".form-status");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const phone = form.phone.value.replace(/\D/g, "");
      if (!form.reportValidity() || phone.length < 10) {
        status.textContent = "Enter a valid 10-digit phone.";
        status.style.color = "#dc2626";
        return;
      }
      status.textContent = "Thanks! We will call you shortly.";
      status.style.color = "#0f766e";
      form.reset();
    });
  });
}

function setupWhatsApp() {
  const phone = P.phoneWa || "919444072102";
  const msg = P.floatingMessage || "Hi, I would like to enquire about admission.";
  const a = document.createElement("a");
  a.className = "floating-whatsapp";
  a.href = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  a.target = "_blank";
  a.rel = "noopener";
  a.setAttribute("aria-label", "WhatsApp");
  a.innerHTML = '<svg viewBox="0 0 32 32"><path d="M16.04 4.5c-6.25 0-11.33 4.91-11.33 10.96 0 1.93.53 3.81 1.54 5.47L4.5 27.5l6.86-1.72a11.74 11.74 0 0 0 4.68.96c6.25 0 11.33-4.92 11.33-10.97S22.29 4.5 16.04 4.5Zm5.06-6.84c-.27-.13-1.63-.78-1.88-.87-.25-.09-.43-.13-.61.13-.18.27-.7.87-.86 1.04-.16.18-.32.2-.59.07-.27-.13-1.15-.41-2.18-1.31-.81-.7-1.36-1.57-1.52-1.83-.16-.27-.02-.41.12-.54.12-.12.27-.31.41-.47.13-.16.18-.27.27-.45.09-.18.05-.34-.02-.47-.07-.13-.61-1.43-.84-1.96-.22-.51-.45-.44-.61-.45h-.52c-.18 0-.47.07-.72.34-.25.27-.95.9-.95 2.19s.97 2.54 1.11 2.72c.13.18 1.91 2.83 4.64 3.97.65.27 1.16.43 1.55.55.65.2 1.24.17 1.71.1.52-.07 1.63-.65 1.86-1.28.23-.63.23-1.16.16-1.28-.07-.11-.25-.18-.52-.31Z"/></svg>';
  document.body.appendChild(a);
}

applyProfile();
renderHighlights();
renderHeroProof();
renderHeroBadge();
renderCourses();
renderWhy();
renderTestimonials();
renderCourseOptions();
setupMenu();
setupForm();
setupWhatsApp();
