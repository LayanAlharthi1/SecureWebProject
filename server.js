const express = require("express");
const app = express();
const path = require("path");

app.use(express.urlencoded({ extended: true }));

// routes
app.use(require("./routes/login"));
app.use(require("./routes/dashboard"));
app.use(require("./routes/logout"));

app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "public/login.html"));
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));