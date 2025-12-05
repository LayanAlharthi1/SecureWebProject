const session = require("../session");

module.exports = function (req, res, next) {
    const cookie = req.headers.cookie;

    if (!cookie ||!cookie.includes("sessionId=")) {
        return res.redirect("/login");
    }

    const sessionId = cookie
        .split("sessionId= ")[1]
        .split(";")[0]
        .trim();

    const userSession = session.getSession(sessionId);

    if (!userSession) {
        return res.redirect("/login?expired=1");
    }

    req.userSession = userSession;
    req.sessionId = sessionId;

    next();
}