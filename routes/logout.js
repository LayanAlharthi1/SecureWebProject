const express = require("express");
const router = express.Router();
<<<<<<< HEAD
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
=======
const { deleteSession } = require("../session");

router.get("/logout", async (req, res) => {
  const cookie = req.headers.cookie;
  const sessionId = cookie?.split("sessionId=")[1];

  if (sessionId) {
    await deleteSession(sessionId);
  }

  res.setHeader("Set-Cookie", "sessionId=; Max-Age=0; Path=/");
  res.redirect("/login.html");
});

module.exports = router;
>>>>>>> 6569457e08bf992d1c6cb81f98e4d1152c20dba4
