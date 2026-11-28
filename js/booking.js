
const bookingForm = document.getElementById("booking-form");

const urlParams = new URLSearchParams(window.location.search);
const tourId = urlParams.get("id");
const selectedDate = urlParams.get("date");

let selectedTour = null;

const addonPrices = {
    airport: 50,
    insurance: 85,
    guide: 120,
    hotel: 150
};

function formatPrice(amount) {
    return "₹" + Number(amount).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function getTodayDate() {
    const today = new Date();

    return new Date(today.getTime() - today.getTimezoneOffset() * 60000)
        .toISOString().split("T")[0];
}

async function loadTour() {
    try {
        const response = await fetch("../data/tours.json");

        if (!response.ok) {
            throw new Error("Unable to load tour data");
        }

        const tours = await response.json();

        selectedTour = tours.find(tour => String(tour.id) === String(tourId));

        if (!selectedTour) {
            document.getElementById("summary-title").innerText = "No tour selected";
            document.getElementById("summary-destination").innerText = "Please select a tour first";
            bookingForm.querySelector("button[type='submit']").disabled = true;
            return;
        }

        document.getElementById("summary-title").innerText = selectedTour.name;
        document.getElementById("summary-destination").innerText = selectedTour.destination;
        document.getElementById("summary-duration").innerText =
            selectedTour.duration + (selectedTour.duration === 1 ? " Day" : " Days");

        document.getElementById("summary-img").src = selectedTour.image;
        document.getElementById("summary-img").alt = selectedTour.name;

        const travelDate = document.getElementById("travelDate");
        const minDate = getTodayDate();

        travelDate.min = minDate;

        if (selectedDate && selectedDate >= minDate) {
            travelDate.value = selectedDate;
        }

        calculateTotal();

    } catch (error) {
        console.error("Error loading tour:", error);
        document.getElementById("summary-title").innerText = "Unable to load tour";
    }
}

function calculateTotal() {
    if (!selectedTour) return;

    const travellers = Number(document.getElementById("travellers").value) || 1;

    const baseTotal = selectedTour.price * travellers;

    let addonsTotal = 0;

    document.querySelectorAll('input[name="addons"]:checked').forEach(checkbox => {
        addonsTotal += addonPrices[checkbox.value] || 0;
    });

    const subtotal = baseTotal + addonsTotal;
    const taxes = subtotal * 0.10;
    const total = subtotal + taxes;

    document.getElementById("tour-price-label").innerText =
        "Tour Price (x" + travellers + ")";

    document.getElementById("base-price").innerText = formatPrice(baseTotal);
    document.getElementById("addons-price").innerText = formatPrice(addonsTotal);
    document.getElementById("taxes-price").innerText = formatPrice(taxes);
    document.getElementById("total-price").innerText = formatPrice(total);

    return {
        baseTotal,
        addonsTotal,
        taxes,
        total
    };
}

document.getElementById("travellers").addEventListener("input", calculateTotal);

document.querySelectorAll('input[name="addons"]').forEach(checkbox => {
    checkbox.addEventListener("change", calculateTotal);
});

bookingForm.addEventListener("submit", function(event) {
    event.preventDefault();

    if (!selectedTour) {
        alert("Please select a tour first.");
        return;
    }

    if (!bookingForm.checkValidity()) {
        bookingForm.reportValidity();
        return;
    }

    const travelDate = document.getElementById("travelDate").value;
    const minDate = getTodayDate();

    if (!travelDate || travelDate < minDate) {
        alert("Please select today or a future travel date.");
        return;
    }

    const priceDetails = calculateTotal();

    const selectedAddons = [];

    document.querySelectorAll('input[name="addons"]:checked').forEach(checkbox => {
        selectedAddons.push({
            name: checkbox.value,
            price: addonPrices[checkbox.value]
        });
    });

    const bookingData = {
        tour: selectedTour,
        firstName: document.getElementById("firstName").value,
        lastName: document.getElementById("lastName").value,
        email: document.getElementById("email").value,
        phone: document.getElementById("phone").value,
        travellers: Number(document.getElementById("travellers").value),
        travelDate: travelDate,
        roomPref: document.getElementById("roomPref").value,
        addons: selectedAddons,
        baseTotal: priceDetails.baseTotal,
        addonsTotal: priceDetails.addonsTotal,
        taxes: priceDetails.taxes,
        total: priceDetails.total
    };

    sessionStorage.setItem("travelgoBooking", JSON.stringify(bookingData));

    window.location.href = "payment.html";
});

loadTour();
