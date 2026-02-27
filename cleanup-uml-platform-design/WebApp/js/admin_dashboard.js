// js/admin_dashboard.js
document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
  
    if (!token) {
      window.location.href = "Sign_In.html";
      return;
    }
  
    if (role !== "admin") {
      alert("Admin access only.");
      window.location.href = "Dashboard.html";
      return;
    }
  
    // --- Navigation sidebar (Members / Cleaners / Jobs) ---
    const navLinks = document.querySelectorAll(".dash-nav-link");
    const sectionMembers = document.getElementById("section-members");
    const sectionCleaners = document.getElementById("section-cleaners");
    const sectionJobs = document.getElementById("section-jobs");
  
    const adminSections = {
      members: sectionMembers,
      cleaners: sectionCleaners,
      jobs: sectionJobs,
    };
  
    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        // état visuel dans la sidebar
        navLinks.forEach((l) => l.classList.remove("active"));
        link.classList.add("active");
  
        // scroll vers la bonne carte
        const key = link.dataset.section;
        const target = adminSections[key];
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });
  
    // Références DOM principales
    const membersBody = document.getElementById("admin-members-body");
    const cleanersBody = document.getElementById("admin-cleaners-body");
    const jobsBody = document.getElementById("admin-jobs-body");
  
    const adminNameEl = document.getElementById("admin-name");
    const adminEmailEl = document.getElementById("admin-email");
    const adminAvatarEl = document.getElementById("admin-avatar");
    const logoutBtn = document.getElementById("nav-logout");
  
    const btnAll = document.getElementById("filter-role-all");
    const btnCustomers = document.getElementById("filter-role-customers");
    const btnCleaners = document.getElementById("filter-role-cleaners");
  
    const memberSearchInput = document.getElementById("member-search");
  
    // Stats cards
    const statUsersTotal = document.getElementById("stat-users-total");
    const statUsersBreakdown = document.getElementById("stat-users-breakdown");
    const statJobsMain = document.getElementById("stat-jobs-main");
    const statJobsMeta = document.getElementById("stat-jobs-meta");
    const statQualityRating = document.getElementById("stat-quality-rating");
    const statQualityCities = document.getElementById("stat-quality-cities");
  
    // Filtres jobs overview
    const btnJobsAll = document.getElementById("filter-jobs-all");
    const btnJobsOpen = document.getElementById("filter-jobs-open");
    const btnJobsAssigned = document.getElementById("filter-jobs-assigned");
    const btnJobsDone = document.getElementById("filter-jobs-done");
  
    // Detail pane elements
    const detailAvatar = document.getElementById("detail-avatar");
    const detailName = document.getElementById("detail-name");
    const detailEmail = document.getElementById("detail-email");
    const detailGrid = document.getElementById("detail-grid");
    const detailRole = document.getElementById("detail-role");
    const detailId = document.getElementById("detail-id");
    const detailCreated = document.getElementById("detail-created");
    const detailStatus = document.getElementById("detail-status");
    const detailRating = document.getElementById("detail-rating");
    const detailRatingCount = document.getElementById("detail-rating-count");
    const detailFooter = document.getElementById("detail-footer");
    const detailOpenCleaner = document.getElementById("detail-open-cleaner");
    const detailToggleActive = document.getElementById("detail-toggle-active");
  
    let currentRoleFilter = "all";
    let selectedUser = null;
    let selectedRow = null;
    let currentMembers = [];
    let currentJobsStatus = "all";
  
    // Charge info admin (via /api/me)
    fetch("http://localhost:3000/api/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data) => {
        const user = data.user || data;
        const first = user.firstName || user.first_name || "";
        const last = user.lastName || user.last_name || "";
        const full = (first + " " + last).trim() || "Admin";
        const email = user.email || "";
  
        if (adminNameEl) adminNameEl.textContent = full;
        if (adminEmailEl) adminEmailEl.textContent = email;
        if (adminAvatarEl) adminAvatarEl.textContent = full.charAt(0).toUpperCase();
      })
      .catch((err) => {
        console.error("Error loading admin me:", err);
      });
  
    // Logout
    if (logoutBtn) {
      logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        window.location.href = "Sign_In.html";
      });
    }
  
    // Helpers
    function formatDate(value) {
      if (!value) return "-";
      const d = new Date(value);
      if (isNaN(d)) return value;
      return d.toLocaleDateString();
    }
  
    function formatJobDateTime(rawDate, rawTime) {
      if (!rawDate) return "—";
      if (!rawTime) return rawDate;
      return `${rawDate} ${rawTime}`;
    }
  
    function formatRating(avg, count) {
      if (!avg || !count) return "—";
      return `${Number(avg).toFixed(2)}★ (${count})`;
    }
  
    function buildRoleBadge(role) {
      const base = "dash-badge-role";
      if (role === "cleaner") return `${base} dash-badge-role--cleaner`;
      if (role === "admin") return `${base} dash-badge-role--admin`;
      return base;
    }
  
    function setRoleFilterActive(target) {
      [btnAll, btnCustomers, btnCleaners].forEach((b) => {
        if (!b) return;
        b.classList.remove("admin-pill-filter--active");
      });
      if (target) target.classList.add("admin-pill-filter--active");
    }
  
    function setJobsFilterActive(target) {
      [btnJobsAll, btnJobsOpen, btnJobsAssigned, btnJobsDone].forEach((b) => {
        if (!b) return;
        b.classList.remove("admin-pill-filter--active");
      });
      if (target) target.classList.add("admin-pill-filter--active");
    }
  
    // -------- Members table + search + detail panel --------
  
    function applyMemberSearch(users) {
      if (!memberSearchInput) return users;
      const q = memberSearchInput.value.trim().toLowerCase();
      if (!q) return users;
      return users.filter((u) => {
        const name = `${u.first_name || ""} ${u.last_name || ""}`.toLowerCase();
        const email = (u.email || "").toLowerCase();
        return name.includes(q) || email.includes(q);
      });
    }
  
    function renderMembers(users) {
      if (!membersBody) return;
  
      const list = applyMemberSearch(users);
  
      if (!list || list.length === 0) {
        membersBody.innerHTML =
          `<tr><td colspan="8" class="admin-empty">No members found.</td></tr>`;
        return;
      }
  
      membersBody.innerHTML = "";
      list.forEach((u) => {
        const tr = document.createElement("tr");
        const isActive = u.active === 1 || u.active === true;
  
        tr.classList.add("admin-row-clickable");
        tr.dataset.userId = u.id;
        tr.dataset.role = u.role;
  
        tr.innerHTML = `
          <td>${u.id}</td>
          <td>
            <strong>${u.first_name || ""} ${u.last_name || ""}</strong><br>
            <span class="admin-tag">${u.email}</span>
          </td>
          <td>
            <span class="${buildRoleBadge(u.role)}">${u.role}</span>
          </td>
          <td>${formatDate(u.created_at)}</td>
          <td>${formatRating(u.average_rating, u.rating_count)}</td>
          <td>
            <span class="${
              isActive ? "admin-pill-active" : "admin-pill-inactive"
            }">${isActive ? "Active" : "Disabled"}</span>
          </td>
          <td>
            <button
              class="admin-action-btn ${isActive ? "admin-action-btn--danger" : ""}"
              data-user-id="${u.id}"
              data-active="${isActive ? "1" : "0"}"
            >
              ${isActive ? "Deactivate" : "Activate"}
            </button>
          </td>
          <td>
            <span class="admin-tag">id:${u.id} · ${u.role}</span>
          </td>
        `;
        membersBody.appendChild(tr);
      });
    }
  
    function renderCleaners(rows) {
      if (!cleanersBody) return;
  
      if (!rows || rows.length === 0) {
        cleanersBody.innerHTML =
          `<tr><td colspan="9" class="admin-empty">No cleaners found.</td></tr>`;
        return;
      }
  
      cleanersBody.innerHTML = "";
      rows.forEach((r) => {
        const ratingText = formatRating(r.average_rating, r.rating_count);
        const offerStatus = r.status || "—";
  
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>
            ${r.first_name || ""} ${r.last_name || ""}<br>
            <span class="admin-tag">${r.email}</span>
          </td>
          <td>${r.main_city || "—"}</td>
          <td>${ratingText}</td>
          <td>${r.service_title || "—"}</td>
          <td>${r.hourly_rate != null ? r.hourly_rate + " €/h" : "—"}</td>
          <td>${r.min_hours != null ? r.min_hours : "—"}</td>
          <td>${r.service_area || "—"}</td>
          <td><span class="admin-tag">${offerStatus}</span></td>
          <td>${r.jobs_done != null ? r.jobs_done : "—"} / ${
          r.rating_count != null ? r.rating_count : "0"
        }</td>
        `;
        cleanersBody.appendChild(tr);
      });
    }
  
    function loadMembers(roleFilter = "all") {
      const url = "http://localhost:3000/api/admin/users?role=" + roleFilter;
      fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : Promise.reject(res)))
        .then((data) => {
          currentMembers = data.users || [];
          renderMembers(currentMembers);
        })
        .catch((err) => {
          console.error("Error loading users:", err);
          if (membersBody) {
            membersBody.innerHTML =
              `<tr><td colspan="8" class="admin-empty">Error while loading users.</td></tr>`;
          }
        });
    }
  
    function loadCleaners() {
      fetch("http://localhost:3000/api/admin/cleaners-with-offers", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : Promise.reject(res)))
        .then((data) => {
          renderCleaners(data.cleaners || []);
        })
        .catch((err) => {
          console.error("Error loading cleaners:", err);
          if (cleanersBody) {
            cleanersBody.innerHTML =
              `<tr><td colspan="9" class="admin-empty">Error while loading cleaners.</td></tr>`;
          }
        });
    }
  
    function updateDetailPane(user) {
      selectedUser = user;
  
      if (!user) {
        detailName.textContent = "Select a member";
        detailEmail.textContent = "Click on a row to inspect details.";
        detailGrid.style.display = "none";
        detailFooter.textContent =
          "Select a member in the table to see their account summary.";
        detailOpenCleaner.style.display = "none";
        detailToggleActive.style.display = "none";
        return;
      }
  
      const fullName = (user.first_name || "") + " " + (user.last_name || "");
      const firstLetter = fullName.trim().charAt(0).toUpperCase() || "U";
      detailAvatar.textContent = firstLetter;
      detailName.textContent = fullName || "Unnamed user";
      detailEmail.textContent = user.email || "";
  
      detailRole.textContent = user.role;
      detailId.textContent = user.id;
      detailCreated.textContent = formatDate(user.created_at);
      detailStatus.textContent =
        user.active === 1 || user.active === true ? "Active" : "Disabled";
      detailRating.textContent =
        user.average_rating != null
          ? Number(user.average_rating).toFixed(2) + " / 5"
          : "—";
      detailRatingCount.textContent =
        user.rating_count != null ? user.rating_count : "—";
  
      detailGrid.style.display = "grid";
      detailFooter.textContent =
        user.role === "cleaner"
          ? "This member offers cleaning services. You can open their public profile."
          : "This member is a customer on the platform.";
  
      // Bouton profil cleaner
      if (user.role === "cleaner") {
        detailOpenCleaner.style.display = "inline-flex";
        detailOpenCleaner.onclick = () => {
          window.open(`Cleaner_Profile.html?cleanerId=${user.id}`, "_blank");
        };
      } else {
        detailOpenCleaner.style.display = "none";
        detailOpenCleaner.onclick = null;
      }
  
      // Bouton activer/désactiver depuis le panneau
      detailToggleActive.style.display = "inline-flex";
      const isActive = user.active === 1 || user.active === true;
      detailToggleActive.textContent = isActive ? "Deactivate" : "Activate";
      detailToggleActive.classList.toggle("admin-action-btn--danger", isActive);
      detailToggleActive.onclick = () => {
        toggleUserActive(user.id, !isActive);
      };
    }
  
    function toggleUserActive(userId, newActive) {
      fetch(`http://localhost:3000/api/admin/users/${userId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ active: newActive }),
      })
        .then((res) => (res.ok ? res.json() : Promise.reject(res)))
        .then(() => {
          loadMembers(currentRoleFilter);
        })
        .catch((err) => {
          console.error("Error updating user status:", err);
          alert("Error while updating user status.");
        });
    }
  
    // Click sur boutons + lignes du tableau membres
    if (membersBody) {
      membersBody.addEventListener("click", (e) => {
        const btn = e.target.closest("button[data-user-id]");
        if (btn) {
          e.stopPropagation();
          const userId = btn.getAttribute("data-user-id");
          const isActive = btn.getAttribute("data-active") === "1";
          toggleUserActive(userId, !isActive);
          return;
        }
  
        const row = e.target.closest("tr[data-user-id]");
        if (!row) return;
  
        if (selectedRow) selectedRow.classList.remove("admin-row-selected");
        selectedRow = row;
        selectedRow.classList.add("admin-row-selected");
  
        const userIdNum = Number(row.dataset.userId);
  
        const nameCell = row.children[1];
        const nameLine = nameCell.querySelector("strong")?.textContent || "";
        const emailText = nameCell.querySelector(".admin-tag")?.textContent || "";
        const roleText = row.children[2].innerText.trim();
        const createdText = row.children[3].innerText.trim();
        const statusText = row.children[5].innerText.includes("Active")
          ? "Active"
          : "Disabled";
  
        const user = {
          id: userIdNum,
          first_name: nameLine.split(" ")[0] || "",
          last_name: nameLine.split(" ").slice(1).join(" "),
          email: emailText,
          role: roleText,
          created_at: createdText,
          active: statusText === "Active",
          average_rating: null,
          rating_count: null,
        };
  
        updateDetailPane(user);
      });
    }
  
    // Filtres membres
    if (btnAll) {
      btnAll.addEventListener("click", () => {
        currentRoleFilter = "all";
        setRoleFilterActive(btnAll);
        loadMembers("all");
      });
    }
    if (btnCustomers) {
      btnCustomers.addEventListener("click", () => {
        currentRoleFilter = "customer";
        setRoleFilterActive(btnCustomers);
        loadMembers("customer");
      });
    }
    if (btnCleaners) {
      btnCleaners.addEventListener("click", () => {
        currentRoleFilter = "cleaner";
        setRoleFilterActive(btnCleaners);
        loadMembers("cleaner");
      });
    }
  
    // Recherche sur les membres
    if (memberSearchInput) {
      memberSearchInput.addEventListener("input", () => {
        renderMembers(currentMembers);
      });
    }
  
    // -------- Stats admin (/api/admin/stats) --------
  
    function loadAdminStats() {
      fetch("http://localhost:3000/api/admin/stats", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : Promise.reject(res)))
        .then((stats) => {
          if (statUsersTotal) {
            statUsersTotal.textContent = stats.totalUsers ?? 0;
          }
          if (statUsersBreakdown) {
            const customers = stats.totalCustomers ?? 0;
            const cleaners = stats.totalCleaners ?? 0;
            const admins = stats.totalAdmins ?? 0;
            statUsersBreakdown.textContent = `${customers} customers · ${cleaners} cleaners · ${admins} admins`;
          }
  
          if (statJobsMain) {
            const totalJobs =
              (stats.jobsOpen || 0) +
              (stats.jobsAssigned || 0) +
              (stats.jobsDone || 0);
            statJobsMain.textContent = totalJobs;
          }
          if (statJobsMeta) {
            const today = stats.jobsToday || 0;
            const week = stats.jobsThisWeek || 0;
            statJobsMeta.textContent = `${today} today · ${week} last 7 days`;
          }
  
          if (statQualityRating) {
            const avg = stats.globalAvgRating;
            statQualityRating.textContent =
              avg != null ? Number(avg).toFixed(1) + "/5" : "—";
          }
          if (statQualityCities) {
            const cities = stats.topCities || [];
            if (!cities.length) {
              statQualityCities.textContent = "No city data yet.";
            } else {
              const text = cities
                .map((c) => `${c.city} (${c.jobsCount})`)
                .join(" • ");
              statQualityCities.textContent = text;
            }
          }
        })
        .catch((err) => {
          console.error("Error loading admin stats:", err);
          if (statUsersBreakdown)
            statUsersBreakdown.textContent = "Error while loading stats.";
          if (statJobsMeta)
            statJobsMeta.textContent = "Error while loading jobs data.";
          if (statQualityCities)
            statQualityCities.textContent = "Error while loading city data.";
        });
    }
  
    // -------- Jobs overview (/api/admin/jobs) --------
  
    function renderJobs(jobs) {
      if (!jobsBody) return;
  
      if (!jobs || jobs.length === 0) {
        jobsBody.innerHTML =
          `<tr><td colspan="6" class="admin-empty">No jobs found.</td></tr>`;
        return;
      }
  
      jobsBody.innerHTML = "";
      jobs.forEach((j) => {
        const tr = document.createElement("tr");
        const dateText = formatJobDateTime(j.job_date, j.job_time);
        const ratingText =
          j.customer_rating != null ? j.customer_rating.toFixed(1) + "/5" : "—";
  
        tr.innerHTML = `
          <td>${j.id}</td>
          <td>${j.customer_name || "—"}</td>
          <td>${j.cleaner_name || "—"}</td>
          <td>${dateText}</td>
          <td>${j.status}</td>
          <td>${ratingText}</td>
        `;
        jobsBody.appendChild(tr);
      });
    }
  
    function loadAdminJobs(status = "all") {
      let url = "http://localhost:3000/api/admin/jobs";
      if (status && status !== "all") {
        url += `?status=${encodeURIComponent(status)}`;
      }
  
      fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : Promise.reject(res)))
        .then((data) => {
          renderJobs(data.jobs || []);
        })
        .catch((err) => {
          console.error("Error loading admin jobs:", err);
          if (jobsBody) {
            jobsBody.innerHTML =
              `<tr><td colspan="6" class="admin-empty">Error while loading jobs.</td></tr>`;
          }
        });
    }
  
    // Filtres jobs overview
    if (btnJobsAll) {
      btnJobsAll.addEventListener("click", () => {
        currentJobsStatus = "all";
        setJobsFilterActive(btnJobsAll);
        loadAdminJobs("all");
      });
    }
    if (btnJobsOpen) {
      btnJobsOpen.addEventListener("click", () => {
        currentJobsStatus = "open";
        setJobsFilterActive(btnJobsOpen);
        loadAdminJobs("open");
      });
    }
    if (btnJobsAssigned) {
      btnJobsAssigned.addEventListener("click", () => {
        currentJobsStatus = "assigned";
        setJobsFilterActive(btnJobsAssigned);
        loadAdminJobs("assigned");
      });
    }
    if (btnJobsDone) {
      btnJobsDone.addEventListener("click", () => {
        currentJobsStatus = "done";
        setJobsFilterActive(btnJobsDone);
        loadAdminJobs("done");
      });
    }
  
    // Chargement initial
    loadMembers("all");
    loadCleaners();
    loadAdminStats();
    loadAdminJobs("all");
  });
  