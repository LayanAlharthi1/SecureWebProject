const { getSession } = require("../session");

function parseCookies(cookieHeader) {
  const list = {};
  if (!cookieHeader) return list;

  cookieHeader.split(";").forEach(cookie => {
    let [name, value] = cookie.split("=");
    list[name.trim()] = value?.trim();
  });

  return list;
}

module.exports = async function (req, res, next) {
  const cookies = parseCookies(req.headers.cookie);
  const sessionId = cookies.sessionId;

  if (!sessionId) return res.redirect("/login.html");

  const session = await getSession(sessionId);

  if (!session) return res.redirect("/login.html?expired=1");

  req.session = session;
  next();
};
