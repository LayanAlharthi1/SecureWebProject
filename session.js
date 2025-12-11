// session.js
// إدارة الـ Sessions باستخدام SQLite بدلاً من التخزين في الذاكرة

const crypto = require("crypto");
const db = require("./db");

// مدة الجلسة (مثلاً 20 دقيقة)
const SESSION_TIMEOUT = 20 * 60 * 1000; // 20 minutes

// توليد sessionId عشوائي وآمن
function generateSessionId() {
  return crypto.randomBytes(32).toString("hex");
}

// إنشاء جلسة جديدة عند تسجيل الدخول
function createSession(userId) {
  return new Promise((resolve, reject) => {
    const sessionId = generateSessionId();
    const now = Date.now();

    const sql = `
      INSERT INTO sessions (session_id, user_id, last_activity)
      VALUES (?, ?, ?)
    `;

    db.run(sql, [sessionId, userId, now], function (err) {
      if (err) return reject(err);
      resolve(sessionId);
    });
  });
}

// التحقق من الجلسة + تمديد مدتها لو ما انتهت
function getSession(sessionId) {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT * FROM sessions WHERE session_id = ?`,
      [sessionId],
      (err, row) => {
        if (err) return reject(err);
        if (!row) return resolve(null);

        // هل الجلسة منتهية؟
        if (Date.now() - row.last_activity > SESSION_TIMEOUT) {
          db.run(
            `DELETE FROM sessions WHERE session_id = ?`,
            [sessionId]
          );
          return resolve(null);
        }

        // تحديث آخر نشاط (session still alive)
        db.run(
          `UPDATE sessions SET last_activity = ? WHERE session_id = ?`,
          [Date.now(), sessionId]
        );

        resolve(row);
      }
    );
  });
}

// حذف الجلسة (تسجيل خروج)
function deleteSession(sessionId) {
  return new Promise((resolve, reject) => {
    db.run(
      `DELETE FROM sessions WHERE session_id = ?`,
      [sessionId],
      (err) => (err ? reject(err) : resolve())
    );
  });
}

module.exports = {
  createSession,
  getSession,
  deleteSession,
};
