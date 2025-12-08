const express = require("express");
const router = express.Router();
const session = require("../session");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Connect to the same SQLite database file as server.js
const db = new sqlite3.Database(
  path.join(__dirname, "..", "securewebproject.db"),
  (err) => {
    if (err) {
      console.error("💥 [LOGIN] Failed to connect to DB:", err.message);
    } else {
      console.log("✅ [LOGIN] Connected to SQLite database.");
    }
  }
);

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
      "SELECT id, password FROM users WHERE username = ?",
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

        // 3) Compare passwords
        // NOTE: right now passwords are stored plain in DB.
        // Later, when you add hashing, replace this with a hash comparison.
        if (user.password !== password) {
          return res.status(401).send("Invalid username or password");
        }

        // 4) Create session
        const sessionId = session.createSession(user.id);

        res.setHeader(
          "Set-Cookie",
          `sessionId=${sessionId}; HttpOnly; SameSite=Strict`
        );

        // 5) Redirect to dashboard after successful login
        return res.redirect("/dashboard");
      }
    );
  } catch (err) {
    console.error("💥 [LOGIN ERROR]:", err);
    next(err);
  }
});

module.exports = router;


