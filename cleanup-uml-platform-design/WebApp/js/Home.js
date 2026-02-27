// home.js

document.addEventListener("DOMContentLoaded", () => {
  /* ==========================
   * 1. Tag toggle functionality
   * ========================== */
  document.querySelectorAll(".tag").forEach((tag) => {
    tag.addEventListener("click", () => {
      tag.classList.toggle("active");
    });
  });

  /* =======================================
   * 2. Smooth scroll for in-page anchor links
   * ======================================= */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  /* ==================================
   * 3. Booking form -> POST /api/jobs
   * ================================== */
  const bookingForm = document.querySelector(".card.booking form");

  if (bookingForm) {
    bookingForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const token = localStorage.getItem("token");
      const role  = localStorage.getItem("role");

      // L'utilisateur doit être connecté comme "customer"
      if (!token || role !== "customer") {
        alert("You must be signed in as a customer to book.");
        window.location.href = "Sign_In.html";
        return;
      }

      const serviceType        = document.getElementById("type").value;
      const address            = document.getElementById("address").value;
      const jobDate            = document.getElementById("date").value;
      const jobTime            = document.getElementById("time").value;
      const durationHours      = document.getElementById("duration").value;
      const notes              = document.getElementById("notes").value;
      const customerHourlyRate = document.getElementById("customer-price").value;

      try {
        const res = await fetch("http://localhost:3000/api/jobs", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify({
            serviceType,
            address,
            jobDate,
            jobTime,
            durationHours,
            notes,
            // nouveau champ envoyé au backend
            customerHourlyRate: customerHourlyRate ? Number(customerHourlyRate) : null,
          }),
        });

        if (!res.ok) {
          const txt = await res.text();
          console.error("API error /api/jobs:", res.status, txt);
          alert("Error while creating the job.");
          return;
        }

        const data = await res.json();
        console.log("Job created:", data.job);
        alert("Your request has been sent. Cleaners will see it in their dashboard.");
        // Optionnel : rediriger
        // window.location.href = "Dashboard.html";
      } catch (err) {
        console.error("Network error /api/jobs:", err);
        alert("Network error while creating the job.");
      }
    });
  }
});
