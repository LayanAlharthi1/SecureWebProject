const express = require("express");
const router = express.Router();
const session = require("../session");
<<<<<<< HEAD
const crypto = require("crypto");

// هنا مستقبلًا بيكون الجلب من الداتابيس بدل المتغير هذا
const users = {
    // على حسب الداتابيس
};

// دالة هاش للباسورد 
function hashPassword(password) {
    return crypto.createHash("sha256").update(password).digest("hex");
}

router.post("/login", async (req, res, next) => {
    try {
        const { username, password } = req.body;

        // التحقق من المدخلات
        if (!username || !password) {
            return res.status(400).send("Username and password are required.");
        }

        // عمل هاش للباسورد (حتى لو الفرونت عمل هاش، نقدر نوحّدها لاحقًا)
        const passwordHash = hashPassword(password);
        console.log("🔐 [LOGIN] username:", username, "hash:", passwordHash);

        // ================================
        // ⬇⬇⬇  جزء الداتابيس () ⬇⬇⬇
        //
        // مثال لما الداتابيس تجهز:
        //
        // const user = await db.getUserByUsername(username);
        // if (!user || user.passwordHash !== passwordHash) {
        //     return res.status(401).send("Invalid username or password");
        // }
        //
        // const sessionId = session.createSession(user.id);
        // res.setHeader(
        //   "Set-Cookie",
        //   `sessionId=${sessionId}; HttpOnly; SameSite=Strict`
        // );
        // return res.redirect("/dashboard");
        //
        // ================================

        // حاليًا: نرجع رسالة واضحة أن الداتابيس مو مربوطة
        return res
            .status(503)
            .send("Login is not available yet (database not connected).");

    } catch (err) {
        console.error("💥 [LOGIN ERROR]:", err);
        // نرسل للـ error handler العام في server.js
        next(err);
    }
=======

const users = { 
    // على حسب الداتابيس 
} 

router.post("/login", (req, res) => {
    const { username, password } = req.body;

    // اكمله لما نسوي الداتابيس
    const user = users

    if(!user){
        return res.status(401).send("Invalid username or password");
    }

    const sessionId = session.createSession(user.id); // حسب الداتابيس

    res.setHeader("Set-Cookie", `sessionId=${sessionId}; HttpOnly ; SameSite=Strict`);
    return res.redirect("/dashboard");
>>>>>>> 2f268f0 (add layals full project with database)
});

module.exports = router;

<<<<<<< HEAD
=======
//--------------------------------------------------------------------------------------

// Register endpoint
app.post("/register", (req, res) => {
  const { username, email, password } = req.body;

  // تحقق أن القيم وصلت
  if (!username || !email || !password) {
    return res.status(400).send("Missing required fields");
  }

  // إدخال البيانات في جدول users
  db.run(
    `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`,
    [username, email, password],
    function (err) {
      if (err) {
        console.error("Error inserting user:", err.message);
        return res.status(500).send("Error registering user");
      }
      res.send("User registered successfully!");
    }
  );
});
>>>>>>> 2f268f0 (add layals full project with database)
