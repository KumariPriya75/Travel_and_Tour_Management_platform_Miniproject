
document.addEventListener("DOMContentLoaded", () => {

    const editBtn = document.getElementById("edit-preferences");
    const saveBtn = document.getElementById("save-preferences");
    const cancelBtn = document.getElementById("cancel-preferences");
    const actions = document.getElementById("preference-actions");
    const message = document.getElementById("preference-message");
    const preferenceButtons = document.querySelectorAll(".preference");

    const KEY = "travelgo-preferences";

    if (!editBtn || !saveBtn || !cancelBtn || !actions || !message || !preferenceButtons.length) {
        console.error("Preferences HTML elements are missing.");
        return;
    }

    let selectedPreferences = [];
    let previousPreferences = [];
    let isEditing = false;

    try {
        selectedPreferences = JSON.parse(localStorage.getItem(KEY)) || [];
    } catch {
        selectedPreferences = [];
    }

    if (!Array.isArray(selectedPreferences)) {
        selectedPreferences = [];
    }

    function renderPreferences() {

        preferenceButtons.forEach(button => {
            const value = button.dataset.value;

            button.classList.toggle("selected", selectedPreferences.includes(value));
            button.classList.toggle("edit-mode", isEditing);
        });

        editBtn.hidden = isEditing;
        actions.hidden = !isEditing;

        if (isEditing) {
            message.textContent = "Select or deselect your favourite travel experiences.";
        } else if (selectedPreferences.length) {
            message.textContent = "Your selected travel preferences.";
        } else {
            message.textContent = "No preferences selected. Click Edit to choose.";
        }
    }

    editBtn.addEventListener("click", () => {
        previousPreferences = [...selectedPreferences];
        isEditing = true;
        renderPreferences();
    });

    preferenceButtons.forEach(button => {
        button.addEventListener("click", () => {

            if (!isEditing) return;

            const value = button.dataset.value;

            if (selectedPreferences.includes(value)) {
                selectedPreferences = selectedPreferences.filter(item => item !== value);
            } else {
                selectedPreferences.push(value);
            }

            renderPreferences();
        });
    });

    saveBtn.addEventListener("click", () => {
        try {
            localStorage.setItem(KEY, JSON.stringify(selectedPreferences));
            isEditing = false;
            renderPreferences();
            alert("Preferences saved successfully!");
        } catch {
            alert("Preferences could not be saved.");
        }
    });

    cancelBtn.addEventListener("click", () => {
        selectedPreferences = [...previousPreferences];
        isEditing = false;
        renderPreferences();
    });

    renderPreferences();

});
