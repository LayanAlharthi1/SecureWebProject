// routes/logout.js

const express = require("express");
const router = express.Router();
const { deleteSession } = require("../session");

// GET /logout - log the user out
router.get("/logout", async (req, res) => {
    const cookie = req.headers.cookie || "";
    const match = cookie.match(/sessionId=([^;]+)/);

    // Delete session from DB
    if (match) {
        const sessionId = match[1];
        await deleteSession(sessionId);
    }

    // Clear cookie and redirect to login
    res.clearCookie("sessionId", { 
        path: '/',
        httpOnly: true, 
        secure: true,  
        sameSite: 'Strict'
    });
    res.redirect("/login");
});

module.exports = router;