// routes/login.js
const express = require("express");
const router = express.Router();

const session = require("../session");      // نفس اللي كنتِ تستخدمينه
const crypto = require("crypto");
const db = require("../db");               // الاتصال بقاعدة البيانات

// نفس الهاش المستخدم في register.js
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

    // 2) Look up user in DB (نجيب الـ role بعد ما أضفتوه في الجدول)
    db.get(
      "SELECT id, username, password, role FROM users WHERE username = ?",
      [username],
      (err, user) => {
        if (err) {
          console.error("💥 [LOGIN DB ERROR]:", err);
          return next(err); // يروح للهاندلر العام في server.js
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

        // 4) Create session (باستخدام ملف session حقكم)
        const sessionId = session.createSession(user.id);

        // 5) Send cookie
        res.setHeader(
          "Set-Cookie",
          `sessionId=${sessionId}; HttpOnly; SameSite=Strict; Path=/`
        );

        console.log("✅ [LOGIN] user", user.username, "logged in with role:", user.role);

        // 6) Redirect based on role
        if (user.role === "admin") {
          // صفحة الأدمن
          return res.redirect("/admin-dashboard.html");
        } else {
          // صفحة الطالب
          return res.redirect("/student-dashboard.html");
          
        }
      }
    );
  } catch (err) {
    console.error("💥 [LOGIN ERROR]:", err);
    next(err);
  }
});

module.exports = router;
