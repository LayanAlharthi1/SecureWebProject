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

// هذا هو الميدل وير الأساسي (نفس اللي عندك بس مضاف عليه جلب اليوزر)
async function authMiddleware(req, res, next) {
  const cookies = parseCookies(req.headers.cookie);
  const sessionId = cookies.sessionId;

  // ما فيه sessionId → رجّعه لصفحة تسجيل الدخول
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

    // نخزّن السشن في الطلب (زي ما كنتِ مسوية)
    req.session = session;
    req.userSession = session;
    req.sessionId = sessionId;

    // 👈 جديد: نجيب بيانات المستخدم + الـ role
    db.get(
      "SELECT id, username, role FROM users WHERE id = ?",
      [session.user_id],
      (err, user) => {
        if (err) {
          console.error("💥 [AUTH MIDDLEWARE DB ERROR]:", err);
          return next(err);
        }

        if (!user) {
          // ما لقينا مستخدم له هذا الـ user_id → رجّعه للّوق إن
          return res.redirect("/login.html");
        }

        // نخزن معلوماته هنا، نستخدمها بعدين في requireAdmin أو في الراوت
        req.user = user;

        next();
      }
    );
  } catch (err) {
    console.error("💥 [AUTH MIDDLEWARE ERROR]:", err);
    next(err);
  }
}

// 👑 ميدل وير إضافي: يمنع أي أحد مو admin من الدخول
function requireAdmin(req, res, next) {
  // لازم authMiddleware يكون مشتغل قبل، عشان req.user تكون موجودة
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).send("Access denied: admins only.");
    // أو لو تبين ترجعيه للّوق إن:
    // return res.redirect("/login.html");
  }
  next();
}

// نصدّر الميدل وير الأساسي كـ default (عشان الكود القديم يظل شغال)
module.exports = authMiddleware;
// ونصدّر extra helpers
module.exports.requireAdmin = requireAdmin;
