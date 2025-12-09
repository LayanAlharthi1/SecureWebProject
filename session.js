// 4 time out -  نتحقق منه3 -  2 نحفظه - session id 1

const crypto = require("crypto");
const db = require("./db");

const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutes

function generateSessionId() {
  return crypto.randomBytes(32).toString("hex");
}

function createSession(userId) {
  return new Promise((resolve, reject) => {
    const sessionId = generateSessionId();
    const now = Date.now();

    const sql = `INSERT INTO sessions (session_id, user_id, last_activity)
                 VALUES (?, ?, ?)`;

    db.run(sql, [sessionId, userId, now], function (err) {
      if (err) return reject(err);
      resolve(sessionId);
    });
  });
}

function getSession(sessionId) {
  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM sessions WHERE session_id = ?`, [sessionId], (err, row) => {
      if (err) return reject(err);
      if (!row) return resolve(null);

      if (Date.now() - row.last_activity > SESSION_TIMEOUT) {
        db.run(`DELETE FROM sessions WHERE session_id = ?`, [sessionId]);
        return resolve(null);
      }

      db.run(
        `UPDATE sessions SET last_activity = ? WHERE session_id = ?`,
        [Date.now(), sessionId]
      );

      resolve(row);
    });
  });
}

function deleteSession(sessionId) {
  return new Promise((resolve, reject) => {
    db.run(
      `DELETE FROM sessions WHERE session_id = ?`,
      [sessionId],
      (err) => (err ? reject(err) : resolve())
    );
  });
}

module.exports = { createSession, getSession, deleteSession };
