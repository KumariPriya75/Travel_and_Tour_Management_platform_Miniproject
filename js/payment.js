const paymentForm = document.getElementById("payment-form");
const payButton = document.getElementById("pay-button");
const processingOverlay = document.getElementById("processing-overlay");

let bookingData = {};
let selectedMethod = "card";

try {
    bookingData = JSON.parse(sessionStorage.getItem("travelgoBooking")) || {};
} catch (error) {
    bookingData = {};
}

function getValue(keys, fallback = "") {
    for (let key of keys) {
        if (bookingData[key] !== undefined && bookingData[key] !== null && bookingData[key] !== "") {
            return bookingData[key];
        }
    }
    return fallback;
}

function formatPrice(amount) {
    return "₹" + Number(amount || 0).toLocaleString("en-IN");
}

function showError(inputId, errorId, message) {
    const input = document.getElementById(inputId);
    const error = document.getElementById(errorId);

    if (input) {
        input.classList.add("invalid");
    }

    if (error) {
        error.innerText = message;
    }
}

function clearError(inputId, errorId) {
    const input = document.getElementById(inputId);
    const error = document.getElementById(errorId);

    if (input) {
        input.classList.remove("invalid");
    }

    if (error) {
        error.innerText = "";
    }
}

// LOAD BOOKING DETAILS

function loadBookingDetails() {
    const tourName = getValue(["tourName", "name", "selectedTour"], "Your Selected Tour");
    const travellers = getValue(["travellers", "travelers", "numberOfTravellers"], 2);
    const duration = getValue(["duration", "tourDuration"], "Tour Package");
    const travelDate = getValue(["travelDate", "selectedDate", "date"], "Not selected");

    const basePrice = Number(getValue(["basePrice", "tourPrice", "price"], 0));

    let addons = getValue(["addons", "addOns", "totalAddons"], 0);
    let addonTotal = 0;

    if (typeof addons === "number" || typeof addons === "string") {
        addonTotal = Number(addons) || 0;
    } else if (Array.isArray(addons)) {
        addonTotal = addons.reduce((total, item) => {
            return total + Number(item.price || 0);
        }, 0);
    } else if (typeof addons === "object" && addons !== null) {
        addonTotal = Object.values(addons).reduce((total, item) => {
            if (typeof item === "number") {
                return total + item;
            }

            if (typeof item === "object" && item !== null) {
                return total + Number(item.price || 0);
            }

            return total;
        }, 0);
    }

    const taxes = Number(getValue(["taxes", "taxAmount"], (basePrice + addonTotal) * 0.10));

    const total = Number(getValue(
        ["totalAmount", "totalPrice", "grandTotal"],
        basePrice + addonTotal + taxes
    ));

    const image = getValue(["image", "tourImage", "imageUrl"], "");

    document.getElementById("payment-tour-name").innerText = tourName;
    document.getElementById("payment-travellers").innerText = travellers + " Travellers";
    document.getElementById("payment-duration").innerText = duration;
    document.getElementById("payment-date").innerText = travelDate;

    document.getElementById("payment-base").innerText = formatPrice(basePrice);
    document.getElementById("payment-addons").innerText = formatPrice(addonTotal);
    document.getElementById("payment-taxes").innerText = formatPrice(taxes);
    document.getElementById("payment-total").innerText = formatPrice(total);

    if (image) {
        document.getElementById("payment-tour-image").src = image;
    }

    bookingData.totalAmount = total;
    bookingData.basePrice = basePrice;
    bookingData.addons = addonTotal;
    bookingData.taxes = taxes;

    sessionStorage.setItem("travelgoBooking", JSON.stringify(bookingData));
}

loadBookingDetails();

// CHANGE PAYMENT METHOD

document.querySelectorAll(".pay-tab").forEach(tab => {
    tab.addEventListener("click", function () {
        selectedMethod = this.dataset.method;

        document.querySelectorAll(".pay-tab").forEach(item => {
            item.classList.remove("active");
        });

        this.classList.add("active");

        document.querySelectorAll(".payment-form").forEach(form => {
            form.classList.remove("active");
        });

        document.getElementById("form-" + selectedMethod).classList.add("active");
    });
});

// CARD NUMBER FORMATTING

const cardNumber = document.getElementById("card-number");

cardNumber.addEventListener("input", function () {
    let value = this.value.replace(/\D/g, "").substring(0, 16);
    this.value = value.replace(/(.{4})/g, "$1 ").trim();

    document.getElementById("preview-number").innerText =
        value.length > 0
            ? value.padEnd(16, "*").replace(/(.{4})/g, "$1 ").trim()
            : "**** **** **** ****";

    clearError("card-number", "card-number-error");
});

// CARD NAME PREVIEW

document.getElementById("card-name").addEventListener("input", function () {
    document.getElementById("preview-name").innerText =
        this.value.trim() || "YOUR NAME";

    clearError("card-name", "card-name-error");
});

// EXPIRY DATE FORMATTING

const expiryInput = document.getElementById("card-expiry");

expiryInput.addEventListener("input", function () {
    let value = this.value.replace(/\D/g, "").substring(0, 4);

    if (value.length > 2) {
        value = value.substring(0, 2) + "/" + value.substring(2);
    }

    this.value = value;
    document.getElementById("preview-expiry").innerText = value || "MM/YY";

    clearError("card-expiry", "card-expiry-error");
});

// CVV

document.getElementById("card-cvv").addEventListener("input", function () {
    this.value = this.value.replace(/\D/g, "").substring(0, 3);
    clearError("card-cvv", "card-cvv-error");
});

// UPI INPUT

document.getElementById("upi-id").addEventListener("input", function () {
    clearError("upi-id", "upi-error");
});

// VALIDATE CARD

function validateCard() {
    let valid = true;

    const name = document.getElementById("card-name").value.trim();
    const number = document.getElementById("card-number").value.replace(/\s/g, "");
    const expiry = document.getElementById("card-expiry").value.trim();
    const cvv = document.getElementById("card-cvv").value.trim();

    if (!/^[a-zA-Z ]{3,}$/.test(name)) {
        showError("card-name", "card-name-error", "Enter a valid cardholder name.");
        valid = false;
    } else {
        clearError("card-name", "card-name-error");
    }

    if (!/^\d{16}$/.test(number)) {
        showError("card-number", "card-number-error", "Enter a 16-digit demo card number.");
        valid = false;
    } else {
        clearError("card-number", "card-number-error");
    }

    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) {
        showError("card-expiry", "card-expiry-error", "Enter expiry in MM/YY format.");
        valid = false;
    } else {
        const parts = expiry.split("/");
        const month = Number(parts[0]);
        const year = 2000 + Number(parts[1]);
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1;
        const currentYear = currentDate.getFullYear();

        if (year < currentYear || (year === currentYear && month < currentMonth)) {
            showError("card-expiry", "card-expiry-error", "Card expiry date must be in the future.");
            valid = false;
        } else {
            clearError("card-expiry", "card-expiry-error");
        }
    }

    if (!/^\d{3}$/.test(cvv)) {
        showError("card-cvv", "card-cvv-error", "Enter a 3-digit demo CVV.");
        valid = false;
    } else {
        clearError("card-cvv", "card-cvv-error");
    }

    return valid;
}

// VALIDATE UPI

function validateUPI() {
    const upi = document.getElementById("upi-id").value.trim();
    const upiPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;

    if (!upiPattern.test(upi)) {
        showError("upi-id", "upi-error", "Enter a valid sample UPI ID, e.g. demo@upi.");
        return false;
    }

    clearError("upi-id", "upi-error");
    return true;
}

// VALIDATE NET BANKING

function validateNetBanking() {
    const bank = document.getElementById("bankSelect").value;

    if (!bank) {
        showError("bankSelect", "bank-error", "Please select your bank.");
        return false;
    }

    clearError("bankSelect", "bank-error");
    return true;
}

// PAYMENT SUBMISSION

paymentForm.addEventListener("submit", function (event) {
    event.preventDefault();

    let isValid = false;

    if (selectedMethod === "card") {
        isValid = validateCard();
    } else if (selectedMethod === "upi") {
        isValid = validateUPI();
    } else if (selectedMethod === "netbanking") {
        isValid = validateNetBanking();
    }

    if (!isValid) {
        return;
    }

    payButton.disabled = true;
    payButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';

    processingOverlay.classList.add("show");

    // Only save payment status and method.
    // Card, CVV and UPI input values are never stored.

    setTimeout(function () {
        const bookingId = "TRVL-" + Date.now().toString().slice(-8);

        bookingData.paymentMethod = selectedMethod;
        bookingData.bookingId = bookingId;
        bookingData.paymentStatus = "Demo Payment Successful";
        bookingData.paymentDate = new Date().toISOString();

        if (selectedMethod === "netbanking") {
            bookingData.bankName = document.getElementById("bankSelect").value;
        }

        sessionStorage.setItem("travelgoBooking", JSON.stringify(bookingData));

        processingOverlay.classList.remove("show");

        alert("Demo payment successful! Your booking is confirmed.");

        window.location.href = "confirmation.html";

    }, 1500);
});