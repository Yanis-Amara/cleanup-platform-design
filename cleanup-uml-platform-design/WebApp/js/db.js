const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "localhost",
  port: 3306,                // même port que ta connexion Workbench
  user: "cleanup_user",
  password: "Cleanup123!",
  database: "cleanup_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
