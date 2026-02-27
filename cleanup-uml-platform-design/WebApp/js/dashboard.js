// dashboard.js
document.addEventListener("DOMContentLoaded", () => {
  /* =====================================
   * Navigation sidebar
   * ===================================== */
  const navLinks = document.querySelectorAll(".dash-nav-link");

  const sections = {
    overview: document.getElementById("section-overview"),
    bookings: document.getElementById("section-bookings"),
    messages: document.getElementById("section-messages"),
    addresses: document.getElementById("section-addresses"),
    payments: document.getElementById("section-payments"),
    preferences: document.getElementById("section-preferences"),
    support: document.getElementById("section-support"),
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

  /* =====================================
   * Auth / contexte
   * ===================================== */
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token || role !== "customer") {
    // Pas de dashboard client sans token + rôle customer
    return;
  }

  const API_BASE = "http://localhost:3000/api";

  /* =====================================
   * Helpers modales
   * ===================================== */
  function openModal(id) {
    const m = document.getElementById(id);
    if (m) m.classList.remove("hidden");
  }

  function closeModal(id) {
    const m = document.getElementById(id);
    if (m) m.classList.add("hidden");
  }

  document.querySelectorAll("[data-close-modal]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-close-modal");
      if (id) closeModal(id);
    });
  });

  /* =====================================
   * Etat settings + profil basique
   * ===================================== */
  let currentSettings = null;
  const profileData = {
    name: null,
    email: null,
    phone: null,
    address: null,
  };

  async function loadProfileBasic() {
    try {
      const res = await fetch(`${API_BASE}/me`, {
        headers: { Authorization: "Bearer " + token },
      });
      if (!res.ok) {
        console.error("Erreur chargement /me:", res.status);
        return;
      }
      const data = await res.json();
      const user = data.user || {};

      const first =
        user.firstName !== undefined ? user.firstName : user.first_name;
      const last =
        user.lastName !== undefined ? user.lastName : user.last_name;
      const fullName = [first, last].filter(Boolean).join(" ").trim();
      const email = user.email || "";

      profileData.name = fullName || null;
      profileData.email = email || null;

      const dashFirstNameEl = document.getElementById("dash-first-name");
      const dashUserNameEl = document.getElementById("dash-user-name");
      const dashUserEmailEl = document.getElementById("dash-user-email");

      if (dashFirstNameEl) {
        dashFirstNameEl.textContent = first || "Client";
      }
      if (dashUserNameEl) {
        dashUserNameEl.textContent = fullName || "Client Name";
      }
      if (dashUserEmailEl && email) {
        dashUserEmailEl.textContent = email;
      }

      const userNameEl = document.getElementById("user-name");
      const userEmailEl = document.getElementById("user-email");

      if (userNameEl && fullName) {
        userNameEl.textContent = fullName;
      }
      if (userEmailEl && email) {
        userEmailEl.textContent = email;
      }
    } catch (err) {
      console.error("Erreur réseau /me:", err);
    }
  }

  async function loadCustomerState() {
    try {
      const res = await fetch(`${API_BASE}/customer/settings`, {
        headers: { Authorization: "Bearer " + token },
      });

      if (!res.ok) {
        console.error("Erreur chargement /customer/settings:", res.status);
        return;
      }

      const data = await res.json();
      const s = data.settings || {};
      currentSettings = s;

      // Résumé adresse
      const addrSummary = document.getElementById("addresses-summary");
      const userAddressEl = document.getElementById("user-address");
      if (s.address_line && s.address_city) {
        const formatted = `${s.address_line}, ${s.address_city} ${
          s.address_zip || ""
        }`.trim();
        if (addrSummary) addrSummary.textContent = formatted;
        if (userAddressEl) userAddressEl.textContent = formatted;
        profileData.address = formatted;
      }

      // Résumé paiement
      const paySummary = document.getElementById("payments-summary");
      if (paySummary && s.payment_label && s.payment_last4) {
        paySummary.textContent = `${s.payment_label} • **** ${s.payment_last4}`;
      }

      // Préférences nettoyage
      if (document.getElementById("pref-products") && s.pref_products) {
        document.getElementById("pref-products").textContent = s.pref_products;
      }
      if (document.getElementById("pref-pets") && s.pref_pets) {
        document.getElementById("pref-pets").textContent = s.pref_pets;
      }
      if (document.getElementById("pref-language") && s.pref_language) {
        document.getElementById("pref-language").textContent =
          s.pref_language;
      }
      if (document.getElementById("pref-access") && s.pref_access) {
        document.getElementById("pref-access").textContent = s.pref_access;
      }
    } catch (err) {
      console.error("Erreur réseau /customer/settings:", err);
    }
  }

  /* =====================================
   * Modales client : addresses / payments / prefs
   * ===================================== */

  // Addresses
  const btnEditAddresses = document.getElementById("btn-edit-addresses");
  if (btnEditAddresses) {
    btnEditAddresses.addEventListener("click", () => {
      const s = currentSettings || {};
      document.getElementById("addr-line").value = s.address_line || "";
      document.getElementById("addr-city").value = s.address_city || "";
      document.getElementById("addr-zip").value = s.address_zip || "";
      openModal("modal-addresses");
    });
  }

  const btnSaveAddresses = document.getElementById("btn-save-addresses");
  if (btnSaveAddresses) {
    btnSaveAddresses.addEventListener("click", async () => {
      const line = document.getElementById("addr-line").value.trim();
      const city = document.getElementById("addr-city").value.trim();
      const zip = document.getElementById("addr-zip").value.trim();

      const payload = {
        addressLine: line || null,
        addressCity: city || null,
        addressZip: zip || null,
        paymentLabel: currentSettings?.payment_label || null,
        paymentLast4: currentSettings?.payment_last4 || null,
        prefProducts: currentSettings?.pref_products || null,
        prefPets: currentSettings?.pref_pets || null,
        prefLanguage: currentSettings?.pref_language || null,
        prefAccess: currentSettings?.pref_access || null,
      };

      try {
        const res = await fetch(`${API_BASE}/customer/settings`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          console.error("Erreur sauvegarde addresses:", res.status);
          return;
        }

        closeModal("modal-addresses");
        await loadCustomerState();
      } catch (err) {
        console.error("Erreur réseau sauvegarde addresses:", err);
      }
    });
  }

  // Payment
  const btnEditPayments = document.getElementById("btn-edit-payments");
  if (btnEditPayments) {
    btnEditPayments.addEventListener("click", () => {
      const s = currentSettings || {};
      document.getElementById("pay-label").value = s.payment_label || "";
      document.getElementById("pay-last4").value = s.payment_last4 || "";
      openModal("modal-payments");
    });
  }

  const btnSavePayments = document.getElementById("btn-save-payments");
  if (btnSavePayments) {
    btnSavePayments.addEventListener("click", async () => {
      const label = document.getElementById("pay-label").value.trim();
      const last4 = document.getElementById("pay-last4").value.trim();

      const payload = {
        addressLine: currentSettings?.address_line || null,
        addressCity: currentSettings?.address_city || null,
        addressZip: currentSettings?.address_zip || null,
        paymentLabel: label || null,
        paymentLast4: last4 || null,
        prefProducts: currentSettings?.pref_products || null,
        prefPets: currentSettings?.pref_pets || null,
        prefLanguage: currentSettings?.pref_language || null,
        prefAccess: currentSettings?.pref_access || null,
      };

      try {
        const res = await fetch(`${API_BASE}/customer/settings`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          console.error("Erreur sauvegarde payment:", res.status);
          return;
        }

        closeModal("modal-payments");
        await loadCustomerState();
      } catch (err) {
        console.error("Erreur réseau sauvegarde payment:", err);
      }
    });
  }

  // Cleaning preferences
  const btnEditPrefs = document.getElementById("btn-edit-preferences");
  if (btnEditPrefs) {
    btnEditPrefs.addEventListener("click", () => {
      const s = currentSettings || {};
      document.getElementById("form-pref-products").value =
        s.pref_products || "No preference";
      document.getElementById("form-pref-pets").value =
        s.pref_pets || "Not specified";
      document.getElementById("form-pref-language").value =
        s.pref_language || "English";
      document.getElementById("form-pref-access").value =
        s.pref_access || "";
      openModal("modal-preferences");
    });
  }

  const btnSavePrefs = document.getElementById("btn-save-preferences");
  if (btnSavePrefs) {
    btnSavePrefs.addEventListener("click", async () => {
      const prefProducts =
        document.getElementById("form-pref-products").value;
      const prefPets = document.getElementById("form-pref-pets").value;
      const prefLanguage =
        document.getElementById("form-pref-language").value;
      const prefAccess =
        document.getElementById("form-pref-access").value.trim() ||
        "Add door code or special instructions";

      const payload = {
        addressLine: currentSettings?.address_line || null,
        addressCity: currentSettings?.address_city || null,
        addressZip: currentSettings?.address_zip || null,
        paymentLabel: currentSettings?.payment_label || null,
        paymentLast4: currentSettings?.payment_last4 || null,
        prefProducts,
        prefPets,
        prefLanguage,
        prefAccess,
      };

      try {
        const res = await fetch(`${API_BASE}/customer/settings`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          console.error("Erreur sauvegarde prefs:", res.status);
          return;
        }

        closeModal("modal-preferences");
        await loadCustomerState();
      } catch (err) {
        console.error("Erreur réseau sauvegarde prefs:", err);
      }
    });
  }

  /* =====================================
   * Modal profil client (Account details)
   * ===================================== */
  const btnEditProfile = document.getElementById("btn-edit-profile");
  const btnSaveProfile = document.getElementById("btn-save-profile");

  const profileNameInput = document.getElementById("profile-name-input");
  const profileEmailInput = document.getElementById("profile-email-input");
  const profilePhoneInput = document.getElementById("profile-phone-input");
  const profileAddressInput = document.getElementById("profile-address-input");

  if (btnEditProfile) {
    btnEditProfile.addEventListener("click", () => {
      if (profileNameInput) {
        profileNameInput.value = profileData.name || "";
      }
      if (profileEmailInput) {
        profileEmailInput.value = profileData.email || "";
      }
      if (profilePhoneInput) {
        profilePhoneInput.value = profileData.phone || "";
      }
      if (profileAddressInput) {
        profileAddressInput.value =
          profileData.address ||
          document.getElementById("user-address")?.textContent ||
          "";
      }
      openModal("modal-profile");
    });
  }

  if (btnSaveProfile) {
    btnSaveProfile.addEventListener("click", () => {
      const name = profileNameInput ? profileNameInput.value.trim() : "";
      const email = profileEmailInput ? profileEmailInput.value.trim() : "";
      const phone = profilePhoneInput ? profilePhoneInput.value.trim() : "";
      const address = profileAddressInput
        ? profileAddressInput.value.trim()
        : "";

      profileData.name = name || null;
      profileData.email = email || null;
      profileData.phone = phone || null;
      profileData.address = address || null;

      // Mettre à jour la carte "Account details"
      const userNameEl = document.getElementById("user-name");
      const userEmailEl = document.getElementById("user-email");
      const userPhoneEl = document.getElementById("user-phone");
      const userAddressEl = document.getElementById("user-address");

      if (userNameEl) {
        userNameEl.textContent = name || "(not set yet)";
      }
      if (userEmailEl) {
        userEmailEl.textContent = email || "(not set yet)";
      }
      if (userPhoneEl) {
        userPhoneEl.textContent = phone || "(optional)";
      }
      if (userAddressEl) {
        userAddressEl.textContent = address || "(not set yet)";
      }

      // Sidebar + header
      const dashFirstNameEl = document.getElementById("dash-first-name");
      const dashUserNameEl = document.getElementById("dash-user-name");
      const dashUserEmailEl = document.getElementById("dash-user-email");

      if (dashFirstNameEl) {
        const first = name.split(" ")[0] || "Client";
        dashFirstNameEl.textContent = first;
      }
      if (dashUserNameEl) {
        dashUserNameEl.textContent = name || "Client Name";
      }
      if (dashUserEmailEl && email) {
        dashUserEmailEl.textContent = email;
      }

      closeModal("modal-profile");
      // Pour l'instant, profil seulement côté front
    });
  }

  /* =====================================
   * Références DOM (jobs / stats / messages)
   * ===================================== */
  const bookingsListEl = document.getElementById("dash-bookings-list");
  const nextCleaningValueEl = document.getElementById("stat-next-cleaning");
  const nextCleaningMetaEl = document.getElementById("stat-next-cleaning-meta");
  const nextStatusBadgeEl = document.getElementById("dash-next-status");
  const nextDetailsEl = document.getElementById("dash-next-cleaning-details");

  // Stats
  const totalCleaningsEl = document.getElementById("stat-total-cleanings");
  const avgRatingEl = document.getElementById("stat-average-rating");

  // Messagerie
  const convListEl = document.getElementById("conversations-list");
  const convMessagesEl = document.getElementById("conversation-messages");
  const convHeaderEl = document.getElementById("conversation-header");
  const msgFormEl = document.getElementById("message-form");
  const msgInputEl = document.getElementById("message-input");
  const msgStatusEl = document.getElementById("message-status");

  const btnMoreBookings = document.getElementById("btn-more-bookings");
  const MAX_BOOKINGS_SHOWN = 5;
  let allJobs = [];
  let showingAllBookings = false;

  let currentConversationId = null;

  // Jobs déjà notés (persistés en localStorage pour l'UI)
  let ratedJobs;
  try {
    ratedJobs = JSON.parse(localStorage.getItem("ratedJobs") || "[]");
  } catch {
    ratedJobs = [];
  }
  // Normalise tout en string
  ratedJobs = Array.isArray(ratedJobs)
    ? ratedJobs.map((id) => String(id))
    : [];

  function saveRatedJobs() {
    localStorage.setItem("ratedJobs", JSON.stringify(ratedJobs));
  }

  /* =====================================
   * Helpers format date/heure
   * ===================================== */
  function formatJobDateTime(rawDate, rawTime) {
    if (!rawDate) return null;

    const year = Number(String(rawDate).slice(0, 4));
    // on évite les années placeholder (1111, 1970, etc.)
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

  /* =====================================
   * Messagerie : conversations + messages
   * ===================================== */
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
            You have no conversations yet. Once a job is assigned, your chat with your cleaner will appear here.
          </p>
        `;
        return;
      }

      conversations.forEach((c) => {
        // Conteneur de la ligne (nom + poubelle)
        const row = document.createElement("div");
        row.className = "dash-conversation-row";

        const otherName =
          c.cleaner_first_name || c.cleaner_last_name
            ? `${c.cleaner_first_name || ""} ${c.cleaner_last_name || ""}`.trim()
            : c.customer_first_name || c.customer_last_name
            ? `${c.customer_first_name || ""} ${c.customer_last_name || ""}`.trim()
            : "Cleaner";

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

        // Ouvrir la conversation quand on clique sur le bloc principal
        const mainBtn = row.querySelector(".dash-conversation-item");
        mainBtn.addEventListener("click", () => {
          openConversation(c.id, otherName);
        });

        // Supprimer la conversation quand on clique sur la poubelle
        const deleteBtn = row.querySelector(".dash-conversation-delete");
        deleteBtn.addEventListener("click", async (e) => {
          e.stopPropagation(); // ne pas déclencher l'ouverture

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

            // Si on regardait cette conv, on reset l'UI
            if (currentConversationId === c.id) {
              currentConversationId = null;
              if (convHeaderEl) convHeaderEl.textContent = "Conversation";
              if (convMessagesEl) convMessagesEl.innerHTML = "";
              if (msgFormEl) msgFormEl.style.display = "none";
            }

            // Recharger la liste
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
      const res = await fetch(
        `${API_BASE}/conversations/${conversationId}/messages`,
        {
          headers: { Authorization: "Bearer " + token },
        }
      );

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
            No messages yet. Say hi to your cleaner.
          </p>
        `;
        return;
      }

      messages.forEach((m) => {
        const row = document.createElement("div");
        row.className =
          m.sender_role === "customer"
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
          msgStatusEl.textContent =
            "Network error while sending your rating.";
        }
      }
    });
  }

  /* =====================================
   * Render bookings + rating
   * ===================================== */
  function renderBookings(showAll) {
    if (!bookingsListEl) return;

    const jobs = allJobs || [];
    bookingsListEl.innerHTML = "";

    if (!jobs.length) {
      bookingsListEl.innerHTML =
        '<p class="dash-empty">You have no past or future bookings yet.</p>';
      if (btnMoreBookings) btnMoreBookings.style.display = "none";
      return;
    }

    const visible = showAll ? jobs : jobs.slice(0, MAX_BOOKINGS_SHOWN);

    visible.forEach((job) => {
      let responses = [];

      if (job.responses) {
        try {
          responses =
            typeof job.responses === "string"
              ? JSON.parse(job.responses)
              : job.responses;
        } catch {
          responses = [];
        }
      }

      const niceDateTime = formatJobDateTime(job.job_date, job.job_time);
      const dateLine = niceDateTime
        ? `${niceDateTime} · ${job.duration_hours}h`
        : `${job.duration_hours}h`;

      let statusLabel = "Open";
      let statusClass = "dash-status-pill--open";
      let statusDetail = "Waiting for cleaners to respond";

      if (job.status === "assigned" && job.assigned_cleaner_name) {
        const dt = job.assigned_at
          ? new Date(job.assigned_at).toLocaleString()
          : "";
        statusLabel = "Assigned";
        statusClass = "dash-status-pill--assigned";
        statusDetail = `Cleaner: ${job.assigned_cleaner_name}${
          dt ? " • accepted on " + dt : ""
        }`;
      } else if (job.status === "done") {
        statusLabel = "Completed";
        statusClass = "dash-status-pill--done";
        statusDetail = "Visit completed";
      } else if (job.status === "open" && responses.length > 0) {
        statusDetail = "Some cleaners responded";
      }

      let lastResponseText = "";
      if (responses.length > 0) {
        const last = responses[responses.length - 1];
        const when = last.respondedAt
          ? new Date(last.respondedAt).toLocaleString()
          : "";
        const actionText =
          last.response === "accepted"
            ? "accepted your request"
            : "declined your request";
        lastResponseText = `${last.cleanerName} ${actionText}${
          when ? " on " + when : ""
        }`;
      }

      const hasAssignedCleaner = !!job.assigned_cleaner_id;
      const alreadyRated = ratedJobs.includes(String(job.id));

      let ratingBlockHTML = "";
      if (job.status === "done") {
        if (alreadyRated) {
          ratingBlockHTML = `
            <div class="dash-rating-block dash-rating-done" data-job-id="${job.id}">
              <div class="dash-rating-pill">
                <span class="dash-rating-stars">★★★★★</span>
                <span class="dash-rating-score">Review saved</span>
              </div>
              <p class="dash-small-text dash-rating-text">
                You already rated this visit.
              </p>
            </div>
          `;
        } else {
          ratingBlockHTML = `
            <div class="dash-rating-block" data-job-id="${job.id}">
              <div class="dash-booking-meta" style="margin-top:8px;">
                Rate your cleaner:
              </div>
              <div style="display:flex; flex-wrap:wrap; gap:8px; margin-top:4px;">
                <select class="dash-rating-select" style="min-width:90px;">
                  <option value="5">5 - Excellent</option>
                  <option value="4">4 - Good</option>
                  <option value="3">3 - OK</option>
                  <option value="2">2 - Poor</option>
                  <option value="1">1 - Very bad</option>
                </select>
                <button class="btn btn-primary dash-rating-submit" type="button">
                  Submit rating
                </button>
              </div>
              <textarea
                class="dash-rating-comment"
                rows="2"
                placeholder="Add a short comment (optional)"
                style="width:100%; margin-top:6px; resize:vertical; font-size:13px;"
              ></textarea>
              <div class="dash-rating-message" style="font-size:12px; margin-top:4px;"></div>
            </div>
          `;
        }
      }

      const card = document.createElement("div");
      card.className = "dash-booking-card";
      card.innerHTML = `
        <div>
          <div class="dash-booking-main-title">${job.service_type}</div>
          <div class="dash-booking-meta">
            ${dateLine}
          </div>
          <div class="dash-booking-meta">${job.address}</div>
        </div>
        <div class="dash-booking-status">
          <div class="dash-status-pill ${statusClass}">${statusLabel}</div>
          <div class="dash-booking-meta">${statusDetail}</div>
        </div>
        <div class="dash-booking-last-response">
          ${lastResponseText || ""}
        </div>
        <div class="dash-booking-actions">
          ${
            hasAssignedCleaner
              ? `<a class="dash-link-btn"
                     href="Cleaner_Profile.html?cleanerId=${job.assigned_cleaner_id}">
                   View cleaner profile →
                 </a>`
              : ""
          }
        </div>
        ${ratingBlockHTML}
      `;

      bookingsListEl.appendChild(card);

      if (job.status === "done" && !alreadyRated) {
        const ratingBlock = card.querySelector(".dash-rating-block");
        const selectEl = ratingBlock.querySelector(".dash-rating-select");
        const commentEl = ratingBlock.querySelector(".dash-rating-comment");
        const submitBtn = ratingBlock.querySelector(".dash-rating-submit");
        const messageEl = ratingBlock.querySelector(".dash-rating-message");

        submitBtn.addEventListener("click", async () => {
          const rating = Number(selectEl.value);
          const comment = commentEl.value.trim();

          messageEl.style.color = "#6B7280";
          messageEl.textContent = "Sending your review...";

          try {
            const res = await fetch(`${API_BASE}/jobs/${job.id}/rating`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token,
              },
              body: JSON.stringify({ rating, comment }),
            });

            const respData = await res.json().catch(() => ({}));

            if (!res.ok) {
              const errMsg = (respData && respData.error) || "";
              if (errMsg.toLowerCase().includes("déjà noté")) {
                if (!ratedJobs.includes(String(job.id))) {
                  ratedJobs.push(String(job.id));
                  saveRatedJobs();
                }

                ratingBlock.innerHTML = `
                  <div class="dash-rating-done">
                    <div class="dash-rating-pill">
                      <span class="dash-rating-stars">★★★★★</span>
                      <span class="dash-rating-score">Review saved</span>
                    </div>
                    <p class="dash-small-text dash-rating-text">
                      You already rated this visit.
                    </p>
                  </div>
                `;
                return;
              }

              messageEl.style.color = "#B91C1C";
              messageEl.textContent =
                errMsg || "Error while saving your rating.";
              return;
            }

            if (!ratedJobs.includes(String(job.id))) {
              ratedJobs.push(String(job.id));
              saveRatedJobs();
            }

            const fullStars = "★".repeat(Math.max(0, Math.min(5, rating)));
            const emptyStars = "☆".repeat(5 - fullStars.length);

            ratingBlock.innerHTML = `
              <div class="dash-rating-done">
                <div class="dash-rating-pill">
                  <span class="dash-rating-stars">${fullStars}${emptyStars}</span>
                  <span class="dash-rating-score">${rating}.0 / 5</span>
                </div>
                <p class="dash-small-text dash-rating-text">
                  Thanks for rating your cleaner.
                </p>
              </div>
            `;
          } catch (err) {
            console.error("Erreur envoi rating:", err);
            messageEl.style.color = "#B91C1C";
            messageEl.textContent =
              "Network error while sending your rating.";
          }
        });
      }
    });

    // Bouton "Show more bookings"
    if (btnMoreBookings) {
      if (jobs.length > MAX_BOOKINGS_SHOWN) {
        btnMoreBookings.style.display = "inline-flex";
        btnMoreBookings.textContent = showAll
          ? "Show fewer bookings"
          : `Show more bookings (${jobs.length - MAX_BOOKINGS_SHOWN}) →`;
      } else {
        btnMoreBookings.style.display = "none";
      }
    }
  }

  /* =====================================
   * Next cleaning (tuile en haut)
   * ===================================== */
  function updateNextCleaning() {
    if (
      !allJobs.length ||
      !nextCleaningValueEl ||
      !nextCleaningMetaEl ||
      !nextStatusBadgeEl ||
      !nextDetailsEl
    ) {
      return;
    }

    const nextJob = allJobs[0];
    const niceDateTime = formatJobDateTime(
      nextJob.job_date,
      nextJob.job_time
    );

    nextCleaningValueEl.textContent =
      niceDateTime || "Upcoming cleaning scheduled";

    if (nextJob.status === "assigned" && nextJob.assigned_cleaner_name) {
      const dt = nextJob.assigned_at
        ? new Date(nextJob.assigned_at).toLocaleString()
        : "";
      nextStatusBadgeEl.textContent = "Assigned";
      nextCleaningMetaEl.textContent = `Cleaner: ${
        nextJob.assigned_cleaner_name
      }${dt ? " • accepted on " + dt : ""}`;
    } else if (
      nextJob.status === "done" &&
      nextJob.assigned_cleaner_name
    ) {
      nextStatusBadgeEl.textContent = "Completed";
      nextCleaningMetaEl.textContent = `Cleaner: ${nextJob.assigned_cleaner_name}`;
    } else {
      nextStatusBadgeEl.textContent = "Open";
      nextCleaningMetaEl.textContent = "Waiting for cleaners to respond";
    }

    nextDetailsEl.innerHTML = `
      <p>${nextJob.service_type} at ${nextJob.address}</p>
    `;
  }

  if (btnMoreBookings) {
    btnMoreBookings.addEventListener("click", () => {
      showingAllBookings = !showingAllBookings;
      renderBookings(showingAllBookings);
    });
  }

  /* =====================================
   * Stats client (total / moyenne)
   * ===================================== */
  async function loadCustomerStats() {
    if (!totalCleaningsEl && !avgRatingEl) return;

    try {
      const res = await fetch(`${API_BASE}/customer/stats`, {
        headers: { Authorization: "Bearer " + token },
      });

      if (!res.ok) {
        console.error("Erreur chargement /customer/stats:", res.status);
        return;
      }

      const stats = await res.json();

      const total = Number(stats.totalCleanings || 0);
      const avg = stats.avgRating; // peut être null

      if (totalCleaningsEl) totalCleaningsEl.textContent = total;
      if (avgRatingEl) {
        avgRatingEl.textContent =
          avg !== null && avg !== undefined
            ? Number(avg).toFixed(1)
            : "–";
      }
    } catch (err) {
      console.error("Erreur réseau /customer/stats:", err);
    }
  }

  /* =====================================
   * Chargement initial des jobs client
   * ===================================== */
  fetch(`${API_BASE}/customer/jobs`, {
    headers: { Authorization: "Bearer " + token },
  })
    .then((res) => res.json())
    .then((data) => {
      allJobs = data.jobs || [];
      renderBookings(false); // n'affiche que les X premiers
      updateNextCleaning();
      // Les stats sont calculées côté backend, on les charge séparément
      loadCustomerStats();
    })
    .catch((err) => {
      console.error("Erreur chargement jobs client:", err);
    });

  /* =====================================
   * Lancements initiaux
   * ===================================== */
  loadProfileBasic();
  loadCustomerState();
  loadConversations();
  // Au cas où il n'y a pas encore de jobs mais des ratings
  loadCustomerStats();

  // Refresh régulier de la messagerie
  setInterval(() => {
    loadConversations();
    if (currentConversationId) {
      loadMessages(currentConversationId);
    }
  }, 15000);
});
