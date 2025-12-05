const express = require("express");
const router = express.Router();
const session = require("../session");

router.get("/logout", (req, res) => {
    if (req.header.cookie) {
        const sessionId = req.headers.cookie.split("sessionId=")[1]
        session.deleteSession(sessionId);
    }

    res.setHeader("Set-Cookie", "sessionId=; HttpOnly; Path=/; Max-Age=0");
    res.redirect("/login");
});

module.exports = router;