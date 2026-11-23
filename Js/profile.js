document.addEventListener("DOMContentLoaded", () => {
  // ==========================================
  // 1. SELECTORS (Mapped to your exact HTML)
  // ==========================================
  const editBtn = document.querySelector(".edit-profile");
  const avatarEl = document.querySelector(".avatar");
  const avatarControls = document.querySelector(".avatar-controls");
  const avatarInput = document.querySelector("#profile-picture");
  const sidebarNameEl = document.querySelector(".profile-main h2");
  const sidebarEmailEl = document.querySelector(".profile-email");
  const wishlistCountEl = document.querySelector(".profile-stat > div:first-child strong");

  // Personal Information Grid items (0: Name, 1: Email, 2: Phone, 3: Location)
  const infoBlocks = document.querySelectorAll(".information-grid .information");
  
  // Travel Preferences cards
  const preferenceCards = document.querySelectorAll(".preference-list .preference");

  // Account Settings rows (0: Password, 1: Notifications, 2: Language)
  const accountOptions = document.querySelectorAll(".account-option");

  // ==========================================
  // 2. INITIAL STATE & LOCALSTORAGE
  // ==========================================
  const defaultData = {
    fullName: "Krishna Bansal",
    email: "krishna@example.com",
    phone: "+91 98765 43210",
    location: "India",
    preferences: ["Adventure", "Beaches", "Culture"],
    notifications: true,
    language: "English"
  };

  let userData = JSON.parse(localStorage.getItem("travelGoProfile")) || defaultData;
  let isEditing = false;
  const defaultWishlistPlaces = ["Paris", "Maldives", "Switzerland", "Bali"];

  // ==========================================
  // 3. HELPER FUNCTIONS
  // ==========================================
  function getInitials(name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  function saveData() {
    localStorage.setItem("travelGoProfile", JSON.stringify(userData));
  }

  function updateWishlistCount() {
    if (!wishlistCountEl) return;
    const savedTrips = [];
    ["travelGoWishlistPlaces", "travelGoWishlist"].forEach((key) => {
      try {
        const storedTrips = JSON.parse(localStorage.getItem(key) || "[]");
        if (Array.isArray(storedTrips)) savedTrips.push(...storedTrips);
      } catch {
        // Ignore invalid saved data and continue with the other wishlist source.
      }
    });
    if (localStorage.getItem("travelGoWishlistSeeded") !== "true") {
      savedTrips.push(...defaultWishlistPlaces);
    }
    wishlistCountEl.textContent = String(new Set(savedTrips).size).padStart(2, "0");
  }

  // ==========================================
  // 4. RENDER PROFILE DATA TO UI
  // ==========================================
  function renderProfile() {
    updateWishlistCount();
    avatarControls.hidden = !isEditing;

    // Update Sidebar
    if (userData.profileImage) {
      const image = document.createElement("img");
      image.src = userData.profileImage;
      image.alt = "Profile picture";
      avatarEl.replaceChildren(image);
    } else {
      avatarEl.textContent = getInitials(userData.fullName);
    }
    sidebarNameEl.textContent = userData.fullName;
    sidebarEmailEl.textContent = userData.email;

    // Update Personal Information Fields
    const fieldValues = [
      userData.fullName,
      userData.email,
      userData.phone,
      userData.location
    ];

    infoBlocks.forEach((block, index) => {
      const strongEl = block.querySelector("strong");
      if (isEditing) {
        const inputType = index === 1 ? "email" : index === 2 ? "tel" : "text";
        strongEl.innerHTML = `
          <input 
            type="${inputType}" 
            class="profile-edit-input" 
            value="${fieldValues[index]}" 
            style="width: 100%; padding: 6px 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.95rem; font-family: inherit; color: #0a192f;"
          />
        `;
      } else {
        strongEl.textContent = fieldValues[index];
      }
    });

    // Update Edit Button appearance
    if (isEditing) {
      editBtn.textContent = "Save Changes";
      editBtn.style.backgroundColor = "#10b981"; // Green save state
    } else {
      editBtn.textContent = "Edit Profile";
      editBtn.style.backgroundColor = ""; // Reverts to your CSS color
    }

    // Update Preferences Active State
    preferenceCards.forEach((card) => {
      const title = card.querySelector("strong").textContent.trim();
      if (userData.preferences.includes(title)) {
        card.style.border = "2px solid #ef3b4f";
        card.style.backgroundColor = "#fff5f6";
      } else {
        card.style.border = "2px solid transparent";
        card.style.backgroundColor = "";
      }
    });

    // Update Account Settings Subtitles
    if (accountOptions[1]) {
      accountOptions[1].querySelector("span").textContent = userData.notifications
        ? "Enabled — Receiving trip alerts"
        : "Disabled — Notifications muted";
    }
    if (accountOptions[2]) {
      accountOptions[2].querySelector("span").textContent = userData.language;
    }
  }

  window.addEventListener("storage", (event) => {
    if (["travelGoWishlistPlaces", "travelGoWishlist", "travelGoWishlistSeeded"].includes(event.key)) {
      updateWishlistCount();
    }
  });

  // ==========================================
  // 5. EVENT LISTENERS
  // ==========================================

  // A. Edit / Save Profile Button
  editBtn.addEventListener("click", () => {
    if (isEditing) {
      const inputs = document.querySelectorAll(".profile-edit-input");
      const newName = inputs[0].value.trim();
      const newEmail = inputs[1].value.trim();
      const newPhone = inputs[2].value.trim();
      const newLocation = inputs[3].value.trim();

      if (!newName || !newEmail) {
        alert("Full Name and Email cannot be empty.");
        return;
      }

      userData.fullName = newName;
      userData.email = newEmail;
      userData.phone = newPhone || userData.phone;
      userData.location = newLocation || userData.location;

      saveData();
      isEditing = false;
    } else {
      isEditing = true;
    }
    renderProfile();
  });

  avatarInput?.addEventListener("change", () => {
    const file = avatarInput.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
      alert("Choose a JPEG, PNG, WebP, or GIF image for your profile photo.");
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
        alert("The profile photo could not be saved. Try a smaller image.");
        renderProfile();
      }
      avatarInput.value = "";
    });
    reader.addEventListener("error", () => {
      alert("The selected profile photo could not be read.");
      avatarInput.value = "";
    });
    reader.readAsDataURL(file);
  });

  // B. Toggle Travel Preferences (Click to select/deselect)
  preferenceCards.forEach((card) => {
    card.style.cursor = "pointer";
    card.style.transition = "all 0.2s ease";

    card.addEventListener("click", () => {
      const title = card.querySelector("strong").textContent.trim();
      if (userData.preferences.includes(title)) {
        userData.preferences = userData.preferences.filter((item) => item !== title);
      } else {
        userData.preferences.push(title);
      }
      saveData();
      renderProfile();
    });
  });

  // C. Account Settings Actions
  accountOptions.forEach((option, index) => {
    option.style.cursor = "pointer";

    option.addEventListener("click", (e) => {
      e.preventDefault();

      // 0: Password & Security
      if (index === 0) {
        const newPass = prompt("Enter a new password (minimum 6 characters):");
        if (newPass && newPass.length >= 6) {
          alert("Password updated successfully!");
        } else if (newPass !== null) {
          alert("Password must be at least 6 characters long.");
        }
      }

      // 1: Notifications Toggle
      if (index === 1) {
        userData.notifications = !userData.notifications;
        saveData();
        renderProfile();
      }

      // 2: Language Switcher
      if (index === 2) {
        const languages = ["English", "Hindi", "Spanish", "French"];
        const nextIndex = (languages.indexOf(userData.language) + 1) % languages.length;
        userData.language = languages[nextIndex];
        saveData();
        renderProfile();
      }
    });
  });

  // Initial UI Render
  renderProfile();
});