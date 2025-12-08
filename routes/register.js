const express = require("express");
const path = require("path");
const crypto = require("crypto");
const router = express.Router();
const db = require("../db");

// Hash password
function hashPassword(password) {
    return crypto.createHash("sha256").update(password).digest("hex");
}

// GET /register
router.get("/register", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "public", "register.html"));
});

// POST /register
router.post("/register", (req, res) => {
    const { username, email, password } = req.body;

    // Validate inputs
    if (!username || !email || !password) {
        return res.status(400).send("All fields are required.");
    }

    const passwordPattern = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    if (!passwordPattern.test(password)) {
        return res.status(400).send("Password does not meet the requirements.");
    }

    const passwordHash = hashPassword(password);

    // 1. Check if username OR email already exists
    db.get(
        "SELECT * FROM users WHERE username = ? OR email = ?",
        [username, email],
        (err, user) => {
            if (err) return res.status(500).send("Database error");

            if (user) {
                return res.status(400).send("Username or email already exists.");
            }

            // 2. Insert new user
            db.run(
                "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
                [username, email, passwordHash],
                function (err) {
                    if (err) {
                        return res.status(500).send("Error saving user.");
                    }
                    console.log("User registered:", username);

                    // Redirect to login page after success
                    return res.redirect("/login");
                }
            );
        }
    );
});

module.exports = router;
