const express = require("express");
const router = express.Router();
<<<<<<< HEAD
const session = require("../session");
const crypto = require("crypto");
const db = require("../db");             // use the shared SQLite connection

// same hashing as in register.js
=======
const { createSession } = require("../session");
const crypto = require("crypto");
const db = require("../db");

>>>>>>> 6569457e08bf992d1c6cb81f98e4d1152c20dba4
function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

<<<<<<< HEAD
// POST /login – handle login form
=======
>>>>>>> 6569457e08bf992d1c6cb81f98e4d1152c20dba4
router.post("/login", (req, res, next) => {
  try {
    const { username, password } = req.body;

<<<<<<< HEAD
    // 1) Basic validation
=======
>>>>>>> 6569457e08bf992d1c6cb81f98e4d1152c20dba4
    if (!username || !password) {
      return res.status(400).send("Username and password are required.");
    }

<<<<<<< HEAD
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
=======
    db.get(
      "SELECT id, username, password, role FROM users WHERE username = ?",
      [username],
      async (err, user) => {

        if (err) return next(err);
        if (!user) return res.status(401).send("Invalid username or password");

        const passwordHash = hashPassword(password);

        if (user.password !== passwordHash)
          return res.status(401).send("Invalid username or password");

        const sessionId = await createSession(user.id);

        res.setHeader(
          "Set-Cookie",
          `sessionId=${sessionId}; HttpOnly; SameSite=Strict; Path=/`
        );

        console.log("User logged:", user.username);

        if (user.role === "admin") {
          return res.redirect("/admin.html");
        } else {
          return res.redirect("/dashboard.html");
        }
      }
    );
  } catch (err) {
>>>>>>> 6569457e08bf992d1c6cb81f98e4d1152c20dba4
    next(err);
  }
});

module.exports = router;
