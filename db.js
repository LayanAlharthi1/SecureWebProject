// db.js - shared SQLite connection

const sqlite3 = require("sqlite3").verbose();

// Connect to existing SQLite DB file (NOT creating new one)
const db = new sqlite3.Database("securewebproject.db", (err) => {
    if (err) {
        console.error("Failed to connect to SQLite:", err.message);
    } else {
        console.log(" Connected to SQLite database.");
    }
});

module.exports = db;
