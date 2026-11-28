
document.addEventListener("DOMContentLoaded", () => {
    const signupForm = document.querySelector("#signup-form");

    if (!signupForm) return;

    signupForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const fullName = document.querySelector("#fullName").value.trim();
        const email = document.querySelector("#email").value.trim().toLowerCase();
        const phone = document.querySelector("#phone").value.trim();
        const location = document.querySelector("#location").value.trim();
        const password = document.querySelector("#password").value;
        const confirmPassword = document.querySelector("#confirmPassword").value;

        if (!fullName || !email || !phone || !location || !password) {
            alert("Please fill in all the fields.");
            return;
        }

        if (password.length < 6) {
            alert("Password must contain at least 6 characters.");
            return;
        }

        if (password !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        let users = [];

        try {
            users = JSON.parse(localStorage.getItem("travelGoUsers")) || [];
        } catch {
            alert("Unable to read saved account data.");
            return;
        }

        if (!Array.isArray(users)) {
            alert("Account data is invalid.");
            return;
        }

        const existingUser = users.find(user => user.email === email);

        if (existingUser) {
            alert("An account with this email already exists.");
            return;
        }

        const newUser = {
            fullName,
            email,
            phone,
            location,
            password,
            preferences: [],
            notifications: true,
            language: "English",
            profileImage: ""
        };

        users.push(newUser);

        try {
            localStorage.setItem("travelGoUsers", JSON.stringify(users));
        } catch {
            alert("Account could not be saved.");
            return;
        }

        alert("Account created successfully! Please login.");
        window.location.href = "login.html";
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.querySelector("#login-form");

    if (!loginForm) return;

    loginForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const email = document.querySelector("#email").value.trim().toLowerCase();
        const password = document.querySelector("#password").value;

        let users = [];

        try {
            users = JSON.parse(localStorage.getItem("travelGoUsers")) || [];
        } catch {
            alert("Unable to read account data.");
            return;
        }

        const user = users.find(
            item => item.email === email && item.password === password
        );

        if (!user) {
            alert("Invalid email or password.");
            return;
        }

        const profileData = {
            fullName: user.fullName,
            email: user.email,
            phone: user.phone,
            location: user.location,
            preferences: user.preferences || [],
            notifications: user.notifications ?? true,
            language: user.language || "English",
            profileImage: user.profileImage || ""
        };

        localStorage.setItem(
            "travelGoProfile",
            JSON.stringify(profileData)
        );

        localStorage.setItem("travelGoCurrentUser", user.email);

        alert("Login successful!");

        window.location.href = "profile.html";
    });
});
