// middleware/auth.js

const { getSession } = require("../session");

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

module.exports = async function (req, res, next) {
  // نقرأ الكوكيز من الهيدر
  const cookies = parseCookies(req.headers.cookie);
  const sessionId = cookies.sessionId;

  // ما فيه sessionId → رجّعه لصفحة تسجيل الدخول
  if (!sessionId) {
    return res.redirect("/login.html");
    // أو لو تحبين: return res.redirect("/login");
  }

  try {
    // نجيب الجلسة من قاعدة البيانات
    const session = await getSession(sessionId);

    // الجلسة غير موجودة أو منتهية
    if (!session) {
      return res.redirect("/login.html?expired=1");
      // أو: return res.redirect("/login?expired=1");
    }

    // نخزّن معلومات الجلسة في الطلب عشان نقدر نستخدمها في الراوتس
    req.session = session;        // الشكل الجديد
    req.userSession = session;    // عشان لو في كود قديم يستخدم الاسم القديم
    req.sessionId = sessionId;

    next();
  } catch (err) {
    console.error("💥 [AUTH MIDDLEWARE ERROR]:", err);
    // خليه يروح للـ error handler العام في server.js
    next(err);
  }
};
