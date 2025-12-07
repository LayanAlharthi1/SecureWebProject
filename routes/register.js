const express = require("express");
const path = require("path");
const crypto = require("crypto");
const router = express.Router();

// دالة هاش للباسورد – نفس الفكرة في login
function hashPassword(password) {
    return crypto.createHash("sha256").update(password).digest("hex");
}

// (اختياري) GET /register  عشان لو أحد فتح الرابط مباشرة
router.get("/register", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "public", "register.html"));
});

// POST /register  – استلام بيانات الفورم
router.post("/register", async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        // 1) التحقق من المدخلات
        if (!username || !email || !password) {
            return res.status(400).send("All fields are required.");
        }

        // 2) التحقق من قوة الباسورد (نفس الشروط اللي في الفرونت)
        const passwordPattern =
            /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

        if (!passwordPattern.test(password)) {
            return res
                .status(400)
                .send(
                    "Password must be at least 8 characters and include uppercase, lowercase, number, and special character."
                );
        }

        // 3) عمل هاش للباسورد
        const passwordHash = hashPassword(password);
        console.log("🔐 [REGISTER] username:", username, "hash:", passwordHash);

        // ================================
        // ⬇⬇⬇  جزء الداتابيس ) ⬇⬇⬇
        //
        // هنا يضيف:
        // - التأكد إن اليوزرنيم/الإيميل مو مكرر
        // - حفظ المستخدم في الداتابيس:
        //   { username, email, passwordHash, role: 'student' }
        //
        // مثال مستقبلاً:
        // await db.createUser({ username, email, passwordHash, role: "student" });
        // return res.redirect("/login");
        //
        // ================================

        // حالياً: نوضح إن ما فيه داتابيس
        return res
            .status(503)
            .send("Registration is not available yet (database not connected).");

    } catch (err) {
        console.error("💥 [REGISTER ERROR]:", err);
        next(err); // يروح للـ error handler في server.js
    }
});

module.exports = router;
