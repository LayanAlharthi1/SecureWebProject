const express = require("express");
const router = express.Router();
const session = require("../session");
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
});

module.exports = router;

