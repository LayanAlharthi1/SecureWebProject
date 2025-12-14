const express = require("express");
const router = express.Router();
const { createSession } = require("../session");
const crypto = require("crypto");
const db = require("../db");

function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// *Sanitize text inputs
  function sanitizeText(text) {
    return text.replace(/<\/?[^>]+(>|$)/g, "").trim();
    }


router.post("/login", (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).send("Username and password are required.");
    }
    const usernameClean = sanitizeText(username);
    const passwordClean = sanitizeText(password);


    // *Validation
    const usernamePattern = /^[A-Za-z0-9_]{3,20}$/;
    const passwordPattern =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (!usernamePattern.test(usernameClean)) {
      res.setHeader("Content-Type", "text/plain");
      return res
        .status(400)
        .send("Invalid username format.");
    }

    if (!passwordPattern.test(passwordClean)) {
      res.setHeader("Content-Type", "text/plain");
      return res
        .status(400)
        .send("Invalid password format.");
    }


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

        console.log("User logged:", user.username, "role:", user.role); 

        // هنا نستخدم role من الداتابيس
        if (user.role === "admin") {
          return res.redirect("/admin-dashboard.html");
        } else {
          return res.redirect("/student-dashboard.html");
        }
      }
    );
  } catch (err) {
    next(err);
  }
}); 

module.exports = router;
