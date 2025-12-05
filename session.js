// 4 time out -  نتحقق منه3 -  2 نحفظه - session id 1

const crypto = require("crypto");

const sessions = new Map();

//مدة الجلسة
const SESSION_TIMEOUT = 20 * 60 * 1000;

module.exports = {

    // إنشاء جلسة جديدة عند تسجيل الدخول 1 
    createSession(userId) {
        const sessionId = crypto.randomBytes(16).toString("hex");

        sessions.set(sessionId, {
            userId,
            lastActivity: Date.now()
        });

        return sessionId;
    },

    // التحقق من الجلسة 3 
    getSession(sessionId) {
        if (!sessions.has(sessionId)) return null;

        const session = sessions.get(sessionId);

        // انتهاء الجلسة 4 
        if (Date.now() - session.lastActivity > SESSION_TIMEOUT) {
            sessions.delete(sessionId);
            return null;
        }

        // تحديث آخر نشاط
        session.lastActivity = Date.now();
        return session;
    },

    // حذف الجلسة (تسجيل خروج)
    deleteSession(sessionId) {
        sessions.delete(sessionId);
    }
};