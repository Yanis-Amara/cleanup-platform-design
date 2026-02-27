// server.js
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const pool = require("./db");

const app = express();
const PORT = 3000;
const JWT_SECRET = "change_ce_secret_en_prod";

app.use(cors({ origin: "*", credentials: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---------- Inscription ----------
app.post("/api/register", async (req, res) => {
  try {
    const { email, password, firstName, lastName, accountType } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email et mot de passe sont obligatoires." });
    }

    const role = accountType === "cleaner" ? "cleaner" : "customer";

    const conn = await pool.getConnection();

    const [rows] = await conn.query("SELECT id FROM users WHERE email = ?", [
      email,
    ]);
    if (rows.length > 0) {
      conn.release();
      return res
        .status(409)
        .json({ error: "Un compte existe déjà avec cet email." });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    await conn.query(
      "INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES (?, ?, ?, ?, ?)",
      [email, passwordHash, firstName || null, lastName || null, role]
    );

    conn.release();

    return res.json({
      success: true,
      message: "Compte créé avec succès.",
    });
  } catch (err) {
    console.error("Erreur /api/register:", err);
    return res
      .status(500)
      .json({ error: "Erreur serveur lors de l'inscription." });
  }
});

// ---------- Login ----------
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email et mot de passe sont obligatoires." });
    }

    const conn = await pool.getConnection();

    const [rows] = await conn.query(
      "SELECT id, email, password_hash, first_name, last_name, role, active FROM users WHERE email = ?",
      [email]
    );
    conn.release();

    if (rows.length === 0) {
      // Email inconnu
      return res.status(401).json({ error: "Identifiants invalides." });
    }

    const user = rows[0];

    // Vérifier le mot de passe
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: "Identifiants invalides." });
    }

    // Vérifier si le compte est actif
    if (user.active === 0 || user.active === false) {
      return res.status(403).json({
        error:
          "Ce compte est désactivé. Veuillez contacter le support ou envoyer un email au support.",
      });
    }

    // Générer le token JWT
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.json({ success: true, token, role: user.role });
  } catch (err) {
    console.error("Erreur /api/login:", err);
    return res
      .status(500)
      .json({ error: "Erreur serveur lors de la connexion." });
  }
});


// ---------- Middleware JWT ----------
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token manquant." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Token invalide ou expiré." });
  }
}

// ---------- Middleware Admin ----------
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access only." });
  }
  next();
}

// ---------- Helper conversations ----------
async function getOrCreateConversation(conn, customerId, cleanerId) {
  const [rows] = await conn.query(
    `SELECT id FROM conversations
     WHERE customer_id = ? AND cleaner_id = ?`,
    [customerId, cleanerId]
  );

  if (rows.length > 0) {
    return rows[0].id;
  }

  const [result] = await conn.query(
    `INSERT INTO conversations (customer_id, cleaner_id)
     VALUES (?, ?)`,
    [customerId, cleanerId]
  );

  return result.insertId;
}

// ---------- Route protégée ----------
app.get("/api/me", authenticateToken, (req, res) => {
  res.json({
    message: "Utilisateur authentifié.",
    user: req.user,
  });
});

// ---------- Customer settings (adresse / paiement / préférences) ----------

// GET : récupérer les réglages du client connecté
app.get("/api/customer/settings", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "customer") {
      return res
        .status(403)
        .json({ error: "Seuls les clients ont ces réglages." });
    }

    const customerId = req.user.userId;
    const conn = await pool.getConnection();

    const [rows] = await conn.query(
      `SELECT
         address_line,
         address_city,
         address_zip,
         payment_label,
         payment_last4,
         pref_products,
         pref_pets,
         pref_language,
         pref_access
       FROM customer_settings
       WHERE customer_id = ?`,
      [customerId]
    );

    conn.release();

    const settings = rows.length > 0 ? rows[0] : {};
    return res.json({ settings });
  } catch (err) {
    console.error("Erreur GET /api/customer/settings:", err);
    return res.status(500).json({
      error: "Erreur serveur lors du chargement des réglages client.",
    });
  }
});

// POST : créer / mettre à jour les réglages
app.post("/api/customer/settings", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "customer") {
      return res
        .status(403)
        .json({ error: "Seuls les clients peuvent modifier ces réglages." });
    }

    const customerId = req.user.userId;

    const {
      addressLine,
      addressCity,
      addressZip,
      paymentLabel,
      paymentLast4,
      prefProducts,
      prefPets,
      prefLanguage,
      prefAccess,
    } = req.body;

    const conn = await pool.getConnection();

    await conn.query(
      `INSERT INTO customer_settings
       (customer_id, address_line, address_city, address_zip,
        payment_label, payment_last4,
        pref_products, pref_pets, pref_language, pref_access)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
        address_line = VALUES(address_line),
        address_city = VALUES(address_city),
        address_zip = VALUES(address_zip),
        payment_label = VALUES(payment_label),
        payment_last4 = VALUES(payment_last4),
        pref_products = VALUES(pref_products),
        pref_pets = VALUES(pref_pets),
        pref_language = VALUES(pref_language),
        pref_access = VALUES(pref_access)`,
      [
        customerId,
        addressLine || null,
        addressCity || null,
        addressZip || null,
        paymentLabel || null,
        paymentLast4 || null,
        prefProducts || null,
        prefPets || null,
        prefLanguage || null,
        prefAccess || null,
      ]
    );

    const [rows] = await conn.query(
      `SELECT
         address_line,
         address_city,
         address_zip,
         payment_label,
         payment_last4,
         pref_products,
         pref_pets,
         pref_language,
         pref_access
       FROM customer_settings
       WHERE customer_id = ?`,
      [customerId]
    );

    conn.release();

    const settings = rows.length > 0 ? rows[0] : {};
    return res.json({ success: true, settings });
  } catch (err) {
    console.error("Erreur POST /api/customer/settings:", err);
    return res.status(500).json({
      error: "Erreur serveur lors de l'enregistrement des réglages.",
    });
  }
});

// ---------- PROFIL PRO CLEANER ----------

// Récupérer le profil pro du cleaner connecté
app.get("/api/cleaner/profile", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "cleaner") {
      return res
        .status(403)
        .json({ error: "Seuls les nettoyeurs ont un profil professionnel." });
    }

    const conn = await pool.getConnection();
    const [rows] = await conn.query(
      `SELECT first_name, last_name, main_city, experience_years, services_description
       FROM users
       WHERE id = ?`,
      [req.user.userId]
    );
    conn.release();

    if (!rows.length) {
      return res.status(404).json({ error: "Utilisateur introuvable." });
    }

    const u = rows[0];
    return res.json({
      profile: {
        firstName: u.first_name,
        lastName: u.last_name,
        mainCity: u.main_city,
        experienceYears: u.experience_years,
        services: u.services_description,
      },
    });
  } catch (err) {
    console.error("Erreur GET /api/cleaner/profile:", err);
    return res.status(500).json({
      error: "Erreur serveur lors de la récupération du profil.",
    });
  }
});

// Mettre à jour le profil pro du cleaner connecté
app.post("/api/cleaner/profile", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "cleaner") {
      return res
        .status(403)
        .json({ error: "Seuls les nettoyeurs peuvent modifier leur profil." });
    }

    const { firstName, lastName, mainCity, experienceYears, services } =
      req.body;

    const conn = await pool.getConnection();
    await conn.query(
      `UPDATE users
       SET first_name = ?,
           last_name = ?,
           main_city = ?,
           experience_years = ?,
           services_description = ?
       WHERE id = ?`,
      [
        firstName || null,
        lastName || null,
        mainCity || null,
        experienceYears || 0,
        services || null,
        req.user.userId,
      ]
    );

    const [rows] = await conn.query(
      `SELECT first_name, last_name, main_city, experience_years, services_description
       FROM users
       WHERE id = ?`,
      [req.user.userId]
    );
    conn.release();

    const u = rows[0];
    return res.json({
      success: true,
      profile: {
        firstName: u.first_name,
        lastName: u.last_name,
        mainCity: u.main_city,
        experienceYears: u.experience_years,
        services: u.services_description,
      },
    });
  } catch (err) {
    console.error("Erreur POST /api/cleaner/profile:", err);
    return res.status(500).json({
      error: "Erreur serveur lors de l'enregistrement du profil.",
    });
  }
});

// ---------- PROFIL PUBLIC CLEANER (vu par les clients) ----------
// ---------- PROFIL PUBLIC CLEANER (vu par les clients) ----------
app.get("/api/cleaners/:cleanerId/public-profile", async (req, res) => {
  const cleanerId = req.params.cleanerId;

  try {
    const conn = await pool.getConnection();

    const [users] = await conn.query(
      `SELECT
         u.id,
         u.first_name,
         u.last_name,
         u.main_city,
         u.experience_years,
         u.services_description,
         u.average_rating,
         u.rating_count,
         co.service_title,
         co.service_description,
         co.hourly_rate,
         co.min_hours,
         co.service_area
       FROM users u
       LEFT JOIN cleaner_offers co
         ON co.user_id = u.id
       WHERE u.id = ? AND u.role = 'cleaner'`,
      [cleanerId]
    );

    if (!users.length) {
      conn.release();
      return res.status(404).json({ error: "Cleaner introuvable." });
    }

    const [ratings] = await conn.query(
      `SELECT rating, comment, created_at
       FROM cleaner_ratings
       WHERE cleaner_id = ?
       ORDER BY created_at DESC
       LIMIT 20`,
      [cleanerId]
    );

    conn.release();

    return res.json({
      cleaner: users[0],
      reviews: ratings,
    });
  } catch (err) {
    console.error("GET /api/cleaners/:cleanerId/public-profile", err);
    return res.status(500).json({
      error: "Erreur serveur lors du chargement du profil public.",
    });
  }
});


// ---------- OFFRE CLEANER (CRUD simple) ----------

// Récupérer l'offre du cleaner connecté
app.get("/api/cleaner/offer", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "cleaner") {
      return res
        .status(403)
        .json({ error: "Seuls les nettoyeurs ont une offre principale." });
    }

    const conn = await pool.getConnection();
    const [rows] = await conn.query(
      `SELECT service_title, service_description, hourly_rate, min_hours, service_area
       FROM cleaner_offers
       WHERE user_id = ?`,
      [req.user.userId]
    );
    conn.release();

    const offer = rows.length > 0 ? rows[0] : null;
    return res.json({ hasOffer: !!offer, offer });
  } catch (err) {
    console.error("Erreur GET /api/cleaner/offer:", err);
    return res.status(500).json({
      error: "Erreur serveur lors de la récupération de l'offre.",
    });
  }
});

// Créer / mettre à jour l'offre du cleaner connecté
app.post("/api/cleaner/offer", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "cleaner") {
      return res
        .status(403)
        .json({ error: "Seuls les nettoyeurs peuvent modifier leur offre." });
    }

    const {
      serviceTitle,
      serviceDescription,
      servicePrice,
      serviceMinHours,
      serviceArea,
    } = req.body;

    const conn = await pool.getConnection();

    await conn.query(
      `INSERT INTO cleaner_offers
       (user_id, service_title, service_description, hourly_rate, min_hours, service_area)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
        service_title = VALUES(service_title),
        service_description = VALUES(service_description),
        hourly_rate = VALUES(hourly_rate),
        min_hours = VALUES(min_hours),
        service_area = VALUES(service_area)`,
      [
        req.user.userId,
        serviceTitle || null,
        serviceDescription || null,
        servicePrice || null,
        serviceMinHours || null,
        serviceArea || null,
      ]
    );

    const [rows] = await conn.query(
      `SELECT service_title, service_description, hourly_rate, min_hours, service_area
       FROM cleaner_offers
       WHERE user_id = ?`,
      [req.user.userId]
    );
    conn.release();

    const offer = rows.length > 0 ? rows[0] : null;

    return res.json({
      success: true,
      hasOffer: !!offer,
      offer,
    });
  } catch (err) {
    console.error("Erreur POST /api/cleaner/offer:", err);
    return res.status(500).json({
      error: "Erreur serveur lors de l'enregistrement de l'offre.",
    });
  }
});

// ---------- JOBS (demandes clients / notifications cleaners) ----------

// Créer un job quand un client clique sur "Book"
app.post("/api/jobs", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "customer") {
      return res
        .status(403)
        .json({ error: "Seuls les clients peuvent créer une demande de job." });
    }

    const {
      serviceType,
      address,
      jobDate,
      jobTime,
      durationHours,
      notes,
      customerHourlyRate, // <-- nouveau champ
    } = req.body;

    if (!serviceType || !address || !jobDate || !jobTime || !durationHours) {
      return res.status(400).json({
        error: "Tous les champs obligatoires du job ne sont pas remplis.",
      });
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(jobDate)) {
      return res.status(400).json({
        error: "Format de date invalide (attendu YYYY-MM-DD).",
      });
    }

    // Validation simple du prix proposé par le client (optionnel)
    if (
      customerHourlyRate !== undefined &&
      customerHourlyRate !== null &&
      (isNaN(Number(customerHourlyRate)) || Number(customerHourlyRate) <= 0)
    ) {
      return res
        .status(400)
        .json({ error: "Le prix horaire du client doit être un nombre > 0." });
    }

    const conn = await pool.getConnection();

    try {
      const [result] = await conn.query(
        `INSERT INTO jobs
         (customer_id, service_type, address, job_date, job_time,
          duration_hours, notes, status, customer_hourly_rate)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'open', ?)`,
        [
          req.user.userId,
          serviceType,
          address,
          jobDate,
          jobTime,
          durationHours,
          notes || null,
          customerHourlyRate != null ? Number(customerHourlyRate) : null,
        ]
      );

      const jobId = result.insertId;

      const [rows] = await conn.query("SELECT * FROM jobs WHERE id = ?", [
        jobId,
      ]);

      conn.release();

      return res.status(201).json({ job: rows[0] });
    } catch (err) {
      conn.release();
      throw err;
    }
  } catch (err) {
    console.error("Erreur serveur lors de la création du job:", err);
    return res.status(500).json({
      error: "Erreur serveur lors de la création du job.",
    });
  }
});

// Liste des jobs "open" visibles par tous les cleaners
app.get("/api/cleaner/jobs/open", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "cleaner") {
      return res
        .status(403)
        .json({ error: "Seuls les nettoyeurs peuvent voir ces demandes." });
    }

    const cleanerId = req.user.userId;
    const conn = await pool.getConnection();

    const [rows] = await conn.query(
      `SELECT j.*,
              r.response AS my_response
       FROM jobs j
       LEFT JOIN job_responses r
         ON r.job_id = j.id AND r.cleaner_id = ?
       WHERE j.status = 'open'
       ORDER BY j.created_at DESC`,
      [cleanerId]
    );

    conn.release();

    return res.json({ jobs: rows });
  } catch (err) {
    console.error("Erreur serveur lors du chargement des jobs ouverts:", err);
    return res.status(500).json({
      error: "Erreur serveur lors du chargement des jobs ouverts.",
    });
  }
});

// Liste des jobs "assignés" pour le cleaner connecté
app.get("/api/cleaner/jobs/assigned", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "cleaner") {
      return res
        .status(403)
        .json({ error: "Seuls les nettoyeurs peuvent voir leurs jobs assignés." });
    }

    const cleanerId = req.user.userId;
    const conn = await pool.getConnection();

    const [rows] = await conn.query(
      `SELECT *
       FROM jobs
       WHERE assigned_cleaner_id = ?
         AND status IN ('assigned', 'done')
       ORDER BY job_date ASC, job_time ASC`,
      [cleanerId]
    );

    console.log(
      "GET /api/cleaner/jobs/assigned -> cleanerId:",
      cleanerId,
      "jobs:",
      rows.length
    );

    conn.release();
    return res.json({ jobs: rows });
  } catch (err) {
    console.error("Erreur serveur lors du chargement des jobs assignés:", err);
    return res.status(500).json({
      error: "Erreur serveur lors du chargement des jobs assignés.",
    });
  }
});

// ---------- NOUVELLE ROUTE : avis du cleaner connecté ----------
app.get("/api/cleaner/ratings", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "cleaner") {
      return res
        .status(403)
        .json({ error: "Seuls les nettoyeurs peuvent voir leurs avis." });
    }

    const cleanerId = req.user.userId;
    const conn = await pool.getConnection();

    const [rows] = await conn.query(
      `SELECT
         r.rating,
         r.comment,
         r.created_at,
         j.service_type,
         j.job_date,
         j.job_time,
         CONCAT(c.first_name, ' ', c.last_name) AS customer_name
       FROM cleaner_ratings r
       JOIN jobs j ON j.id = r.job_id
       JOIN users c ON c.id = r.customer_id
       WHERE r.cleaner_id = ?
       ORDER BY r.created_at DESC
       LIMIT 20`,
      [cleanerId]
    );

    conn.release();
    return res.json({ reviews: rows });
  } catch (err) {
    console.error("Erreur GET /api/cleaner/ratings:", err);
    return res.status(500).json({
      error: "Erreur serveur lors du chargement des avis.",
    });
  }
});

// ---------- Jobs côté client : voir ses demandes + réponses ----------
app.get("/api/customer/jobs", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "customer") {
      return res
        .status(403)
        .json({ error: "Seuls les clients peuvent voir leurs jobs." });
    }

    const customerId = req.user.userId;
    const conn = await pool.getConnection();

    const [rows] = await conn.query(
      `SELECT
         j.id,
         j.service_type,
         j.address,
         j.job_date,
         j.job_time,
         j.duration_hours,
         j.status,
         j.created_at,
         j.assigned_at,
         j.assigned_cleaner_id,
         CONCAT(c.first_name, ' ', c.last_name) AS assigned_cleaner_name,
         COALESCE(
           JSON_ARRAYAGG(
             JSON_OBJECT(
               'cleanerId', r.cleaner_id,
               'cleanerName', CONCAT(u.first_name, ' ', u.last_name),
               'response', r.response,
               'respondedAt', r.responded_at
             )
           ),
           JSON_ARRAY()
         ) AS responses
       FROM jobs j
       LEFT JOIN job_responses r
         ON r.job_id = j.id
       LEFT JOIN users u
         ON u.id = r.cleaner_id
       LEFT JOIN users c
         ON c.id = j.assigned_cleaner_id
       WHERE j.customer_id = ?
       GROUP BY j.id
       ORDER BY j.created_at DESC`,
      [customerId]
    );

    conn.release();
    return res.json({ jobs: rows });
  } catch (err) {
    console.error("Erreur GET /api/customer/jobs:", err);
    return res.status(500).json({
      error: "Erreur serveur lors du chargement des jobs client.",
    });
  }
});

// ---------- Réponse d'un cleaner à un job ----------
app.post(
  "/api/cleaner/jobs/:jobId/respond",
  authenticateToken,
  async (req, res) => {
    if (req.user.role !== "cleaner") {
      return res
        .status(403)
        .json({ error: "Seuls les nettoyeurs peuvent répondre à un job." });
    }

    const cleanerId = req.user.userId;
    const jobId = req.params.jobId;
    const { action } = req.body; // 'accept' ou 'decline'

    if (!["accept", "decline"].includes(action)) {
      return res.status(400).json({ error: "Action invalide." });
    }

    let conn;
    try {
      conn = await pool.getConnection();
      await conn.beginTransaction();

      const [jobs] = await conn.query(
        "SELECT * FROM jobs WHERE id = ? FOR UPDATE",
        [jobId]
      );

      if (jobs.length === 0) {
        await conn.rollback();
        conn.release();
        return res.status(404).json({ error: "Job introuvable." });
      }

      const job = jobs[0];

      if (job.status !== "open") {
        await conn.rollback();
        conn.release();
        return res
          .status(409)
          .json({ error: "Job déjà pris ou fermé." });
      }

      await conn.query(
        `INSERT INTO job_responses (job_id, cleaner_id, response)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE response = VALUES(response)`,
        [jobId, cleanerId, action === "accept" ? "accepted" : "declined"]
      );

      let conversationId = null;

      if (action === "accept") {
        await conn.query(
          `UPDATE jobs
           SET status = 'assigned',
               assigned_cleaner_id = ?,
               assigned_at = NOW()
           WHERE id = ?`,
          [cleanerId, jobId]
        );

        const customerId = job.customer_id;

        // Crée ou récupère la conversation client <-> cleaner
        conversationId = await getOrCreateConversation(
          conn,
          customerId,
          cleanerId
        );
      }

      await conn.commit();
      conn.release();

      return res.json({ ok: true, action, conversationId });
    } catch (err) {
      if (conn) {
        try {
          await conn.rollback();
          conn.release();
        } catch (e) {
          console.error("Erreur rollback:", e);
        }
      }
      console.error("Erreur serveur lors de la réponse au job:", err);
      return res.status(500).json({
        error: "Erreur serveur lors de la réponse au job.",
      });
    }
  }
);

// ---------- Marquer un job comme terminé (côté cleaner) ----------
app.post(
  "/api/cleaner/jobs/:jobId/complete",
  authenticateToken,
  async (req, res) => {
    if (req.user.role !== "cleaner") {
      return res
        .status(403)
        .json({ error: "Seuls les nettoyeurs peuvent terminer un job." });
    }

    const cleanerId = req.user.userId;
    const jobId = req.params.jobId;

    let conn;
    try {
      conn = await pool.getConnection();
      await conn.beginTransaction();

      const [jobs] = await conn.query(
        `SELECT id, assigned_cleaner_id, status
         FROM jobs
         WHERE id = ? FOR UPDATE`,
        [jobId]
      );

      if (jobs.length === 0) {
        await conn.rollback();
        conn.release();
        return res.status(404).json({ error: "Job introuvable." });
      }

      const job = jobs[0];

      if (job.assigned_cleaner_id !== cleanerId) {
        await conn.rollback();
        conn.release();
        return res.status(403).json({
          error: "Vous ne pouvez terminer que vos propres jobs assignés.",
        });
      }

      if (job.status !== "assigned") {
        await conn.rollback();
        conn.release();
        return res.status(400).json({
          error: "Seuls les jobs en cours (assigned) peuvent être terminés.",
        });
      }

      await conn.query(
        `UPDATE jobs
         SET status = 'done'
         WHERE id = ?`,
        [jobId]
      );

      await conn.commit();
      conn.release();

      return res.json({ success: true });
    } catch (err) {
      if (conn) {
        try {
          await conn.rollback();
          conn.release();
        } catch (e) {
          console.error("Erreur rollback complete:", e);
        }
      }
      console.error("Erreur POST /api/cleaner/jobs/:jobId/complete:", err);
      return res.status(500).json({
        error: "Erreur serveur lors de la complétion du job.",
      });
    }
  }
);

// ---------- NOTES CLIENTS SUR LES CLEANERS ----------
app.post("/api/jobs/:jobId/rating", authenticateToken, async (req, res) => {
  if (req.user.role !== "customer") {
    return res
      .status(403)
      .json({ error: "Seuls les clients peuvent noter un cleaner." });
  }

  const jobId = req.params.jobId;
  const customerId = req.user.userId;
  const rating = Number(req.body.rating);
  const comment = req.body.comment || null;

  if (!rating || rating < 1 || rating > 5) {
    return res
      .status(400)
      .json({ error: "La note doit être un nombre entre 1 et 5." });
  }

  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    const [jobs] = await conn.query(
      `SELECT id, customer_id, assigned_cleaner_id, status
       FROM jobs
       WHERE id = ? FOR UPDATE`,
      [jobId]
    );

    if (!jobs.length) {
      await conn.rollback();
      conn.release();
      return res.status(404).json({ error: "Job introuvable." });
    }

    const job = jobs[0];

    if (job.customer_id !== customerId) {
      await conn.rollback();
      conn.release();
      return res.status(403).json({
        error: "Vous ne pouvez noter que vos propres jobs.",
      });
    }

    if (!job.assigned_cleaner_id) {
      await conn.rollback();
      conn.release();
      return res.status(400).json({
        error: "Aucun cleaner n'est assigné à ce job.",
      });
    }

    if (job.status !== "done") {
      await conn.rollback();
      conn.release();
      return res.status(400).json({
        error: "Vous ne pouvez noter le job qu'une fois terminé.",
      });
    }

    const cleanerId = job.assigned_cleaner_id;

    const [existing] = await conn.query(
      `SELECT id
       FROM cleaner_ratings
       WHERE job_id = ? AND customer_id = ?`,
      [jobId, customerId]
    );

    if (existing.length) {
      await conn.rollback();
      conn.release();
      return res
        .status(409)
        .json({ error: "Vous avez déjà noté ce job." });
    }

    await conn.query(
      `INSERT INTO cleaner_ratings
       (job_id, cleaner_id, customer_id, rating, comment)
       VALUES (?, ?, ?, ?, ?)`,
      [jobId, cleanerId, customerId, rating, comment]
    );

    const [stats] = await conn.query(
      `SELECT AVG(rating) AS avgRating, COUNT(*) AS countRating
       FROM cleaner_ratings
       WHERE cleaner_id = ?`,
      [cleanerId]
    );

    await conn.query(
      `UPDATE users
       SET average_rating = ?,
           rating_count = ?
       WHERE id = ?`,
      [stats[0].avgRating, stats[0].countRating, cleanerId]
    );

    await conn.commit();
    conn.release();

    return res.json({ success: true });
  } catch (err) {
    if (conn) {
      try {
        await conn.rollback();
        conn.release();
      } catch (e) {
        console.error("Erreur rollback rating:", e);
      }
    }
    console.error("Erreur POST /api/jobs/:jobId/rating:", err);
    return res.status(500).json({
      error: "Erreur serveur lors de l'enregistrement de la note.",
    });
  }
});

// ---------- SLOTS PROPOSÉS PAR LES CLEANERS ----------

// Cleaner crée un slot
app.post("/api/cleaner/slots", authenticateToken, async (req, res) => {
  if (req.user.role !== "cleaner") {
    return res.status(403).json({ error: "Only cleaners can create slots" });
  }

  const {
    service_type,
    slot_date,
    slot_time,
    duration_hours,
    address,
    price_total,
  } = req.body;

  if (
    !service_type ||
    !slot_date ||
    !slot_time ||
    !duration_hours ||
    !address ||
    !price_total
  ) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    const conn = await pool.getConnection();
    const [result] = await conn.query(
      `INSERT INTO cleaner_slots
       (cleaner_id, service_type, slot_date, slot_time, duration_hours, address, price_total, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'open')`,
      [
        req.user.userId,
        service_type,
        slot_date,
        slot_time,
        duration_hours,
        address,
        price_total,
      ]
    );
    conn.release();

    res.json({ ok: true, slotId: result.insertId });
  } catch (err) {
    console.error("Error creating slot", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Cleaner voit ses propres slots
app.get("/api/cleaner/slots", authenticateToken, async (req, res) => {
  if (req.user.role !== "cleaner") {
    return res.status(403).json({ error: "Only cleaners can view their slots" });
  }

  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.query(
      `SELECT *
       FROM cleaner_slots
       WHERE cleaner_id = ?
       ORDER BY slot_date, slot_time`,
      [req.user.userId]
    );
    conn.release();

    res.json({ slots: rows });
  } catch (err) {
    console.error("Error fetching cleaner slots", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Client voit les slots ouverts
app.get("/api/customer/slots", authenticateToken, async (req, res) => {
  if (req.user.role !== "customer") {
    return res.status(403).json({ error: "Only customers can view slots" });
  }

  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.query(
      `SELECT s.id, s.service_type, s.slot_date, s.slot_time,
              s.duration_hours, s.address, s.price_total,
              u.first_name, u.last_name, s.cleaner_id
       FROM cleaner_slots s
       JOIN users u ON u.id = s.cleaner_id
       WHERE s.status = 'open'
       ORDER BY s.slot_date, s.slot_time`
    );
    conn.release();

    res.json({ slots: rows });
  } catch (err) {
    console.error("Error fetching slots", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Client accepte un slot -> crée/retourne une conversation
app.post(
  "/api/customer/slots/:id/accept",
  authenticateToken,
  async (req, res) => {
    if (req.user.role !== "customer") {
      return res.status(403).json({ error: "Only customers can accept slots" });
    }

    const slotId = req.params.id;
    const customerId = req.user.userId;

    try {
      const conn = await pool.getConnection();

      const [rows] = await conn.query(
        `SELECT * FROM cleaner_slots WHERE id = ? AND status = 'open'`,
        [slotId]
      );
      if (rows.length === 0) {
        conn.release();
        return res.status(400).json({ error: "Slot not available" });
      }

      const slot = rows[0];
      const cleanerId = slot.cleaner_id;

      const conversationId = await getOrCreateConversation(
        conn,
        customerId,
        cleanerId
      );

      await conn.query(
        `UPDATE cleaner_slots
         SET status = 'accepted', customer_id = ?
         WHERE id = ?`,
        [customerId, slotId]
      );

      conn.release();
      res.json({ ok: true, conversationId });
    } catch (err) {
      console.error("Error accepting slot", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Client refuse un slot
app.post(
  "/api/customer/slots/:id/decline",
  authenticateToken,
  async (req, res) => {
    if (req.user.role !== "customer") {
      return res.status(403).json({ error: "Only customers can decline slots" });
    }

    const slotId = req.params.id;

    try {
      const conn = await pool.getConnection();

      const [rows] = await conn.query(
        `SELECT id, status FROM cleaner_slots WHERE id = ?`,
        [slotId]
      );

      if (!rows.length) {
        conn.release();
        return res.status(404).json({ error: "Slot not found" });
      }

      if (rows[0].status !== "open") {
        conn.release();
        return res.status(400).json({ error: "Slot not available" });
      }

      conn.release();
      res.json({ ok: true });
    } catch (err) {
      console.error("Error declining slot", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// ---------- MESSAGERIE : conversations & messages ----------

// Supprimer une conversation (et ses messages)
app.delete("/api/conversations/:id", authenticateToken, async (req, res) => {
  const convId = req.params.id;
  const userId = req.user.userId;

  try {
    const conn = await pool.getConnection();

    // Vérifier que l'utilisateur appartient bien à cette conversation
    const [convs] = await conn.query(
      `SELECT * FROM conversations
       WHERE id = ?
       AND (customer_id = ? OR cleaner_id = ?)`,
      [convId, userId, userId]
    );

    if (!convs.length) {
      conn.release();
      return res
        .status(403)
        .json({ error: "Not allowed for this conversation" });
    }

    // Si tu n'as pas ON DELETE CASCADE sur messages.conversation_id :
    await conn.query(
      "DELETE FROM messages WHERE conversation_id = ?",
      [convId]
    );

    await conn.query(
      "DELETE FROM conversations WHERE id = ?",
      [convId]
    );

    conn.release();
    return res.json({ success: true });
  } catch (err) {
    console.error("Erreur DELETE /api/conversations/:id:", err);
    return res.status(500).json({ error: "Server error" });
  }
});


// Liste des conversations de l'utilisateur connecté
app.get("/api/conversations", authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const role = req.user.role;

  try {
    const conn = await pool.getConnection();
    let rows;

    if (role === "customer") {
      [rows] = await conn.query(
        `SELECT c.*,
                u.first_name AS cleaner_first_name,
                u.last_name AS cleaner_last_name
         FROM conversations c
         JOIN users u ON u.id = c.cleaner_id
         WHERE c.customer_id = ?`,
        [userId]
      );
    } else if (role === "cleaner") {
      [rows] = await conn.query(
        `SELECT c.*,
                u.first_name AS customer_first_name,
                u.last_name AS customer_last_name
         FROM conversations c
         JOIN users u ON u.id = c.customer_id
         WHERE c.cleaner_id = ?`,
        [userId]
      );
    } else {
      conn.release();
      return res.status(403).json({ error: "Invalid role" });
    }

    conn.release();
    res.json({ conversations: rows });
  } catch (err) {
    console.error("Erreur GET /api/conversations:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Messages d'une conversation
app.get(
  "/api/conversations/:id/messages",
  authenticateToken,
  async (req, res) => {
    const convId = req.params.id;
    const userId = req.user.userId;

    try {
      const conn = await pool.getConnection();

      const [convs] = await conn.query(
        `SELECT * FROM conversations
         WHERE id = ?
           AND (customer_id = ? OR cleaner_id = ?)`,
        [convId, userId, userId]
      );
      if (!convs.length) {
        conn.release();
        return res
          .status(403)
          .json({ error: "Not allowed for this conversation" });
      }

      const [msgs] = await conn.query(
        `SELECT * FROM messages
         WHERE conversation_id = ?
         ORDER BY created_at ASC`,
        [convId]
      );

      conn.release();
      res.json({ messages: msgs });
    } catch (err) {
      console.error("Erreur GET /api/conversations/:id/messages:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Envoyer un message
app.post(
  "/api/conversations/:id/messages",
  authenticateToken,
  async (req, res) => {
    const convId = req.params.id;
    const userId = req.user.userId;
    const role = req.user.role;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: "Message cannot be empty" });
    }

    try {
      const conn = await pool.getConnection();

      const [convs] = await conn.query(
        `SELECT * FROM conversations
         WHERE id = ?
           AND (customer_id = ? OR cleaner_id = ?)`,
        [convId, userId, userId]
      );
      if (!convs.length) {
        conn.release();
        return res
          .status(403)
          .json({ error: "Not allowed for this conversation" });
      }

      await conn.query(
        `INSERT INTO messages (conversation_id, sender_id, sender_role, content)
         VALUES (?, ?, ?, ?)`,
        [convId, userId, role, content.trim()]
      );

      conn.release();
      res.json({ success: true });
    } catch (err) {
      console.error("Erreur POST /api/conversations/:id/messages:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// ---------- EARNINGS CÔTÉ CLEANER ----------
app.get("/api/cleaner/earnings", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "cleaner") {
      return res
        .status(403)
        .json({ error: "Seuls les cleaners ont ces gains." });
    }

    const cleanerId = req.user.userId;
    const conn = await pool.getConnection();

    // Somme des heures * taux client sur les jobs de ce cleaner
    const [rows] = await conn.query(
      `SELECT COALESCE(
          SUM(j.duration_hours * COALESCE(j.customer_hourly_rate, 0)),
          0
        ) AS totalEarnings
       FROM jobs j
       WHERE j.assigned_cleaner_id = ?
         AND j.status = 'done'`,
      [cleanerId]
    );

    conn.release();

    const total = Number(rows[0]?.totalEarnings || 0);
    return res.json({ total });
  } catch (err) {
    console.error("Erreur GET /api/cleaner/earnings:", err);
    return res
      .status(500)
      .json({ error: "Erreur serveur lors du chargement des gains cleaner." });
  }
});



// ---------- STATS CÔTÉ CLIENT (total cleanings / hours / avg rating) ----------
app.get("/api/customer/stats", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "customer") {
      return res
        .status(403)
        .json({ error: "Seuls les clients ont ces statistiques." });
    }

    const customerId = req.user.userId;
    const conn = await pool.getConnection();

    // 1) Total cleanings = tous les jobs terminés
    const [rowsTotal] = await conn.query(
      `SELECT COUNT(*) AS totalCleanings
       FROM jobs
       WHERE customer_id = ? AND status = 'done'`,
      [customerId]
    );

    // 2) Hours booked this year
    const [rowsHours] = await conn.query(
      `SELECT COALESCE(SUM(duration_hours), 0) AS hoursThisYear
       FROM jobs
       WHERE customer_id = ?
         AND YEAR(job_date) = YEAR(CURDATE())`,
      [customerId]
    );

    // 3) Moyenne des notes données par ce client
    const [rowsRating] = await conn.query(
      `SELECT AVG(rating) AS avgRating
       FROM cleaner_ratings
       WHERE customer_id = ?`,
      [customerId]
    );

    conn.release();

    const totalCleanings = rowsTotal[0].totalCleanings || 0;
    const hoursThisYear = rowsHours[0].hoursThisYear || 0;
    const avgRating = rowsRating[0].avgRating; // peut être null

    return res.json({
      totalCleanings,
      hoursThisYear,
      avgRating,
    });
  } catch (err) {
    console.error("Erreur GET /api/customer/stats:", err);
    return res.status(500).json({
      error: "Erreur serveur lors du chargement des statistiques.",
    });
  }
});

// ---------- ADMIN : MEMBER DIRECTORY ----------

// GET /api/admin/users?role=customer|cleaner|all&active=true|false
app.get(
  "/api/admin/users",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    const { role, active } = req.query;

    let where = "1=1";
    const params = [];

    if (role && role !== "all") {
      where += " AND role = ?";
      params.push(role);
    }

    if (typeof active !== "undefined") {
      where += " AND active = ?";
      params.push(active === "true" ? 1 : 0);
    }

    try {
      const conn = await pool.getConnection();
      const [rows] = await conn.query(
        `SELECT
           id,
           email,
           first_name,
           last_name,
           role,
           active,
           created_at,
           average_rating,
           rating_count
         FROM users
         WHERE ${where}
         ORDER BY created_at DESC`,
        params
      );
      conn.release();

      return res.json({ users: rows });
    } catch (err) {
      console.error("GET /api/admin/users:", err);
      return res.status(500).json({
        error: "Erreur serveur lors du chargement des utilisateurs.",
      });
    }
  }
);

// PATCH /api/admin/users/:userId/status  { active: true/false }
app.patch(
  "/api/admin/users/:userId/status",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    const userId = req.params.userId;
    const { active } = req.body;

    if (typeof active === "undefined") {
      return res
        .status(400)
        .json({ error: "Le champ 'active' est requis (true/false)." });
    }

    try {
      const conn = await pool.getConnection();
      const [result] = await conn.query(
        "UPDATE users SET active = ? WHERE id = ?",
        [active ? 1 : 0, userId]
      );
      conn.release();

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Utilisateur introuvable." });
      }

      return res.json({ success: true });
    } catch (err) {
      console.error("PATCH /api/admin/users/:userId/status:", err);
      return res.status(500).json({
        error: "Erreur serveur lors de la mise à jour du statut.",
      });
    }
  }
);

// ---------- ADMIN : CLEANERS + OFFERS ----------

// GET /api/admin/cleaners-with-offers
app.get(
  "/api/admin/cleaners-with-offers",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const conn = await pool.getConnection();
      const [rows] = await conn.query(
        `SELECT
           u.id AS cleaner_id,
           u.first_name,
           u.last_name,
           u.email,
           u.main_city,
           u.average_rating,
           u.rating_count,
           u.active,
           o.id AS offer_id,
           o.service_title,
           o.hourly_rate,
           o.min_hours,
           o.service_area,
           o.status,
           COUNT(j.id) AS jobs_done
         FROM users u
         LEFT JOIN cleaner_offers o
           ON o.user_id = u.id
         LEFT JOIN jobs j
           ON j.assigned_cleaner_id = u.id
          AND j.status = 'done'
         WHERE u.role = 'cleaner'
         GROUP BY
           u.id,
           o.id,
           o.service_title,
           o.hourly_rate,
           o.min_hours,
           o.service_area,
           o.status
         ORDER BY u.created_at DESC`
      );
      conn.release();

      return res.json({ cleaners: rows });
    } catch (err) {
      console.error("GET /api/admin/cleaners-with-offers:", err);
      return res.status(500).json({
        error: "Erreur serveur lors du chargement des cleaners.",
      });
    }
  }
);

// ---------- ADMIN : GLOBAL STATS ----------

app.get("/api/admin/stats", authenticateToken, requireAdmin, async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();

    // Comptes par rôle
    const [userRows] = await conn.query(
      `SELECT
         COUNT(*) AS totalUsers,
         SUM(role = 'customer') AS totalCustomers,
         SUM(role = 'cleaner')  AS totalCleaners,
         SUM(role = 'admin')    AS totalAdmins
       FROM users`
    );
    const userCounts = userRows[0] || {};

    // Jobs créés aujourd'hui
    const [todayRows] = await conn.query(
      `SELECT COUNT(*) AS jobsToday
       FROM jobs
       WHERE DATE(created_at) = CURDATE()`
    );

    // Jobs créés sur les 7 derniers jours
    const [weekRows] = await conn.query(
      `SELECT COUNT(*) AS jobsThisWeek
       FROM jobs
       WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`
    );

    // Jobs par status
    const [statusRows] = await conn.query(
      `SELECT status, COUNT(*) AS countStatus
       FROM jobs
       GROUP BY status`
    );

    let jobsOpen = 0;
    let jobsAssigned = 0;
    let jobsDone = 0;
    statusRows.forEach((r) => {
      if (r.status === "open") jobsOpen = r.countStatus;
      if (r.status === "assigned") jobsAssigned = r.countStatus;
      if (r.status === "done") jobsDone = r.countStatus;
    });

    // Note globale
    const [ratingRows] = await conn.query(
      `SELECT AVG(rating) AS globalAvgRating
       FROM cleaner_ratings`
    );
    const globalAvgRating = ratingRows[0]?.globalAvgRating || null;

    // Top 3 villes les plus actives (par jobs client)
    const [cityRows] = await conn.query(
      `SELECT
         u.main_city AS city,
         COUNT(*)    AS jobsCount
       FROM jobs j
       JOIN users u ON u.id = j.customer_id
       WHERE u.main_city IS NOT NULL AND u.main_city <> ''
       GROUP BY u.main_city
       ORDER BY jobsCount DESC
       LIMIT 3`
    );

    conn.release();
    conn = null;

    return res.json({
      totalUsers: userCounts.totalUsers || 0,
      totalCustomers: userCounts.totalCustomers || 0,
      totalCleaners: userCounts.totalCleaners || 0,
      totalAdmins: userCounts.totalAdmins || 0,
      jobsToday: todayRows[0]?.jobsToday || 0,
      jobsThisWeek: weekRows[0]?.jobsThisWeek || 0,
      jobsOpen,
      jobsAssigned,
      jobsDone,
      globalAvgRating,
      topCities: cityRows,
    });
  } catch (err) {
    if (conn) conn.release();
    console.error("GET /api/admin/stats:", err);
    return res.status(500).json({ error: "Erreur serveur stats admin." });
  }
});

// ---------- ADMIN : JOBS OVERVIEW ----------

app.get("/api/admin/jobs", authenticateToken, requireAdmin, async (req, res) => {
  const { status } = req.query; // 'open' | 'assigned' | 'done' | 'all'
  let where = "1=1";
  const params = [];

  if (status && status !== "all") {
    where += " AND j.status = ?";
    params.push(status);
  }

  let conn;
  try {
    conn = await pool.getConnection();
    const [rows] = await conn.query(
      `SELECT
         j.id,
         j.service_type,
         j.address,
         j.job_date,
         j.job_time,
         j.status,
         j.created_at,
         j.assigned_at,
         j.customer_id,
         j.assigned_cleaner_id,
         CONCAT(c.first_name, ' ', c.last_name)  AS customer_name,
         CONCAT(cl.first_name, ' ', cl.last_name) AS cleaner_name,
         (
           SELECT rating
           FROM cleaner_ratings r
           WHERE r.job_id = j.id
           LIMIT 1
         ) AS customer_rating
       FROM jobs j
       JOIN users c  ON c.id  = j.customer_id
       LEFT JOIN users cl ON cl.id = j.assigned_cleaner_id
       WHERE ${where}
       ORDER BY j.created_at DESC
       LIMIT 100`,
      params
    );
    conn.release();
    conn = null;

    return res.json({ jobs: rows });
  } catch (err) {
    if (conn) conn.release();
    console.error("GET /api/admin/jobs:", err);
    return res.status(500).json({ error: "Erreur serveur jobs admin." });
  }
});



// ---------- LANCEMENT DU SERVEUR ----------
app.listen(PORT, () => {
  console.log(`API démarrée sur http://localhost:${PORT}`);
});
