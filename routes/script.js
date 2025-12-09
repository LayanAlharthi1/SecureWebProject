// login
document.getElementById("login-form").addEventListener("submit", function(event) {
    event.preventDefault(); // منع إرسال النموذج بشكل افتراضي

    // الحصول على المدخلات
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    // التحقق من المدخلات
    if (!username || !password) {
        alert("plaese enter your correct password or username");
    } else {
        this.action = "/login"; 
        this.method = "POST";
        this.submit(); // إرسال النموذج إذا كانت المدخلات صحيحة
    }
});

// register
document.getElementById("register-form").addEventListener("submit", function(event) {
    event.preventDefault(); // منع إرسال النموذج بشكل افتراضي

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    // التحقق من المدخلات
    const passwordPattern = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!username || !password ) {
        alert("plaese enter your correct password or username");
    } else if (!passwordPattern.test(password)) {
        alert("Password must be at least 8 characters one uppercase and lowercase letters, number, special character.");
    } else {
        this.action = "/register"; 
        this.method = "POST";
        this.submit(); // إرسال النموذج إذا كانت المدخلات صحيحة
    }
});
