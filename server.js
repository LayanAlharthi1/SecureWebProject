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
