// register.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("register-form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault(); // empêche le rechargement de la page

    // Récupération des champs du formulaire
    const firstName   = form.firstName.value;
    const lastName    = form.lastName.value;
    const email       = form.email.value;
    const password    = form.password.value;
    const accountType = form.accountType.value; // <= ICI

    try {
      const res = await fetch("http://localhost:3000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, password, accountType })
        // ---------------------------------------------^^^^^^^^^^^^
      });

      const data = await res.json();
      if (data.success) {
        alert("Compte créé, tu peux te connecter.");
        window.location.href = "Sign_In.html";
      } else {
        alert(data.error || "Erreur lors de l'inscription.");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur réseau.");
    }
  });
});
