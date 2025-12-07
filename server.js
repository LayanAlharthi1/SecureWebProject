<<<<<<< HEAD
const express = require("express");
const app = express();
const path = require("path");

// Parse form data from forms (POST)
app.use(express.urlencoded({ extended: true }));

// Serve static files (HTML, CSS, JS, images)
app.use(express.static(path.join(__dirname, "public")));
app.use("/css", express.static(path.join(__dirname, "css")));
app.use("/img", express.static(path.join(__dirname, "img")));

// ===== Routes =====
app.use(require("./routes/login"));
app.use(require("./routes/dashboard"));
app.use(require("./routes/logout"));
app.use(require("./routes/register")); // أضفنا مسار التسجيل الجديد

// Default route → send login page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "login.html"));
});

// Explicit /login route ()
app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "login.html"));
});

// ===== Global Error Handler () =====
app.use((err, req, res, next) => {
    console.error("💥 [SERVER ERROR]:", err);

    if (!res.headersSent) {
        res
            .status(500)
            .send("An internal server error occurred. Please try again later.");
    }
});

// Start server
app.listen(3000, () => console.log("Server running on http://localhost:3000"));
=======
// Import required libraries
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const app = express();
const PORT = 3000;

// Middleware to parse incoming JSON requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from "public" folder
app.use(express.static(path.join(__dirname, "public")));

// Connect to SQLite database (make sure securewebproject.db exists)
const db = new sqlite3.Database("securewebproject.db");


// Register page
app.post("/register", (req, res) => {
  console.log("Register request received:", req.body); // Debug

  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    console.log("Missing fields:", { username, email, password });
    return res.status(400).send("Missing required fields");
  }

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

// API endpoint to insert new feedback
app.post("/api/feedback", (req, res) => {
  const { student_name, course, rating, message, difficulty } = req.body;
  db.run(
    `INSERT INTO feedback (student_name, course, rating, message, difficulty)
     VALUES (?, ?, ?, ?, ?)`,
    [student_name, course, rating, message, difficulty],
    function (err) {
      if (err) return res.status(500).send("Error saving feedback");
      res.send("Feedback saved successfully!");
    }
  );
});

// API endpoint to retrieve all feedback
app.get("/api/feedback", (req, res) => {
  db.all("SELECT * FROM feedback", [], (err, rows) => {
    if (err) return res.status(500).send("Error retrieving feedback");
    res.json(rows);
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
>>>>>>> 2f268f0 (add layals full project with database)
