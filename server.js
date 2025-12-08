// server.js
const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = 3000;

// ---------- Body parsers ----------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---------- Static files ----------
app.use(express.static(path.join(__dirname, "public")));
app.use("/css", express.static(path.join(__dirname, "css")));
app.use("/img", express.static(path.join(__dirname, "img")));

// ---------- SQLite database ----------
const db = new sqlite3.Database(
  path.join(__dirname, "securewebproject.db"),
  (err) => {
    if (err) {
      console.error("❌ Error opening database:", err.message);
    } else {
      console.log("✅ Connected to SQLite database");
    }
  }
);

// Make db available to routes (if they want to use req.db)
app.use((req, res, next) => {
  req.db = db;
  next();
});

// ---------- Routers ----------
const loginRouter = require("./routes/login");
const registerRouter = require("./routes/register");

app.use(loginRouter);      // handles /login POST (and anything else inside login.js)
app.use(registerRouter);   // handles /register GET/POST from register.js

// ---------- Page routes ----------

// Default page → login
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

// Explicit /login (GET) → show login.html
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

// Dashboard page (no session protection yet)
app.get("/index", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/index.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ---------- Global error handler ----------
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