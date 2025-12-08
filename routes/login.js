const express = require("express");
const router = express.Router();
const session = require("../session");
const crypto = require("crypto");
const db = require("../db");             // use the shared SQLite connection

// same hashing as in register.js
function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// POST /login – handle login form
router.post("/login", (req, res, next) => {
  try {
    const { username, password } = req.body;

    // 1) Basic validation
    if (!username || !password) {
      return res.status(400).send("Username and password are required.");
    }

    // 2) Look up user in DB
    db.get(
      "SELECT id, username, password FROM users WHERE username = ?",
      [username],
      (err, user) => {
        if (err) {
          console.error("💥 [LOGIN DB ERROR]:", err);
          return next(err); // goes to global error handler in server.js
        }

        if (!user) {
          // No such username
          return res.status(401).send("Invalid username or password");
        }

        // 3) Compare hashed passwords
        const passwordHash = hashPassword(password);

        if (user.password !== passwordHash) {
          return res.status(401).send("Invalid username or password");
        }

        // 4) Create session
        const sessionId = session.createSession(user.id);

        res.setHeader(
          "Set-Cookie",
          `sessionId=${sessionId}; HttpOnly; SameSite=Strict`
        );

        console.log("✅ [LOGIN] user", user.username, "logged in");

        // 5) Redirect to dashboard (adjust if your path is different)
        return res.redirect("/index.html");
        // or: return res.redirect("/dashboard");
      }
    );
  } catch (err) {
    console.error("💥 [LOGIN ERROR]:", err);
    next(err);
  }
});

module.exports = router;
