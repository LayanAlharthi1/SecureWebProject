const express = require("express");
const path = require("path");
const crypto = require("crypto");
const db = require("../db");          // <-- shared SQLite connection
const router = express.Router();

// hash password with sha256 (same as before)
function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// GET /register (open the HTML page)
router.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "register.html"));
});

// POST /register (form submit)
router.post("/register", (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // 1) validate inputs
    if (!username || !email || !password) {
      return res.status(400).send("All fields are required.");
    }

    const passwordPattern =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (!passwordPattern.test(password)) {
      return res
        .status(400)
        .send(
          "Password must be at least 8 characters and include uppercase, lowercase, number, and special character."
        );
    }

    const passwordHash = hashPassword(password);

    // 2) check if username or email already exist
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

        // 3) insert new user
        db.run(
          "INSERT INTO users (username, email, password) VALUES (?,?,?)",
          [username, email, passwordHash],
          function (err2) {
            if (err2) {
              console.error("[REGISTER] DB error (insert):", err2);
              return next(err2);
            }

            console.log(
              "✅ [REGISTER] New user inserted with id",
              this.lastID
            );
            // after successful registration go to login page
            return res.redirect("/login.html");
          }
        );
      }
    );
  } catch (err) {
    console.error("💥 [REGISTER ERROR]:", err);
    next(err);
  }
});

module.exports = router;
