// ===== Imports =====
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const PORT = 3000;

// ===== Middleware =====

// Parse JSON + form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (HTML, CSS, JS, images)
app.use(express.static(path.join(__dirname, "public")));
app.use("/css", express.static(path.join(__dirname, "css")));
app.use("/img", express.static(path.join(__dirname, "img")));

// ===== Routes from routes/ folder =====
app.use(require("./routes/login"));
app.use(require("./routes/dashboard"));
app.use(require("./routes/logout"));
// NOTE: /register is handled directly below with DB logic.
// If later you move that logic into routes/register.js, you can enable this:
// app.use(require("./routes/register"));

// ===== Default pages =====

// Home → login page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

// Explicit /login route (so /login works too)
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

// ===== SQLite Database =====

// Make sure securewebproject.db exists in the project root
const db = new sqlite3.Database(
  path.join(__dirname, "securewebproject.db"),
  (err) => {
    if (err) {
      console.error("💥 Failed to connect to SQLite DB:", err.message);
    } else {
      console.log("✅ Connected to SQLite database.");
    }
  }
);

// ===== Register endpoint (using DB) =====

app.post("/register", (req, res) => {
  console.log("Register request received:", req.body); // Debug

  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    console.log("Missing fields:", { username, email, password });
    return res.status(400).send("Missing required fields");
  }

  // TODO later: hash password before saving (your part 😉)
  db.run(
    `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`,
    [username, email, password],
    function (err) {
      if (err) {
        console.error("Error inserting user:", err.message);
        return res.status(500).send("Error registering user");
      }
      console.log("User registered with ID:", this.lastID);
      res.send("User registered successfully!");
    }
  );
});

// ===== Feedback API endpoints =====

app.post("/api/feedback", (req, res) => {
  const { student_name, course, rating, message, difficulty } = req.body;

  db.run(
    `INSERT INTO feedback (student_name, course, rating, message, difficulty)
     VALUES (?, ?, ?, ?, ?)`,
    [student_name, course, rating, message, difficulty],
    function (err) {
      if (err) {
        console.error("Error saving feedback:", err.message);
        return res.status(500).send("Error saving feedback");
      }
      res.send("Feedback saved successfully!");
    }
  );
});

app.get("/api/feedback", (req, res) => {
  db.all("SELECT * FROM feedback", [], (err, rows) => {
    if (err) {
      console.error("Error retrieving feedback:", err.message);
      return res.status(500).send("Error retrieving feedback");
    }
    res.json(rows);
  });
});

// ===== Global Error Handler (your part ❤️) =====
app.use((err, req, res, next) => {
  console.error("💥 [SERVER ERROR]:", err);

  if (!res.headersSent) {
    res
      .status(500)
      .send("An internal server error occurred. Please try again later.");
  }
});

// ===== Start server =====
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

