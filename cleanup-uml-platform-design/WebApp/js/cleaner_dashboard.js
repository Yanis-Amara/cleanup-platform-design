document.addEventListener("DOMContentLoaded", () => {
  // --- NAVIGATION SIDEBAR ---
  const navLinks = document.querySelectorAll(".dash-nav-link");

  const sections = {
    overview:  document.getElementById("section-overview"),
    today:     document.getElementById("section-today"),
    schedule:  document.getElementById("section-schedule"),
    messages:  document.getElementById("section-messages"),
    earnings:  document.getElementById("section-earnings"),
    ratings:   document.getElementById("section-ratings"),
    support:   document.getElementById("section-support"),
  };

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.forEach((l) => l.classList.remove("active"));
      link.classList.add("active");

      const key = link.dataset.section;
      const target = sections[key];

      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  });

  // --- AUTH & ELEMENTS COMMUNS ---
  const token = localStorage.getItem("token");
  const role  = localStorage.getItem("role");

  if (!token || role !== "cleaner") {
    return; // pas connecté en cleaner : on ne charge rien
  }

  const API_BASE = "http://localhost:3000/api";

  // Helper pour formater proprement la date / heure d'un job
  function formatJobDateTime(rawDate, rawTime) {
    if (!rawDate) return null;

    const year = Number(String(rawDate).slice(0, 4));
    if (!year || year < 2000) return null;

    let d;
    if (String(rawDate).includes("T")) {
      d = new Date(rawDate);
    } else {
      const time = rawTime || "00:00";
      d = new Date(`${rawDate}T${time}`);
    }
    if (isNaN(d.getTime())) return null;

    return d.toLocaleString(undefined, {
      weekday: "short",
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // Eléments pour la carte "My main offer"
  const offerTitleEl    = document.getElementById("dash-offer-title");
  const offerAreaEl     = document.getElementById("dash-offer-area");
  const offerMinEl      = document.getElementById("dash-offer-min-hours");
  const offerPriceBadge = document.getElementById("dash-offer-price");
  const offerSummaryEl  = document.getElementById("dash-offer-summary");
  const offerEditBtn    = document.getElementById("btn-edit-offer");

  // Eléments du modal main offer
  const offerModalBackdrop = document.getElementById("offer-modal-backdrop");
  const offerForm          = document.getElementById("offer-form");
  const offerTitleInput    = document.getElementById("offer-title-input");
  const offerDescInput     = document.getElementById("offer-description-input");
  const offerPriceInput    = document.getElementById("offer-price-input");
  const offerMinInput      = document.getElementById("offer-min-input");
  const offerAreaInput     = document.getElementById("offer-area-input");
  const offerCloseBtn      = document.getElementById("offer-close-btn");
  const offerCancelBtn     = document.getElementById("offer-cancel-btn");

  let currentOffer = null;

  // Eléments pour la carte "Professional profile"
  const cardNameEl = document.getElementById("cleaner-profile-name");
  const cardCityEl = document.getElementById("cleaner-city");
  const cardExpEl  = document.getElementById("cleaner-experience");
  const cardServEl = document.getElementById("cleaner-services");

  // Eléments du modal profil
  const modalBackdrop = document.getElementById("profile-modal-backdrop");
  const openBtn       = document.getElementById("btn-edit-profile");
  const closeBtn      = document.getElementById("profile-close-btn");
  const cancelBtn     = document.getElementById("profile-cancel-btn");
  const form          = document.getElementById("profile-form");

  const nameInput     = document.getElementById("profile-name-input");
  const cityInput     = document.getElementById("profile-city-input");
  const expInput      = document.getElementById("profile-experience-input");
  const servicesInput = document.getElementById("profile-services-input");

  let currentProfile = null;

  // Elément pour les new requests
  const listEl = document.getElementById("cleaner-open-jobs");

  // Elément pour Today's jobs (jobs assignés)
  const todayJobsEl = document.getElementById("cleaner-today-jobs");

  // Stats du header
  const jobsTodayStatEl  = document.getElementById("stat-jobs-today");
  const hoursWeekStatEl  = document.getElementById("stat-hours-week");
  const avgRatingStatEl  = document.getElementById("stat-cleaner-rating");

  // Elément pour la liste "Ratings & reviews"
  const ratingsListEl = document.getElementById("cleaner-ratings-list");

  // --------- HEADER CLEANER (nom + email + avatar) ----------
  const headerNameEl      = document.getElementById("dash-cleaner-name");
  const headerEmailEl     = document.getElementById("dash-cleaner-email");
  const headerAvatarEl    = document.getElementById("dash-cleaner-avatar");
  const headerFirstNameEl = document.getElementById("cleaner-first-name");

  async function loadCleanerHeader() {
    if (!headerNameEl && !headerEmailEl && !headerAvatarEl && !headerFirstNameEl) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/me`, {
        headers: { Authorization: "Bearer " + token },
      });

      if (!res.ok) {
        console.error("Erreur chargement /me (cleaner):", res.status);
        return;
      }

      const data = await res.json();
      const user = data.user || {};

      const first =
        user.firstName !== undefined ? user.firstName : user.first_name;
      const last =
        user.lastName  !== undefined ? user.lastName  : user.last_name;
      const fullName = [first, last].filter(Boolean).join(" ").trim();
      const email    = user.email || "";

      if (headerNameEl && fullName) {
        headerNameEl.textContent = fullName;
      }
      if (headerEmailEl && email) {
        headerEmailEl.textContent = email;
      }
      if (headerFirstNameEl && first) {
        headerFirstNameEl.textContent = first;
      }

      if (headerAvatarEl && (first || last)) {
        const initials =
          ((first || "").charAt(0) + (last || "").charAt(0)).toUpperCase() || "CL";
        headerAvatarEl.textContent = initials;
      }
    } catch (err) {
      console.error("Erreur réseau /me (cleaner):", err);
    }
  }

  // --------- ÉLÉMENTS POUR LA MESSAGERIE ----------
  const convListEl      = document.getElementById("conversations-list");
  const convMessagesEl  = document.getElementById("conversation-messages");
  const convHeaderEl    = document.getElementById("conversation-header");
  const msgFormEl       = document.getElementById("message-form");
  const msgInputEl      = document.getElementById("message-input");
  const msgStatusEl     = document.getElementById("message-status");

  let currentConversationId = null;

  // --------- ÉLÉMENTS POUR LES EARNINGS ----------
  const totalEl  = document.getElementById("earnings-total");

  // ---------- CHARGER L'OFFRE PRINCIPALE DU CLEANER ----------
  async function loadMainOffer() {
    if (!offerTitleEl || !offerAreaEl || !offerPriceBadge || !offerSummaryEl) {
      return;
    }

    try {
      const res = await fetch(API_BASE + "/cleaner/offer", {
        headers: { Authorization: "Bearer " + token },
      });

      if (!res.ok) {
        console.error("Erreur chargement offre cleaner:", res.status);
        return;
      }

      const data  = await res.json();
      const offer = data.offer || null;
      currentOffer = offer;

      if (!offer) {
        offerTitleEl.textContent    = "Not set";
        offerAreaEl.textContent     = "Not set";
        if (offerMinEl) offerMinEl.textContent = "Not set";
        offerPriceBadge.textContent = "—";
        offerSummaryEl.textContent =
          "You haven’t created your main offer yet. Fill in your service details so clients know what you offer.";
        return;
      }

      offerSummaryEl.textContent =
        "Your main offer is visible to clients. You can update it anytime.";

      offerTitleEl.textContent =
        offer.service_title && offer.service_title.trim()
          ? offer.service_title
          : "Not set";

      offerAreaEl.textContent =
        offer.service_area && offer.service_area.trim()
          ? offer.service_area
          : "Not set";

      if (offerMinEl) {
        offerMinEl.textContent =
          offer.min_hours != null ? `${offer.min_hours}h minimum` : "Not set";
      }

      if (offer.hourly_rate != null) {
        offerPriceBadge.textContent = `€${offer.hourly_rate}/h`;
      } else {
        offerPriceBadge.textContent = "—";
      }

      // Pré-remplir les inputs du modal
      if (offerTitleInput) offerTitleInput.value = offer.service_title || "";
      if (offerDescInput)  offerDescInput.value  = offer.service_description || "";
      if (offerPriceInput)
        offerPriceInput.value =
          offer.hourly_rate != null ? offer.hourly_rate : "";
      if (offerMinInput)
        offerMinInput.value =
          offer.min_hours != null ? offer.min_hours : "";
      if (offerAreaInput) offerAreaInput.value = offer.service_area || "";
    } catch (err) {
      console.error("Erreur réseau chargement offre cleaner:", err);
    }
  }

  function openOfferModal() {
    if (!offerModalBackdrop) return;

    const o = currentOffer || {};
    if (offerTitleInput) offerTitleInput.value = o.service_title || "";
    if (offerDescInput)  offerDescInput.value  = o.service_description || "";
    if (offerPriceInput)
      offerPriceInput.value =
        o.hourly_rate != null ? o.hourly_rate : "";
    if (offerMinInput)
      offerMinInput.value =
        o.min_hours != null ? o.min_hours : "";
    if (offerAreaInput) offerAreaInput.value = o.service_area || "";

    offerModalBackdrop.style.display = "flex";
  }

  function closeOfferModal() {
    if (offerModalBackdrop) {
      offerModalBackdrop.style.display = "none";
    }
  }

  // ---------- PROFIL PRO CLEANER ----------
  async function loadCleanerProfile() {
    if (!cardNameEl || !cardCityEl || !cardExpEl || !cardServEl) {
      return;
    }

    try {
      const res = await fetch(API_BASE + "/cleaner/profile", {
        headers: { Authorization: "Bearer " + token },
      });

      if (!res.ok) {
        console.error("Erreur chargement profil cleaner:", res.status);
        return;
      }

      const data = await res.json();
      currentProfile = data.profile || null;

      if (currentProfile) {
        const fullName =
          (currentProfile.firstName || "") + " " + (currentProfile.lastName || "");

        cardNameEl.textContent = fullName.trim() || "(not set yet)";
        cardCityEl.textContent = currentProfile.mainCity || "(not set yet)";
        cardExpEl.textContent =
          currentProfile.experienceYears != null
            ? `${currentProfile.experienceYears} years`
            : "0 years";
        cardServEl.textContent =
          currentProfile.services || "Regular, deep clean";
      }
    } catch (err) {
      console.error("Erreur réseau profil cleaner:", err);
    }
  }

  function openProfileModal() {
    if (!modalBackdrop || !form) return;

    if (!currentProfile) {
      currentProfile = {};
    }

    const fullName =
      (currentProfile.firstName || "") + " " + (currentProfile.lastName || "");

    if (nameInput)     nameInput.value     = fullName.trim();
    if (cityInput)     cityInput.value     = currentProfile.mainCity || "";
    if (expInput)      expInput.value      =
      currentProfile.experienceYears != null ? currentProfile.experienceYears : 0;
    if (servicesInput) servicesInput.value = currentProfile.services || "";

    modalBackdrop.style.display = "flex";
  }

  function closeProfileModal() {
    if (modalBackdrop) {
      modalBackdrop.style.display = "none";
    }
  }

  // --- Listeners modal main offer ---
  if (offerEditBtn) {
    offerEditBtn.addEventListener("click", (e) => {
      e.preventDefault();
      openOfferModal();
    });
  }
  if (offerCloseBtn)  offerCloseBtn.addEventListener("click", closeOfferModal);
  if (offerCancelBtn) offerCancelBtn.addEventListener("click", closeOfferModal);
  if (offerModalBackdrop) {
    offerModalBackdrop.addEventListener("click", (e) => {
      if (e.target === offerModalBackdrop) {
        closeOfferModal();
      }
    });
  }

  if (offerForm) {
    offerForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const payload = {
        serviceTitle:       offerTitleInput ? offerTitleInput.value.trim() : "",
        serviceDescription: offerDescInput  ? offerDescInput.value.trim()  : "",
        servicePrice:       offerPriceInput && offerPriceInput.value
                              ? Number(offerPriceInput.value)
                              : null,
        serviceMinHours:    offerMinInput && offerMinInput.value
                              ? Number(offerMinInput.value)
                              : null,
        serviceArea:        offerAreaInput ? offerAreaInput.value.trim() : "",
      };

      try {
        const res = await fetch(`${API_BASE}/cleaner/offer`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify(payload),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          console.error("Erreur API /cleaner/offer:", res.status, data);
          alert(data.error || "Error while saving your offer.");
          return;
        }

        currentOffer = data.offer || null;
        await loadMainOffer();
        closeOfferModal();
        alert("Your main offer has been saved.");
      } catch (err) {
        console.error("Erreur réseau sauvegarde offre:", err);
        alert("Network error while saving your offer.");
      }
    });
  }

  if (openBtn && modalBackdrop) {
    openBtn.addEventListener("click", (e) => {
      e.preventDefault();
      openProfileModal();
    });
  }
  if (closeBtn)  closeBtn.addEventListener("click", closeProfileModal);
  if (cancelBtn) cancelBtn.addEventListener("click", closeProfileModal);

  if (modalBackdrop) {
    modalBackdrop.addEventListener("click", (e) => {
      if (e.target === modalBackdrop) {
        closeProfileModal();
      }
    });
  }

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const fullName = nameInput ? nameInput.value.trim() : "";
      const [firstName, ...rest] = fullName.split(" ");
      const lastName = rest.join(" ");

      const payload = {
        firstName:       firstName || null,
        lastName:        lastName  || null,
        mainCity:        cityInput ? (cityInput.value.trim() || null) : null,
        experienceYears: expInput ? (Number(expInput.value) || 0) : 0,
        services:        servicesInput ? (servicesInput.value.trim() || null) : null,
      };

      try {
        const res = await fetch(API_BASE + "/cleaner/profile", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify(payload),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          console.error("Erreur sauvegarde profil:", res.status, data);
          alert(data.error || "Error when saving your profile.");
          return;
        }

        currentProfile = data.profile;
        await loadCleanerProfile();
        closeProfileModal();
      } catch (err) {
        console.error("Erreur réseau sauvegarde profil:", err);
        alert("Network error when saving your profile.");
      }
    });
  }

  // ---------- MESSAGERIE ----------
  async function loadConversations() {
    if (!convListEl) return;

    try {
      const res = await fetch(`${API_BASE}/conversations`, {
        headers: { Authorization: "Bearer " + token },
      });

      if (!res.ok) {
        console.error("Erreur chargement conversations:", res.status);
        return;
      }

      const data = await res.json();
      const conversations = data.conversations || [];

      convListEl.innerHTML = "";

      if (!conversations.length) {
        convListEl.innerHTML = `
          <p class="dash-empty">
            You have no conversations yet. Once a client books you, your chat with them will appear here.
          </p>
        `;
        return;
      }

      conversations.forEach((c) => {
        const row = document.createElement("div");
        row.className = "dash-conversation-row";

        const otherName =
          c.customer_first_name || c.customer_last_name
            ? `${c.customer_first_name || ""} ${c.customer_last_name || ""}`.trim()
            : (c.cleaner_first_name || c.cleaner_last_name)
            ? `${c.cleaner_first_name || ""} ${c.cleaner_last_name || ""}`.trim()
            : "Client";

        row.innerHTML = `
          <button type="button" class="dash-conversation-item">
            <div class="dash-conversation-name">${otherName}</div>
            <div class="dash-small-text">Conversation #${c.id}</div>
          </button>
          <button
            type="button"
            class="dash-conversation-delete"
            aria-label="Delete conversation"
            data-conv-id="${c.id}">
            🗑
          </button>
        `;

        const mainBtn = row.querySelector(".dash-conversation-item");
        mainBtn.addEventListener("click", () => {
          openConversation(c.id, otherName);
        });

        const deleteBtn = row.querySelector(".dash-conversation-delete");
        deleteBtn.addEventListener("click", async (e) => {
          e.stopPropagation();

          const ok = window.confirm(
            "Supprimer cette conversation ? Tous les messages seront perdus."
          );
          if (!ok) return;

          try {
            const resDel = await fetch(`${API_BASE}/conversations/${c.id}`, {
              method: "DELETE",
              headers: { Authorization: "Bearer " + token },
            });

            const dataDel = await resDel.json().catch(() => ({}));

            if (!resDel.ok) {
              alert(dataDel.error || "Erreur lors de la suppression.");
              return;
            }

            if (currentConversationId === c.id) {
              currentConversationId = null;
              if (convHeaderEl) convHeaderEl.textContent = "Conversation";
              if (convMessagesEl) convMessagesEl.innerHTML = "";
              if (msgFormEl) msgFormEl.style.display = "none";
            }

            loadConversations();
          } catch (err) {
            console.error("Erreur suppression conversation:", err);
            alert("Erreur réseau lors de la suppression.");
          }
        });

        convListEl.appendChild(row);
      });
    } catch (err) {
      console.error("Erreur réseau chargement conversations:", err);
    }
  }

  async function openConversation(conversationId, otherName) {
    currentConversationId = conversationId;

    if (convHeaderEl) {
      convHeaderEl.textContent = otherName
        ? `Chat with ${otherName}`
        : "Conversation";
    }

    if (msgFormEl) {
      msgFormEl.style.display = "block";
    }
    if (msgStatusEl) {
      msgStatusEl.textContent = "";
    }

    await loadMessages(conversationId);
  }

  async function loadMessages(conversationId) {
    if (!convMessagesEl) return;

    try {
      const res = await fetch(`${API_BASE}/conversations/${conversationId}/messages`, {
        headers: { Authorization: "Bearer " + token },
      });

      if (!res.ok) {
        console.error("Erreur chargement messages:", res.status);
        convMessagesEl.innerHTML = `
          <p class="dash-small-text" style="color:#B91C1C;">
            Error while loading messages.
          </p>
        `;
        return;
      }

      const data = await res.json();
      const messages = data.messages || [];

      convMessagesEl.innerHTML = "";

      if (!messages.length) {
        convMessagesEl.innerHTML = `
          <p class="dash-small-text">
            No messages yet. Say hi to your client.
          </p>
        `;
        return;
      }

      messages.forEach((m) => {
        const row = document.createElement("div");
        row.className =
          m.sender_role === "cleaner"
            ? "dash-message dash-message--mine"
            : "dash-message dash-message--theirs";

        const when = m.created_at
          ? new Date(m.created_at).toLocaleString()
          : "";

        row.innerHTML = `
          <div class="dash-message-content">${m.content}</div>
          <div class="dash-message-meta">${m.sender_role} • ${when}</div>
        `;

        convMessagesEl.appendChild(row);
      });

      convMessagesEl.scrollTop = convMessagesEl.scrollHeight;
    } catch (err) {
      console.error("Erreur réseau chargement messages:", err);
      convMessagesEl.innerHTML = `
        <p class="dash-small-text" style="color:#B91C1C;">
          Network error while loading messages.
        </p>
      `;
    }
  }

  if (msgFormEl && msgInputEl) {
    msgFormEl.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!currentConversationId) return;

      const content = msgInputEl.value.trim();
      if (!content) return;

      if (msgStatusEl) {
        msgStatusEl.style.color = "#6B7280";
        msgStatusEl.textContent = "Sending...";
      }

      try {
        const res = await fetch(
          `${API_BASE}/conversations/${currentConversationId}/messages`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + token,
            },
            body: JSON.stringify({ content }),
          }
        );

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          if (msgStatusEl) {
            msgStatusEl.style.color = "#B91C1C";
            msgStatusEl.textContent =
              (data && data.error) || "Error while sending message.";
          }
          return;
        }

        msgInputEl.value = "";
        if (msgStatusEl) {
          msgStatusEl.style.color = "#16A34A";
          msgStatusEl.textContent = "Message sent.";
        }
        await loadMessages(currentConversationId);
      } catch (err) {
        console.error("Erreur envoi message:", err);
        if (msgStatusEl) {
          msgStatusEl.style.color = "#B91C1C";
          msgStatusEl.textContent = "Network error while sending message.";
        }
      }
    });
  }

  // ---------- NEW REQUESTS ----------
  if (!listEl) {
    loadCleanerHeader();
    loadCleanerProfile();
    loadMainOffer();
    loadConversations();
    loadEarnings();
    return;
  }

  async function loadOpenJobs() {
    try {
      const res = await fetch(API_BASE + "/cleaner/jobs/open", {
        headers: { Authorization: "Bearer " + token },
      });
      if (!res.ok) {
        console.error("Erreur chargement jobs ouverts:", res.status);
        return;
      }
      const data = await res.json();

      const jobs = (data.jobs || []).filter(
        (job) => job.my_response !== "declined"
      );

      renderJobs(jobs);
    } catch (err) {
      console.error("Erreur réseau chargement jobs:", err);
    }
  }

  function renderJobs(jobs) {
    listEl.innerHTML = "";
    if (!jobs.length) {
      const p = document.createElement("p");
      p.className = "dash-empty";
      p.textContent =
        "You have no new requests at the moment. When a client books a job, it will appear here for you to accept or decline.";
      listEl.appendChild(p);
      return;
    }

    jobs.forEach((job) => {
      const row = document.createElement("div");
      row.className = "dash-job";

      const niceDateTime = formatJobDateTime(job.job_date, job.job_time);
      const dateLine = niceDateTime
        ? `${niceDateTime} · ${job.duration_hours}h`
        : `${job.duration_hours}h`;

      const priceText =
        job.customer_hourly_rate != null
          ? `Client rate: €${job.customer_hourly_rate}/h`
          : "";

      row.innerHTML = `
        <div class="dash-job-main">
          <div class="dash-job-title"><strong>${job.service_type}</strong></div>
          <div class="dash-small-text">${dateLine}</div>
          <div class="dash-small-text">${job.address}</div>
          ${
            priceText
              ? `<div class="dash-small-text" style="margin-top:4px;color:#0F766E;">${priceText}</div>`
              : ""
          }
        </div>
        <div class="dash-job-actions">
          <button class="btn btn-ghost" data-action="decline">Decline</button>
          <button class="btn btn-primary" data-action="accept">Accept</button>
        </div>
      `;

      row.querySelectorAll("button").forEach((btn) => {
        btn.addEventListener("click", () => {
          const action = btn.getAttribute("data-action");
          respondToJob(job.id, action);
        });
      });

      listEl.appendChild(row);
    });
  }

  async function respondToJob(jobId, action) {
    try {
      const res = await fetch(`${API_BASE}/cleaner/jobs/${jobId}/respond`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ action }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        console.error("Erreur réponse job:", res.status, data);
        alert(data.error || "Error when responding to the request.");
        return;
      }

      if (action === "accept" && data.conversationId) {
        await loadOpenJobs();
        await loadAssignedJobs();
        await loadCleanerRatings();
        await loadConversations();
        await loadEarnings();
        openConversation(data.conversationId);
      } else {
        loadOpenJobs();
        loadAssignedJobs();
        loadCleanerRatings();
        loadConversations();
        loadEarnings();
      }
    } catch (err) {
      console.error("Erreur réseau réponse job:", err);
      alert("Network error when responding to the request.");
    }
  }

  // ---------- TODAY'S JOBS ----------
  async function loadAssignedJobs() {
    if (!todayJobsEl) {
      console.warn("Élément #cleaner-today-jobs introuvable dans le DOM.");
      return;
    }

    try {
      const res = await fetch(API_BASE + "/cleaner/jobs/assigned", {
        headers: { Authorization: "Bearer " + token },
      });

      if (!res.ok) {
        console.error("Erreur chargement jobs assignés:", res.status);
        return;
      }

      const data = await res.json();
      const jobs = data.jobs || [];

      renderAssignedJobs(jobs);
    } catch (err) {
      console.error("Erreur réseau chargement jobs assignés:", err);
    }
  }

  function renderAssignedJobs(jobs) {
    todayJobsEl.innerHTML = "";

    if (jobsTodayStatEl) {
      jobsTodayStatEl.textContent = jobs.length.toString();
    }

    if (hoursWeekStatEl) {
      const totalHours = jobs.reduce((sum, job) => {
        const h = Number(job.duration_hours || 0);
        return sum + (isNaN(h) ? 0 : h);
      }, 0);
      hoursWeekStatEl.textContent = `${totalHours}h`;
    }

    if (!jobs.length) {
      const p = document.createElement("p");
      p.className = "dash-empty";
      p.textContent =
        "You have no assigned jobs yet. Once you accept a request, it will appear here.";
      todayJobsEl.appendChild(p);
      return;
    }

    jobs.forEach((job) => {
      const row = document.createElement("div");
      row.className = "dash-job";

      const niceDateTime = formatJobDateTime(job.job_date, job.job_time);
      const dateLine = niceDateTime
        ? `${niceDateTime} · ${job.duration_hours}h`
        : `${job.duration_hours}h`;

      let statusBadge = "";
      if (job.status === "assigned") {
        statusBadge = '<span class="dash-badge-soft" style="background:#FEF3C7;color:#92400E">In progress</span>';
      } else if (job.status === "done") {
        statusBadge = '<span class="dash-badge-soft" style="background:#D1FAE5;color:#065F46">Completed</span>';
      }

      const priceText =
        job.customer_hourly_rate != null
          ? `Client rate: €${job.customer_hourly_rate}/h`
          : "";

      row.innerHTML = `
        <div class="dash-job-main">
          <div class="dash-job-title">
            <strong>${job.service_type}</strong>
            ${statusBadge}
          </div>
          <div class="dash-small-text">${dateLine}</div>
          <div class="dash-small-text">${job.address}</div>
          ${
            job.notes
              ? `<div class="dash-small-text" style="margin-top:4px;color:#64748B">Note: ${job.notes}</div>`
              : ""
          }
          ${
            priceText
              ? `<div class="dash-small-text" style="margin-top:4px;color:#0F766E;">${priceText}</div>`
              : ""
          }
        </div>
        <div class="dash-job-actions">
          ${
            job.status === "assigned"
              ? '<button class="btn btn-primary" data-jobid="' + job.id + '" data-action="complete">Mark as completed</button>'
              : ""
          }
        </div>
      `;

      const completeBtn = row.querySelector('[data-action="complete"]');
      if (completeBtn) {
        completeBtn.addEventListener("click", () => {
          const jobId = completeBtn.getAttribute("data-jobid");
          completeJob(jobId);
        });
      }

      todayJobsEl.appendChild(row);
    });
  }

  async function completeJob(jobId) {
    try {
      const res = await fetch(`${API_BASE}/cleaner/jobs/${jobId}/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        console.error("Erreur complétion job:", res.status, data);
        alert(data.error || "Error when completing the job.");
        return;
      }

      loadAssignedJobs();
      loadEarnings();
    } catch (err) {
      console.error("Erreur réseau complétion job:", err);
      alert("Network error when completing the job.");
    }
  }

  // ---------- RATINGS & REVIEWS ----------
  async function loadCleanerRatings() {
    if (!ratingsListEl) return;

    try {
      const res = await fetch(API_BASE + "/cleaner/ratings", {
        headers: { Authorization: "Bearer " + token },
      });

      if (!res.ok) {
        console.error("Erreur chargement avis cleaner:", res.status);
        return;
      }

      const data = await res.json();
      const reviews = data.reviews || [];

      if (avgRatingStatEl) {
        if (!reviews.length) {
          avgRatingStatEl.textContent = "–";
        } else {
          const sum = reviews.reduce(
            (s, r) => s + Number(r.rating || 0),
            0
          );
          const avg = sum / reviews.length;
          avgRatingStatEl.textContent = avg.toFixed(1);
        }
      }

      renderCleanerRatings(reviews);
    } catch (err) {
      console.error("Erreur réseau chargement avis cleaner:", err);
    }
  }

  function renderCleanerRatings(reviews) {
    ratingsListEl.innerHTML = "";

    if (!reviews.length) {
      const p = document.createElement("p");
      p.className = "dash-empty";
      p.textContent =
        "You don’t have any reviews yet. After each job, clients can rate you and leave feedback here.";
      ratingsListEl.appendChild(p);
      return;
    }

    reviews.forEach((rev) => {
      const row = document.createElement("div");
      row.className = "dash-review";

      const rating = Number(rev.rating) || 0;
      const fullStars = "★".repeat(Math.max(0, Math.min(5, rating)));
      const emptyStars = "☆".repeat(5 - fullStars.length);

      const niceDateTime = formatJobDateTime(rev.job_date, rev.job_time);
      const metaLine = niceDateTime
        ? `${(rev.service_type || "").trim()} · ${niceDateTime}`
        : (rev.service_type || "").trim();

      row.innerHTML = `
        <div class="dash-review-header">
          <strong>${rev.customer_name || "Client"}</strong>
          <span class="dash-review-rating">${fullStars}${emptyStars}</span>
        </div>
        <div class="dash-small-text">
          ${metaLine}
        </div>
        ${
          rev.comment
            ? `<p class="dash-small-text" style="margin-top:4px;">${rev.comment}</p>`
            : ""
        }
      `;

      ratingsListEl.appendChild(row);
    });
  }

  // ---------- EARNINGS (Total uniquement) ----------
  async function loadEarnings() {
    if (!totalEl) return;

    try {
      const res = await fetch(`${API_BASE}/cleaner/earnings`, {
        headers: { Authorization: "Bearer " + token },
      });

      if (!res.ok) {
        console.error("Erreur chargement earnings:", res.status);
        return;
      }

      const data = await res.json();

      const totalVal = Number(
        data.total ??
        data.totalAll ??
        data.allTime ??
        data.total_amount ??
        0
      );

      totalEl.textContent = `€${totalVal.toFixed(2)}`;
    } catch (err) {
      console.error("Erreur chargement earnings:", err);
    }
  }

  // --------- Chargement initial ---------
  loadCleanerHeader();
  loadCleanerProfile();
  loadMainOffer();
  loadOpenJobs();
  loadAssignedJobs();
  loadCleanerRatings();
  loadConversations();
  loadEarnings();

  // refresh toutes les 15s
  setInterval(() => {
    loadOpenJobs();
    loadAssignedJobs();
    loadCleanerRatings();
    loadConversations();
    loadEarnings();
    if (currentConversationId) {
      loadMessages(currentConversationId);
    }
  }, 15000);
});
