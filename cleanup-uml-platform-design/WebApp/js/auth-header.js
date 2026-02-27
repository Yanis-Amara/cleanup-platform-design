// js/auth-header.js
document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");

  const helloSpan     = document.getElementById("nav-hello");
  const signInLink    = document.getElementById("nav-sign-in");
  const createLink    = document.getElementById("nav-create-account");
  const logoutLink    = document.getElementById("nav-logout");
  const servicesLink  = document.getElementById("nav-services");   // <a Services>
  const dashboardLink = document.getElementById("nav-dashboard");  // <a Dashboard>

  // Pas de token -> utilisateur non connecté
  if (!token) {
    localStorage.removeItem("role");

    if (helloSpan)     helloSpan.style.display = "none";
    if (logoutLink)    logoutLink.style.display = "none";
    if (servicesLink)  servicesLink.style.display = "inline-flex";
    if (dashboardLink) dashboardLink.style.display = "none"; // cacher Dashboard invité

    // on laisse Sign in / Create account visibles
    return;
  }

  try {
    // Demande à l'API qui est connecté
    const res = await fetch("http://localhost:3000/api/me", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      // Token invalide ou expiré -> on nettoie
      localStorage.removeItem("token");
      localStorage.removeItem("role");

      if (helloSpan)     helloSpan.style.display = "none";
      if (logoutLink)    logoutLink.style.display = "none";
      if (servicesLink)  servicesLink.style.display = "inline-flex";
      if (dashboardLink) dashboardLink.style.display = "none";

      return;
    }

    const data = await res.json();
    const user = data.user || data;

    const first    = user.firstName || user.first_name || "";
    const last     = user.lastName  || user.last_name  || "";
    const fullName = (first + " " + last).trim();

    // Rôle : vient de l'API ou du localStorage
    let role = user.role || localStorage.getItem("role") || "customer";
    localStorage.setItem("role", role);

    // Nom de fichier exact (Dashboard.html / Cleaner_Dashboard.html / Admin_Dashboard.html)
    const path        = window.location.pathname;
    const currentPage = path.substring(path.lastIndexOf("/") + 1);

    // Redirections selon le rôle
    // Admin qui arrive sur Dashboard client -> envoie vers Admin_Dashboard
    if (currentPage === "Dashboard.html" && role === "admin") {
      window.location.href = "Admin_Dashboard.html";
      return;
    }

    // Cleaner sur Dashboard client -> envoie vers Cleaner_Dashboard
    if (currentPage === "Dashboard.html" && role === "cleaner") {
      window.location.href = "Cleaner_Dashboard.html";
      return;
    }

    // Customer sur Cleaner_Dashboard -> renvoie vers Dashboard client
    if (currentPage === "Cleaner_Dashboard.html" && role === "customer") {
      window.location.href = "Dashboard.html";
      return;
    }

    // Admin qui tombe sur Cleaner_Dashboard -> renvoie vers Admin_Dashboard
    if (currentPage === "Cleaner_Dashboard.html" && role === "admin") {
      window.location.href = "Admin_Dashboard.html";
      return;
    }

    // Mise à jour du header connecté
    if (helloSpan) {
      helloSpan.textContent = fullName ? `Hello, ${fullName}` : "Hello";
      helloSpan.style.display = "inline-block";
    }

    if (signInLink) signInLink.style.display = "none";
    if (createLink) createLink.style.display = "none";
    if (logoutLink) logoutLink.style.display = "inline-block";

    // *** LOGIQUE Services ***
    // - role === "cleaner"  -> cacher Services
    // - sinon (customer, admin, etc.) -> montrer Services
    if (servicesLink) {
      servicesLink.style.display =
        role === "cleaner" ? "none" : "inline-flex";
    }

    // *** LOGIQUE Dashboard ***
    // Dashboard visible seulement connecté
    if (dashboardLink) {
      dashboardLink.style.display = "inline-flex";
      // Lien selon le rôle
      if (role === "admin") {
        dashboardLink.href = "Admin_Dashboard.html";
      } else if (role === "cleaner") {
        dashboardLink.href = "Cleaner_Dashboard.html";
      } else {
        dashboardLink.href = "Dashboard.html";
      }
    }

    // Logout global
    if (logoutLink) {
      logoutLink.addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        window.location.href = "Sign_In.html";
      });
    }
  } catch (err) {
    console.error("Erreur auth-header:", err);
  }
});
