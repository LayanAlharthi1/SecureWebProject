// middleware/auth.js

const { getSession } = require("../session");
const db = require("../db");

// دالة بسيطة لتفكيك الكوكيز من الهيدر
function parseCookies(cookieHeader) {
  const list = {};
  if (!cookieHeader) return list;

  cookieHeader.split(";").forEach((cookie) => {
    let [name, value] = cookie.split("=");
    list[name.trim()] = value?.trim();
  });

  return list;
}

//   للتحقق من الجلسة والمستخدم
async function authMiddleware(req, res, next) {
  const cookies = parseCookies(req.headers.cookie);
  const sessionId = cookies.sessionId;


  //sessionId غير موجود في الكوكيز
  if (!sessionId) {
    return res.redirect("/login.html");
  }

  try {
    // نجيب الجلسة من قاعدة البيانات
    const session = await getSession(sessionId);

    // الجلسة غير موجودة أو منتهية
    if (!session) {
      return res.redirect("/login.html?expired=1");
    }

  
    // نحط بيانات الجلسة في الطلب
    req.session = session;
    req.userSession = session;
    req.sessionId = sessionId;

    
    // نجيب بيانات المستخدم المرتبطة بهذه الجلسة
    db.get(
      "SELECT id, username, role FROM users WHERE id = ?",
      [session.user_id],
      (err, user) => {
        if (err) {
          console.error(" [AUTH MIDDLEWARE DB ERROR]:", err);
          return next(err);
        }

        if (!user) {
          
          return res.redirect("/login.html");
        }

      
        req.user = user;

        next();
      }
    );
  } catch (err) {
    console.error(" [AUTH MIDDLEWARE ERROR]:", err);
    next(err);
  }
}

 // دالة للتحقق من أن المستخدم هو أدمن
function requireAdmin(req, res, next) {

  if (!req.user || req.user.role !== "admin") {
    return res.status(403).send("Access denied: admins only.");
    
  }
  next();
}


module.exports = authMiddleware;

module.exports.requireAdmin = requireAdmin;
