// server.js --------------------------------------------------

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

// ---------- Routers (مهمّة جداً لـ POST /login و POST /register) ----------
const loginRouter = require("./routes/login");
const registerRouter = require("./routes/register");

app.use(loginRouter);     // يعرّف POST /login
app.use(registerRouter);  // يعرّف POST /register

// ---------- Session middlewares ----------
async function requireLogin(req, res, next) {
  try {
    const cookie = req.headers.cookie || "";
    const match = cookie.match(/sessionId=([^;]+)/);

    if (!match) return res.redirect("/not-allowed.html");

    const sessionId = match[1];
    const session = await getSession(sessionId);

    if (!session) return res.redirect("/not-allowed.html");

    req.userId = session.user_id;
    next();
  } catch (err) {
    next(err);
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.userId) return res.redirect("/not-allowed.html");

    const sql = "SELECT role FROM users WHERE id = ?";
    req.db.get(sql, [req.userId], (err, row) => {
      if (err) return next(err);

      if (!row || row.role !== role) {
        return res.redirect("/not-allowed.html");
      }

      next();
    });
  };
}

// ---------- Page routes ----------
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "home.html"));
});

app.get("/login", (req, res) =>
  res.sendFile(path.join(__dirname, "public", "login.html"))
);

app.get("/register", (req, res) =>
  res.sendFile(path.join(__dirname, "public", "register.html"))
);

app.get("/home.html", (req, res) =>
  res.sendFile(path.join(__dirname, "public", "home.html"))
);

// ---------- Protected pages ----------
app.get(
  "/admin-dashboard.html",
  requireLogin,
  requireRole("admin"),
  (req, res) => {
    res.sendFile(path.join(__dirname, "public", "admin-dashboard.html"));
  }
);

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
app.use("/js", express.static(path.join(__dirname, "js")));

// ---------- Error handler ----------
app.use((err, req, res, next) => {
  console.error("💥 [SERVER ERROR]:", err);
  if (!res.headersSent) {
    res.status(500).send("Internal server error");
  }
});

// ---------- Start server ----------
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
