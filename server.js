// server.js
const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const { getSession } = require("./session");
const db = require("./db");

const app = express();
const PORT = 3000;

// ---------- Body parsers ----------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---------- Make db available ----------
app.use((req, res, next) => {
  req.db = db;
  next();
});

// ---------- Routers ----------
const loginRouter = require("./routes/login");
const registerRouter = require("./routes/register");

app.use(loginRouter);
app.use(registerRouter);

// ---------- Session middlewares ----------
async function requireLogin(req, res, next) {
  try {
    const cookieHeader = req.headers.cookie || "";
    const match = cookieHeader.match(/sessionId=([^;]+)/);

    if (!match) {
      return res.redirect("/login");
    }

    const sessionId = match[1];

    const sessionRow = await getSession(sessionId);
    if (!sessionRow) {
      return res.redirect("/login");
    }

    req.userId = sessionRow.user_id;
    req.sessionId = sessionId;
    next();
  } catch (err) {
    next(err);
  }
}

function requireRole(expectedRole) {
  return (req, res, next) => {
    if (!req.userId) {
      return res.redirect("/login");
    }

    const sql = "SELECT role FROM users WHERE id = ?";
    req.db.get(sql, [req.userId], (err, row) => {
      if (err) return next(err);

      if (!row || row.role !== expectedRole) {
        return res.status(403).send("Access denied.");
      }

      next();
    });
  };
}

// ---------- Page routes ----------

// login كبداية
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

// register متاحة للجميع
app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "register.html"));
});

// home مفتوحة للجميع
app.get("/home.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "home.html"));
});

// ⬅⬅⬅ مهم: نربط admin-dashboard.html بسيشن + رول
app.get(
  "/admin-dashboard.html",
  requireLogin,
  requireRole("admin"),
  (req, res) => {
    res.sendFile(path.join(__dirname, "public", "admin-dashboard.html"));
  }
);

// ⬅⬅⬅ ونفس الشي للطالب
app.get(
  "/student-dashboard.html",
  requireLogin,
  requireRole("student"),
  (req, res) => {
    res.sendFile(path.join(__dirname, "public", "student-dashboard.html"));
  }
);

// ---------- Static files ----------
app.use(express.static(path.join(__dirname, "public")));
app.use("/css", express.static(path.join(__dirname, "css")));
app.use("/img", express.static(path.join(__dirname, "img")));

// ---------- Error handler ----------
app.use((err, req, res, next) => {
  console.error("💥 [SERVER ERROR]:", err);
  if (!res.headersSent) {
    res
      .status(500)
      .send("An internal server error occurred. Please try again later.");
  }
});

// ---------- Start server ----------
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


//const dashboardRouter = require("./routes/dashboard");
//const logoutRouter = require("./routes/logout");
//app.use(dashboardRouter);
//app.use(logoutRouter);