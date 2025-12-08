// server.js
const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3").verbose(); // keep it for DB (even if not used yet)

const app = express();
const PORT = 3000;

// ---- Middleware to parse body ----
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---- Static files ----
app.use(express.static(path.join(__dirname, "public")));
app.use("/css", express.static(path.join(__dirname, "css")));
app.use("/img", express.static(path.join(__dirname, "img")));

// ---- (Optional) DB connection (if you want to use it later) ----
const db = new sqlite3.Database(path.join(__dirname, "securewebproject.db"), (err) => {
    if (err) {
        console.error("❌ Error opening database:", err.message);
    } else {
        console.log("✅ Connected to SQLite database");
    }
});

// Make db available in routes via req.db (if you need it later)
app.use((req, res, next) => {
    req.db = db;
    next();
});

// ---- Routes (all of these MUST export an Express router) ----
const loginRouter = require("./routes/login");
const dashboardRouter = require("./routes/dashboard");
const logoutRouter = require("./routes/logout");
const registerRouter = require("./routes/register");

app.use(loginRouter);
app.use(dashboardRouter);
app.use(logoutRouter);
app.use(registerRouter);

// ---- Default routes ----
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "login.html"));
});

// ---- Global error handler ----
app.use((err, req, res, next) => {
    console.error("💥 [SERVER ERROR]:", err);
    if (!res.headersSent) {
        res.status(500).send("An internal server error occurred. Please try again later.");
    }
});

// ---- Start server ----
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

