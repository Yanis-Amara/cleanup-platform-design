// cleaner_profile.js

function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

function buildStars(avg) {
  if (avg == null || Number.isNaN(Number(avg))) {
    return "☆☆☆☆☆";
  }
  const rounded = Math.round(Number(avg));
  let stars = "";
  for (let i = 1; i <= 5; i += 1) {
    stars += i <= rounded ? "★" : "☆";
  }
  return stars;
}

document.addEventListener("DOMContentLoaded", async () => {
  const root = document.getElementById("cleaner-profile-root");
  const cleanerId = getQueryParam("cleanerId");

  if (!cleanerId) {
    root.innerHTML = "<p>Cleaner not found.</p>";
    return;
  }

  try {
    const res = await fetch(
      `http://localhost:3000/api/cleaners/${cleanerId}/public-profile`
    );
    const data = await res.json();

    if (!res.ok) {
      root.innerHTML = `<p>${data.error || "Unable to load this cleaner."}</p>`;
      return;
    }

    const c = data.cleaner || {};
    const reviews = data.reviews || [];

    // --- Infos de base cleaner ---
    const displayName =
      `${c.first_name || ""} ${c.last_name ? c.last_name[0] + "." : ""}`.trim() ||
      "Cleaner";

    const stars = buildStars(c.average_rating);
    const ratingMeta =
      c.rating_count && c.average_rating != null
        ? `${Number(c.average_rating).toFixed(1)} / 5 • ${c.rating_count} review(s)`
        : "No reviews yet";

    const experienceYears =
      c.experience_years != null ? c.experience_years : 0;
    const servicesDesc =
      c.services_description || "Regular, deep clean";
    const mainCity = c.main_city || "(not set yet)";

    // --- Données pour l'offre principale ---
    // on accepte soit data.offer (si tu l'ajoutes côté API)
    // soit les champs directement sur le cleaner (LEFT JOIN cleaner_offers)
    const rawOffer = data.offer || {
      service_title: c.service_title,
      service_description: c.service_description,
      hourly_rate: c.hourly_rate,
      min_hours: c.min_hours,
      service_area: c.service_area,
    };

    const offerTitle =
      rawOffer.serviceTitle ||
      rawOffer.service_title ||
      "Not set";

    const offerArea =
      rawOffer.serviceArea ||
      rawOffer.service_area ||
      "Not set";

    const offerMinVal =
      rawOffer.serviceMinHours != null
        ? rawOffer.serviceMinHours
        : rawOffer.min_hours != null
        ? rawOffer.min_hours
        : null;

    const offerMinHours =
      offerMinVal == null ? "Not set" : offerMinVal;

    const offerPriceVal =
      rawOffer.servicePrice != null
        ? rawOffer.servicePrice
        : rawOffer.service_price != null
        ? rawOffer.service_price
        : rawOffer.hourly_rate != null
        ? rawOffer.hourly_rate
        : null;

    const offerPrice = offerPriceVal != null ? Number(offerPriceVal) : null;

    const offerSummary =
      rawOffer.serviceDescription ||
      rawOffer.service_description ||
      "You haven’t created your main offer yet. Fill in your service details so clients know what you offer.";

    // --- Reviews ---
    let reviewsHtml = "";
    if (reviews.length === 0) {
      reviewsHtml =
        '<p class="dash-small-text">No reviews yet for this cleaner.</p>';
    } else {
      reviewsHtml = reviews
        .map((r) => {
          const dateStr = r.created_at
            ? new Date(r.created_at).toLocaleDateString()
            : "";
          return `
            <article class="dash-review-item">
              <div class="dash-small-text">
                ${buildStars(r.rating)}
                <span style="margin-left:8px;">${dateStr}</span>
              </div>
              <p class="dash-small-text">${r.comment || ""}</p>
            </article>
          `;
        })
        .join("");
    }

    // --- Rendu HTML complet ---
    root.innerHTML = `
      <section class="section">
        <!-- Carte 1 : header du profil -->
        <div class="dash-card">
          <div class="dash-card-header">
            <div>
              <div class="dash-card-title">${displayName}</div>
              <div class="dash-card-subtitle">
                ${
                  c.main_city
                    ? `Based in ${c.main_city}`
                    : "Local cleaner"
                }
              </div>
            </div>
            <div class="dash-small-text">
              ${stars}
              <span style="margin-left:8px;">${ratingMeta}</span>
            </div>
          </div>
          <div class="dash-card-body">
            <p class="dash-small-text">
              Experience: ${experienceYears} years
            </p>
            ${
              servicesDesc
                ? `<p class="dash-small-text" style="margin-top:8px;">${servicesDesc}</p>`
                : ""
            }
          </div>
        </div>

        <div style="height:16px;"></div>

        <!-- Carte 2 : My main offer -->
        <div class="dash-card">
          <div class="dash-card-header">
            <div>
              <div class="dash-card-title">My main offer</div>
              <div class="dash-card-subtitle">
                What customers see on this profile
              </div>
            </div>
            <span class="dash-badge-soft" id="dash-offer-price">
              ${
                offerPrice != null
                  ? `${offerPrice} €/h`
                  : "Not set"
              }
            </span>
          </div>

          <p id="dash-offer-summary" class="dash-small-text">
            ${offerSummary}
          </p>

          <ul class="dash-list">
            <li>
              <span class="dash-list-label">Title</span>
              <span class="dash-list-value" id="dash-offer-title">
                ${offerTitle}
              </span>
            </li>
            <li>
              <span class="dash-list-label">Service area</span>
              <span class="dash-list-value" id="dash-offer-area">
                ${offerArea}
              </span>
            </li>
            <li>
              <span class="dash-list-label">Minimum duration</span>
              <span class="dash-list-value" id="dash-offer-min-hours">
                ${
                  offerMinHours === "Not set"
                    ? "Not set"
                    : offerMinHours + " h"
                }
              </span>
            </li>
          </ul>
        </div>

        <div style="height:16px;"></div>

        <!-- Carte 3 : Professional profile -->
        <div class="dash-card">
          <div class="dash-card-header">
            <div>
              <div class="dash-card-title">Professional profile</div>
              <div class="dash-card-subtitle">
                Public information for clients
              </div>
            </div>
          </div>

          <ul class="dash-list">
            <li>
              <span class="dash-list-label">Name</span>
              <span class="dash-list-value" id="cleaner-profile-name">
                ${displayName}
              </span>
            </li>
            <li>
              <span class="dash-list-label">Main city</span>
              <span class="dash-list-value" id="cleaner-city">
                ${mainCity}
              </span>
            </li>
            <li>
              <span class="dash-list-label">Experience</span>
              <span class="dash-list-value" id="cleaner-experience">
                ${experienceYears} years
              </span>
            </li>
            <li>
              <span class="dash-list-label">Services</span>
              <span class="dash-list-value" id="cleaner-services">
                ${servicesDesc}
              </span>
            </li>
          </ul>
        </div>

        <div style="height:16px;"></div>

        <!-- Carte 4 : Customer reviews -->
        <div class="dash-card">
          <div class="dash-card-header">
            <div class="dash-card-title">Customer reviews</div>
          </div>
          <div class="dash-card-body">
            ${reviewsHtml}
          </div>
        </div>

        <div style="margin-top:16px;">
          <a href="Dashboard.html" class="dash-link-btn">← Back to dashboard</a>
        </div>
      </section>
    `;
  } catch (err) {
    console.error("Erreur chargement profil cleaner:", err);
    root.innerHTML = "<p>Network error while loading cleaner profile.</p>";
  }
});
