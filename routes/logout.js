const express = require("express");
const router = express.Router();
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
