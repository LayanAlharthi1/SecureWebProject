const express = require("express");
const router = express.Router();
const { createSession } = require("../session");
const crypto = require("crypto");
const db = require("../db");

function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

router.post("/login", (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).send("Username and password are required.");
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

        console.log("User logged:", user.username);

        if (user.role === "admin") {
          return res.redirect("/admin.html");
        } else {
          return res.redirect("/dashboard.html");
        }
      }
    );
  } catch (err) {
    next(err);
  }
});

module.exports = router;
