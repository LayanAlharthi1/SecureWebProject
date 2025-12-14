// server.js --------------------------------------------------


const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const { getSession, deleteSession} = require("./session");
const db = require("./db");
const https = require("https");
const fs = require("fs");      

const app = express();
const PORT = 3000;

// ---------- Body parsers ----------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---------- Security Headers (HTTPS/Headers) ----------
app.use((req, res, next) => {
  // يمنع المتصفح من تخمين نوع الملف (ضد بعض هجمات الـ MIME-sniffing)
  res.setHeader("X-Content-Type-Options", "nosniff");

  // يمنع فتح الموقع داخل iframe (يحمي من clickjacking)
  res.setHeader("X-Frame-Options", "DENY");

  // تشغيل فلتر XSS القديم في بعض المتصفحات (تكملة احتياطية)
  res.setHeader("X-XSS-Protection", "1; mode=block");

  // سياسة الريفيرر – ما يرسل تفاصيل الصفحة السابقة لمواقع ثانية
  res.setHeader("Referrer-Policy", "no-referrer");

  // HSTS: نقول للمتصفح "لو كان السيرفر HTTPS، خلك عليه دائمًا"
  // (ما يضر حتى لو احنا شغالين على http://localhost)
  res.setHeader(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );

  next();
});

// ---------- Make db available ----------
app.use((req, res, next) => {
  req.db = db;
  next();
});

// ---------- Routers ----------
const loginRouter = require("./routes/login");
const registerRouter = require("./routes/register");
const logoutRouter = require("./routes/logout");

app.use(loginRouter);     // يعرّف POST /login
app.use(registerRouter);  // يعرّف POST /register
app.use(logoutRouter);   // يعرّف POST /logout

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

// ---------- Feedback API ----------
app.post("/feedback", requireLogin, async (req, res) => {
  try {
    const { course, rating, message, difficulty } = req.body;

    if (!course || !rating || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    req.db.get(
      "SELECT username FROM users WHERE id = ?",
      [req.userId],
      (err, row) => {
        if (err) {
          return res.status(500).json({ error: "Database error" });
        }

        const studentName = row?.username || "Student";

        req.db.run(
          `INSERT INTO feedback (student_name, course, rating, message, difficulty)
           VALUES (?, ?, ?, ?, ?)`,
          [studentName, course, rating, message, difficulty || "medium"],
          function (err2) {
            if (err2) {
              return res.status(500).json({ error: "Database error" });
            }
            res.status(201).json({ id: this.lastID });
          }
        );
      }
    );
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});


// ---------- NEW: Get all feedback for admin ----------
app.get("/feedback", requireLogin, requireRole("admin"), (req, res) => {
  const sql = `
    SELECT 
      id,
      student_name AS studentName,
      course,
      rating,
      message,
      difficulty
    FROM feedback
    ORDER BY id DESC
  `;

  req.db.all(sql, [], (err, rows) => {
    if (err) {
      console.error("DB error reading feedback:", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.json(rows); // يرجع كل الفيدباكات للأدمن
  });
});



// ---------- Static files ----------
app.use(express.static(path.join(__dirname, "public")));
app.use("/css", express.static(path.join(__dirname, "css")));
app.use("/img", express.static(path.join(__dirname, "img")));
app.use("/js", express.static(path.join(__dirname, "js")));

// ---------- Error handler ----------
app.use((err, req, res, next) => {
  console.error(" [SERVER ERROR]:", err);
  if (!res.headersSent) {
    res.status(500).send("Internal server error");
  }
});

//Https
const options = {
    key: fs.readFileSync(path.join(__dirname, "localhost+2-key.pem")),
    cert: fs.readFileSync(path.join(__dirname, "localhost+2.pem")),
};

// ---------- Start server ----------
https.createServer(options, app).listen(PORT, () => {
  console.log(`Server running securely on https://localhost:${PORT}`);
});


