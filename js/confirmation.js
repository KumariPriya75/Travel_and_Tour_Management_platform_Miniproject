
const bookingData = JSON.parse(sessionStorage.getItem("travelgoBooking"));

if (!bookingData || !bookingData.tour) {
    alert("Booking details not found. Please complete your booking first.");
    window.location.href = "tours.html";
} else {
    loadConfirmationDetails();
}

function formatPrice(amount) {
    return "₹" + Number(amount).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function loadConfirmationDetails() {
    document.getElementById("booking-id").innerText =
        "Booking ID: " + (bookingData.bookingId || "Not Available");

    document.getElementById("conf-tour").innerText =
        bookingData.tour.name || "Not Available";

    document.getElementById("conf-destination").innerText =
        bookingData.tour.destination || "Not Available";

    document.getElementById("conf-date").innerText =
        bookingData.travelDate || "Not Available";

    document.getElementById("conf-travellers").innerText =
        bookingData.travellers + (Number(bookingData.travellers) === 1 ? " Traveller" : " Travellers");

    document.getElementById("conf-method").innerText =
        bookingData.paymentMethod
            ? bookingData.paymentMethod.toUpperCase()
            : "Not Available";

    document.getElementById("conf-status").innerText =
        bookingData.paymentStatus || "Not Available";

    document.getElementById("conf-amount").innerText =
        formatPrice(bookingData.total || 0);
}

document.getElementById("download-ticket").addEventListener("click", function() {
    window.print();
});

document.getElementById("view-trip").addEventListener("click", function() {
    window.location.href = "tours.html";
});
