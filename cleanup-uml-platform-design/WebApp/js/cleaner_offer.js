// js/cleaner_offer.js
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const role  = localStorage.getItem("role");

  // On ne fait rien si pas connecté ou pas cleaner
  if (!token || role !== "cleaner") return;

  const form = document.getElementById("cleaner-offer-form");
  if (!form) {
    console.log("Formulaire cleaner-offer-form non trouvé");
    return;
  }

  // Quand tu cliques sur "Save my offer"
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      serviceTitle:       document.getElementById("service-title").value,
      serviceDescription: document.getElementById("service-description").value,
      servicePrice:       document.getElementById("service-price").value,
      serviceMinHours:    document.getElementById("service-min-hours").value,
      serviceArea:        document.getElementById("service-area").value,
    };

    console.log("Payload envoyé à l'API :", payload);

    try {
      const res = await fetch("http://localhost:3000/api/cleaner/offer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const txt = await res.text();
        console.error("Erreur API /api/cleaner/offer :", res.status, txt);
        alert("Erreur en sauvegardant l'offre.");
        return;
      }

      const data = await res.json();
      console.log("Offre sauvegardée :", data.offer);
      alert("Your main offer has been saved ✅");
    } catch (err) {
      console.error("Erreur JS:", err);
      alert("Erreur réseau en sauvegardant l'offre.");
    }
  });
});
