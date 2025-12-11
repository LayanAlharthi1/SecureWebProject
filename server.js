// =======================
// server.js
// =======================

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
      return res.sendFile(path.join(__dirname, "views", "not-allowed.html"));
    }

    const sessionId = match[1];
    const sessionRow = await getSession(sessionId);

    if (!sessionRow) {
      return res.sendFile(path.join(__dirname, "views", "not-allowed.html"));
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
      return res.sendFile(path.join(__dirname, "views", "not-allowed.html"));
    }

    const sql = "SELECT role FROM users WHERE id = ?";
    req.db.get(sql, [req.userId], (err, row) => {
      if (err) return next(err);

      if (!row || row.role !== expectedRole) {
        return res.sendFile(path.join(__dirname, "views", "not-allowed.html"));
      }

      next();
    });
  };
}

// ---------- Page routes ----------

// البداية → Home page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "home.html"));
});

// Login & Register
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "register.html"));
});

// Home page route
app.get("/home.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "home.html"));
});

// ------------------ Protected pages ------------------

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

// ---------- Static files (ONLY css/js/img) ----------

app.use("/css", express.static(path.join(__dirname, "public/css")));
app.use("/js", express.static(path.join(__dirname, "public/js")));
app.use("/img", express.static(path.join(__dirname, "public/img")));

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
