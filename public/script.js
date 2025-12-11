
// ================= LOGIN =================
const loginForm = document.getElementById("login-form");

if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        if (!username || !password) {
            alert("Please enter your correct username or password");
        } else {
            this.action = "/login";
            this.method = "POST";
            this.submit();
        }
    });
}


// ================= REGISTER =================
const registerForm = document.getElementById("register-form");

if (registerForm) {
    registerForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        const passwordPattern =
            /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

        if (!username || !password) {
            alert("Please enter your correct username or password");
        } else if (!passwordPattern.test(password)) {
            alert("Password must be at least 8 characters, include uppercase, lowercase, number, and special character.");
        } else {
            this.action = "/register";
            this.method = "POST";
            this.submit();
        }
    });
}
