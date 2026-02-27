// js/home-role.js
// Choisit la vue Home client ou nettoyeur en fonction du rôle stocké au login.

document.addEventListener("DOMContentLoaded", () => {
  const role = localStorage.getItem("role") || "customer";

  const customerSection = document.getElementById("home-customer");
  const cleanerSection  = document.getElementById("home-cleaner");

  if (!customerSection || !cleanerSection) {
    return;
  }

  if (role === "cleaner") {
    // Vue nettoyeur : proposer ses services
    customerSection.style.display = "none";
    cleanerSection.style.display  = "block";
  } else {
    // Vue client : réserver un nettoyage
    customerSection.style.display = "block";
    cleanerSection.style.display  = "none";
  }
});
