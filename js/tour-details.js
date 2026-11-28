
console.log("Tour Details JavaScript connected");

const tourId = new URLSearchParams(window.location.search).get("id");

const loadingMessage = document.getElementById("loading-message");
const tourContent = document.getElementById("tour-content");

const tourName = document.getElementById("tour-name");
const tourDestination = document.getElementById("tour-destination");
const tourRating = document.getElementById("tour-rating");
const tourDuration = document.getElementById("tour-duration");
const tourDescription = document.getElementById("tour-description");
const tourPrice = document.getElementById("tour-price");

const galleryMain = document.getElementById("gallery-main");
const galleryThumbs = document.getElementById("gallery-thumbs");

const highlights = document.getElementById("tour-highlights");
const itinerary = document.getElementById("tour-itinerary");
const included = document.getElementById("tour-included");
const excluded = document.getElementById("tour-excluded");

const faqDuration = document.getElementById("faq-duration");
const faqDestination = document.getElementById("faq-destination");

const travelDate = document.getElementById("travel-date");
const selectedDate = document.getElementById("selected-date");

fetch("../data/tours.json")
    .then(response => {
        if (!response.ok) {
            throw new Error("Unable to load tours.json");
        }
        return response.json();
    })
    .then(tours => {
        const tour = tours.find(item => String(item.id) === String(tourId));

        if (!tour) {
            loadingMessage.textContent = "Tour not found!";
            return;
        }

        displayTour(tour);

        loadingMessage.style.display = "none";
        tourContent.style.display = "block";
    })
    .catch(error => {
        console.error("Error loading tour:", error);
        loadingMessage.textContent = "Unable to load tour details. Please try again.";
    });

// Display Tour Details
function displayTour(tour) {
    tourName.textContent = tour.name;
    tourDestination.textContent = tour.destination;
    tourRating.textContent = "★ " + tour.rating;
    tourDuration.textContent = tour.duration + " Days";
    tourDescription.textContent = tour.description;
    tourPrice.textContent = "₹" + Number(tour.price).toLocaleString("en-IN");

    if (faqDuration) {
        faqDuration.textContent = tour.duration + " days";
    }

    if (faqDestination) {
        faqDestination.textContent = tour.destination;
    }

    displayGallery(tour);
    displayHighlights(tour);
    displayItinerary(tour);
    displayIncludedExcluded(tour);
    setupTravelDate();
setupWishlist(tour);
setupBooking(tour);
}

// Wishlist Functionality

function setupWishlist(tour) {
    const wishlistInput = document.querySelector(".wishlist-full input");
    const heartIcon = document.querySelector(".wishlist-full .heart-icon i");

    if (!wishlistInput) return;

    const WISHLIST_KEY = "travelgo-wishlist";

    function getWishlist() {
        return JSON.parse(localStorage.getItem(WISHLIST_KEY)) || [];
    }

    function updateHeart() {
        const wishlist = getWishlist();
        const isWishlisted = wishlist.includes(String(tour.id));

        wishlistInput.checked = isWishlisted;

        if (heartIcon) {
            heartIcon.classList.toggle("fa-solid", isWishlisted);
            heartIcon.classList.toggle("fa-regular", !isWishlisted);
        }
    }

    updateHeart();

    wishlistInput.addEventListener("change", function() {
        let wishlist = getWishlist();
        const tourId = String(tour.id);

        if (wishlistInput.checked) {
            if (!wishlist.includes(tourId)) {
                wishlist.push(tourId);
            }
        } else {
            wishlist = wishlist.filter(id => id !== tourId);
        }

        localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
        updateHeart();
    });
}


// Display Gallery
function displayGallery(tour) {
    const images = tour.images && tour.images.length
        ? tour.images
        : [tour.image];

    galleryMain.innerHTML = "";
    galleryThumbs.innerHTML = "";

    images.forEach((image, index) => {
        const mainImage = document.createElement("img");

        mainImage.src = image;
        mainImage.alt = tour.name + " image " + (index + 1);
        mainImage.className = "g-img";

        if (index === 0) {
            mainImage.classList.add("active");
        }

        galleryMain.appendChild(mainImage);

        const thumbnail = document.createElement("img");

        thumbnail.src = image;
        thumbnail.alt = "Tour image " + (index + 1);
        thumbnail.className = "gallery-thumbnail";

        if (index === 0) {
            thumbnail.classList.add("active");
        }

        thumbnail.addEventListener("click", () => {
            galleryMain.querySelectorAll(".g-img").forEach(img => {
                img.classList.remove("active");
            });

            galleryThumbs.querySelectorAll("img").forEach(img => {
                img.classList.remove("active");
            });

            mainImage.classList.add("active");
            thumbnail.classList.add("active");
        });

        galleryThumbs.appendChild(thumbnail);
    });
}

// Display Highlights
function displayHighlights(tour) {
    const defaultHighlights = [
        "Explore popular attractions",
        "Enjoy local food and culture",
        "Experience beautiful sightseeing",
        "Capture memorable moments"
    ];

    const items = tour.highlights && tour.highlights.length
        ? tour.highlights
        : defaultHighlights;

    highlights.innerHTML = "";

    items.forEach(item => {
        const li = document.createElement("li");
        li.textContent = item;
        highlights.appendChild(li);
    });
}

// Display Itinerary
function displayItinerary(tour) {
    itinerary.innerHTML = "";

    if (!tour.itinerary || tour.itinerary.length === 0) {
        itinerary.textContent = "Itinerary information is currently unavailable.";
        return;
    }

    tour.itinerary.forEach((item, index) => {
        const dayCard = document.createElement("div");
        dayCard.className = "itinerary-day";

        const dayTitle = document.createElement("h3");
        dayTitle.textContent = item.day || "Day " + (index + 1);

        const title = document.createElement("h4");
        title.textContent = item.title || "Explore the Destination";

        const description = document.createElement("p");
        description.textContent = item.description || "Enjoy your day exploring the destination.";

        dayCard.appendChild(dayTitle);
        dayCard.appendChild(title);
        dayCard.appendChild(description);

        itinerary.appendChild(dayCard);
    });
}

// Display Included and Excluded
function displayIncludedExcluded(tour) {
    included.innerHTML = "";
    excluded.innerHTML = "";

    if (tour.included && tour.included.length > 0) {
        tour.included.forEach(item => {
            const li = document.createElement("li");
            li.textContent = item;
            included.appendChild(li);
        });
    } else {
        included.innerHTML = "<li>Information currently unavailable</li>";
    }

    if (tour.excluded && tour.excluded.length > 0) {
        tour.excluded.forEach(item => {
            const li = document.createElement("li");
            li.textContent = item;
            excluded.appendChild(li);
        });
    } else {
        excluded.innerHTML = "<li>Information currently unavailable</li>";
    }
}

// Travel Date
function setupTravelDate() {
    if (!travelDate) return;

    const today = new Date();

    const localToday = new Date(
        today.getTime() - today.getTimezoneOffset() * 60000
    ).toISOString().split("T")[0];

    travelDate.min = localToday;

    travelDate.addEventListener("change", () => {
        if (!selectedDate) return;

        if (travelDate.value) {
            const date = new Date(travelDate.value + "T00:00:00");

            selectedDate.textContent = "Selected Date: " +
                date.toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric"
                });
        } else {
            selectedDate.textContent = "";
        }
    });
}
// Booking Navigation
function setupBooking(tour) {
    const bookingButton = document.querySelector(".btn-book-now");

    if (!bookingButton) return;

    bookingButton.addEventListener("click", function(event) {
        event.preventDefault();

        if (!travelDate || !travelDate.value) {
            alert("Please select your travel date before booking.");
            travelDate.focus();
            return;
        }

        const params = new URLSearchParams();

        params.set("id", tour.id);
        params.set("date", travelDate.value);

        window.location.href = "booking.html?" + params.toString();
    });
}