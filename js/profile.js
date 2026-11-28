
document.addEventListener("DOMContentLoaded", () => {

    const editBtn = document.querySelector(".edit-profile");
    const avatarEl = document.querySelector(".avatar");
    const avatarControls = document.querySelector(".avatar-controls");
    const avatarInput = document.querySelector("#profile-picture");
    const sidebarNameEl = document.querySelector(".profile-main h2");
    const sidebarEmailEl = document.querySelector(".profile-email");
    const travellerEl = document.querySelector(".traveller");
    const logoutBtn = document.querySelector("#logout-btn");

    const infoBlocks = document.querySelectorAll(".information-grid .information");
    const accountOptions = document.querySelectorAll(".account-option");
    const statElements = document.querySelectorAll(".profile-stat > div strong");

    const defaultData = {
        fullName: "",
        email: "",
        phone: "",
        location: "",
        preferences: [],
        notifications: true,
        profileImage: ""
    };

    let users = [];
    let currentUserEmail = localStorage.getItem("travelGoCurrentUser");

    try {
        users = JSON.parse(localStorage.getItem("travelGoUsers")) || [];
    } catch {
        users = [];
    }

    if (!currentUserEmail || !Array.isArray(users)) {
        window.location.href = "login.html";
        return;
    }

    let userIndex = users.findIndex(
        user => user.email === currentUserEmail
    );

    if (userIndex === -1) {
        localStorage.removeItem("travelGoCurrentUser");
        localStorage.removeItem("travelGoProfile");
        window.location.href = "login.html";
        return;
    }

    let userData = {
        ...defaultData,
        ...users[userIndex]
    };

    if (!Array.isArray(userData.preferences)) {
        userData.preferences = [];
    }

    let isEditing = false;

    // GET INITIALS

    function getInitials(name) {
        if (!name.trim()) return "GU";

        const parts = name.trim().split(/\s+/);

        if (parts.length === 1) {
            return parts[0].substring(0, 2).toUpperCase();
        }

        return (
            parts[0][0] + parts[parts.length - 1][0]
        ).toUpperCase();
    }

    // SAVE USER DATA

    function saveData() {
        users = JSON.parse(
            localStorage.getItem("travelGoUsers")
        ) || [];

        userIndex = users.findIndex(
            user => user.email === currentUserEmail
        );

        if (userIndex === -1) {
            throw new Error("User account not found.");
        }

        users[userIndex] = {
            ...users[userIndex],
            ...userData
        };

        localStorage.setItem(
            "travelGoUsers",
            JSON.stringify(users)
        );

        localStorage.setItem(
            "travelGoProfile",
            JSON.stringify(userData)
        );

        localStorage.setItem(
            "travelGoCurrentUser",
            userData.email
        );

        currentUserEmail = userData.email;
    }

    // WISHLIST COUNT

    function updateWishlistCount() {
        if (!statElements[0]) return;

        const savedTrips = [];

        ["travelGoWishlistPlaces", "travelGoWishlist"].forEach(key => {
            try {
                const storedTrips = JSON.parse(
                    localStorage.getItem(key) || "[]"
                );

                if (Array.isArray(storedTrips)) {
                    savedTrips.push(...storedTrips);
                }
            } catch {
                // Ignore invalid data.
            }
        });

        statElements[0].textContent = String(
            new Set(savedTrips.map(item => JSON.stringify(item))).size
        ).padStart(2, "0");

        if (statElements[1]) {
            statElements[1].textContent = "00";
        }

        if (statElements[2]) {
            statElements[2].textContent = "00";
        }
    }

    // LOGOUT

    logoutBtn?.addEventListener("click", () => {
        if (!confirm("Are you sure you want to logout?")) return;

        localStorage.removeItem("travelGoCurrentUser");
        localStorage.removeItem("travelGoProfile");

        window.location.href = "login.html";
    });

    // RENDER PROFILE

    function renderProfile() {
        updateWishlistCount();

        if (avatarControls) {
            avatarControls.hidden = !isEditing;
        }

        if (userData.profileImage) {
            const image = document.createElement("img");

            image.src = userData.profileImage;
            image.alt = "Profile picture";

            avatarEl.replaceChildren(image);
        } else {
            avatarEl.textContent = getInitials(userData.fullName);
        }

        sidebarNameEl.textContent =
            userData.fullName || "Guest User";

        sidebarEmailEl.textContent =
            userData.email || "Email not added";

        travellerEl.innerHTML =
            '<i class="fa-solid fa-location-dot"></i> Travel Explorer';

        const fieldValues = [
            userData.fullName,
            userData.email,
            userData.phone,
            userData.location
        ];

        infoBlocks.forEach((block, index) => {
            const strongEl = block.querySelector("strong");

            if (isEditing) {
                const input = document.createElement("input");

                input.type =
                    index === 1 ? "email" :
                    index === 2 ? "tel" : "text";

                input.className = "profile-edit-input";
                input.value = fieldValues[index] || "";

                input.placeholder =
                    index === 0 ? "Enter full name" :
                    index === 1 ? "Enter email" :
                    index === 2 ? "Enter phone number" :
                    "Enter location";

                input.style.cssText = `
                    width: 100%;
                    padding: 6px 10px;
                    border: 1px solid #d9e5e8;
                    border-radius: 6px;
                    font-size: 0.95rem;
                    font-family: inherit;
                    color: #17324d;
                `;

                strongEl.replaceChildren(input);
            } else {
                strongEl.textContent =
                    fieldValues[index] || "Not added";
            }
        });

        editBtn.textContent = isEditing
            ? "Save Changes"
            : "Edit Profile";

        editBtn.style.backgroundColor = "";

        // NOTIFICATIONS

        if (accountOptions[1]) {
            accountOptions[1].querySelector("span").textContent =
                userData.notifications
                    ? "Enabled — Receiving trip alerts"
                    : "Disabled — Notifications muted";
        }
    }

    // EDIT PROFILE

    editBtn.addEventListener("click", () => {

        if (isEditing) {
            const inputs = document.querySelectorAll(".profile-edit-input");

            const newName = inputs[0].value.trim();
            const newEmail = inputs[1].value.trim().toLowerCase();
            const newPhone = inputs[2].value.trim();
            const newLocation = inputs[3].value.trim();

            if (!newName || !newEmail) {
                alert("Full Name and Email are required.");
                return;
            }

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
                alert("Please enter a valid email address.");
                return;
            }

            const emailExists = users.some(
                (user, index) =>
                    index !== userIndex &&
                    user.email.toLowerCase() === newEmail
            );

            if (emailExists) {
                alert("This email is already registered with another account.");
                return;
            }

            const previousData = { ...userData };

            userData.fullName = newName;
            userData.email = newEmail;
            userData.phone = newPhone;
            userData.location = newLocation;

            try {
                saveData();
                isEditing = false;
            } catch {
                userData = previousData;
                alert("Profile could not be saved.");
                return;
            }

        } else {
            isEditing = true;
        }

        renderProfile();
    });

    // PROFILE PICTURE

    avatarInput?.addEventListener("change", () => {
        const file = avatarInput.files?.[0];

        if (!file) return;

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif"
        ];

        if (!allowedTypes.includes(file.type)) {
            alert("Choose a JPEG, PNG, WebP, or GIF image.");
            avatarInput.value = "";
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            alert("Choose an image smaller than 2 MB.");
            avatarInput.value = "";
            return;
        }

        const reader = new FileReader();

        reader.addEventListener("load", () => {
            const previousImage = userData.profileImage;

            userData.profileImage = reader.result;

            try {
                saveData();
                renderProfile();
            } catch {
                userData.profileImage = previousImage;
                alert("Profile picture could not be saved.");
                renderProfile();
            }

            avatarInput.value = "";
        });

        reader.addEventListener("error", () => {
            alert("The selected image could not be read.");
            avatarInput.value = "";
        });

        reader.readAsDataURL(file);
    });

    // PASSWORD AND NOTIFICATIONS

    accountOptions.forEach((option, index) => {
        option.style.cursor = "pointer";

        option.addEventListener("click", event => {
            event.preventDefault();

            if (index === 0) {
                const currentPassword = prompt(
                    "Enter your current password:"
                );

                if (currentPassword === null) return;

                if (!userData.password) {
                    alert("Password verification is unavailable for this account.");
                    return;
                }

                if (currentPassword !== userData.password) {
                    alert("Current password is incorrect.");
                    return;
                }

                const newPassword = prompt("Enter your new password:");

                if (newPassword === null) return;

                if (newPassword.length < 6) {
                    alert("Password must contain at least 6 characters.");
                    return;
                }

                const confirmPassword = prompt("Confirm your new password:");

                if (confirmPassword === null) return;

                if (newPassword !== confirmPassword) {
                    alert("New passwords do not match.");
                    return;
                }

                const previousPassword = userData.password;

                userData.password = newPassword;

                try {
                    saveData();
                    alert("Password changed successfully!");
                } catch {
                    userData.password = previousPassword;
                    alert("Password could not be changed.");
                }
            }

            if (index === 1) {
                const previousStatus = userData.notifications;

                userData.notifications = !userData.notifications;

                try {
                    saveData();
                    renderProfile();

                    alert(
                        userData.notifications
                            ? "Notifications enabled."
                            : "Notifications disabled."
                    );
                } catch {
                    userData.notifications = previousStatus;
                    alert("Notification setting could not be saved.");
                }
            }
        });
    });

    // UPDATE WISHLIST COUNT

    window.addEventListener("storage", event => {
        if (
            [
                "travelGoWishlistPlaces",
                "travelGoWishlist",
                "travelGoWishlistSeeded"
            ].includes(event.key)
        ) {
            updateWishlistCount();
        }
    });

    // INITIAL RENDER

    renderProfile();

});
