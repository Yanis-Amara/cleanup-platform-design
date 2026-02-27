document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("login-form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = form.email.value;
    const password = form.password.value;

    try {
      const res = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      // Si le serveur renvoie une erreur HTTP (400/401/500...)
      if (!res.ok) {
        alert("Login failed. Please check your credentials.");
        return;
      }

      const data = await res.json();

      if (data.success) {
        // Le backend renvoie maintenant { success, token, role }
        const role = data.role || "customer";

        // Stocker token + rôle pour le reste du site
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", role);

        // Redirection selon le rôle
        if (role === "admin") {
          window.location.href = "Admin_Dashboard.html";
        } else if (role === "cleaner") {
          window.location.href = "Cleaner_Dashboard.html";
        } else {
          window.location.href = "Dashboard.html";
        }
      } else {
        alert(data.error || "Identifiants invalides.");
      }
    } catch (err) {
      console.error("Login error", err);
      alert("An error occurred while logging in. Please try again later.");
    }
  });
});
