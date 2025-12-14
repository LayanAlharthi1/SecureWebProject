const express = require("express");
const path = require("path");
const crypto = require("crypto");
const db = require("../db");          // shared SQLite connection
const router = express.Router();

// hash password with sha256 
function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}
// *Sanitize text inputs (remove HTML tags)
function sanitizeText(text) {
  return text.replace(/<\/?[^>]+(>|$)/g, "").trim();
}
// GET /register (open the HTML page)
router.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "register.html"));
});

// POST /register (form submit)
router.post("/register", (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // 1) validate required fields
    if (!username || !email || !password) {
      return res.status(400).send("All fields are required.");
    }

    // 2)* Sanitize inputs
    const usernameClean = sanitizeText(username);
    const emailClean = sanitizeText(email);

    // 3) Validate formats

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordPattern =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    const usernamePattern = /^[A-Za-z0-9_]{3,20}$/;

    if (!usernamePattern.test(usernameClean)) {
      res.setHeader("Content-Type", "text/plain");
      return res
        .status(400)
        .send("Username must be 3–20 characters and contain only letters, numbers, or underscores.");
    }

    if (!emailPattern.test(emailClean)) {
      res.setHeader("Content-Type", "text/plain");
      return res.status(400).send("Invalid email format.");
    }

    if (!passwordPattern.test(password)) {
      return res
        .status(400)
        .send(
          "Password must be at least 8 characters and include uppercase, lowercase, number, and special character."
        );
    }
    // 4) hash password
    const passwordHash = hashPassword(password);

    // 5) check if username or email already exist
    db.get(
      "SELECT id FROM users WHERE username = ? OR email = ?",
      [username, email],
      (err, existing) => {
        if (err) {
          console.error("[REGISTER] DB error (check unique):", err);
          return next(err);
        }

        if (existing) {
          return res
            .status(400)
            .send("Username or email is already registered.");
        }

        // 6) insert new user
        db.run(
          "INSERT INTO users (username, email, password) VALUES (?,?,?)",
          [username, email, passwordHash],
          function (err2) {
            if (err2) {
              console.error("[REGISTER] DB error (insert):", err2);
              return next(err2);
            }

            console.log(
              "[REGISTER] New user inserted with id",
              this.lastID
            );
            // after successful registration go to login page
            return res.redirect("/login.html");
          }
        );
      }
    );
  } catch (err) {
    console.error("[REGISTER ERROR]:", err);
    next(err);
  }
});

module.exports = router;
