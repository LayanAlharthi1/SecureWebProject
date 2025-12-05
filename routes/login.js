const express = require("express");
const router = express.Router();
const session = require("../session");

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
});

module.exports = router;

