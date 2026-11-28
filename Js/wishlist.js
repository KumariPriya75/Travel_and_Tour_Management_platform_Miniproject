
document.addEventListener("DOMContentLoaded", () => {

    const WISHLIST_KEY = "travelgo-wishlist";

    const grid = document.getElementById("wishlist-grid");
    const countText = document.getElementById("wishlist-count");
    const summaryCount = document.getElementById("summary-count");
    const sortSelect = document.getElementById("wishlist-sort");
    const emptyMessage = document.getElementById("empty-wishlist");
    const filters = document.querySelectorAll(".wishlist-sidebar input[type='checkbox']");

    let tours = [];
    let savedIds = [];

    function getWishlist() {
        try {
            const data = JSON.parse(localStorage.getItem(WISHLIST_KEY) || "[]");
            return Array.isArray(data) ? data.map(String) : [];
        } catch {
            return [];
        }
    }

    function saveWishlist() {
        localStorage.setItem(WISHLIST_KEY, JSON.stringify(savedIds));
    }

    function getImagePath(image) {
        if (!image) return "";

        if (image.startsWith("../") || image.startsWith("/") || image.startsWith("http")) {
            return image;
        }

        return "../images/" + image;
    }

    function getCategory(tour) {
        const type = String(tour.type || "").toLowerCase();
        const details = (tour.name + " " + tour.destination + " " + type).toLowerCase();

        if (type.includes("beach") || details.includes("beach") || details.includes("andaman")) {
            return "beach";
        }

        if (type.includes("mountain") || details.includes("mountain") ||
            details.includes("manali") || details.includes("ladakh")) {
            return "mountain";
        }

        if (type.includes("adventure") || details.includes("adventure") ||
            details.includes("rishikesh")) {
            return "adventure";
        }

        if (type.includes("cultural") || type.includes("religious") ||
            details.includes("rajasthan")) {
            return "cultural";
        }

        return type || "other";
    }

    function createCard(tour) {
        const card = document.createElement("article");
        card.className = "travel-card";
        card.dataset.id = String(tour.id);
        card.dataset.category = getCategory(tour);

        const imageArea = document.createElement("div");
        imageArea.className = "card-image";

        const image = document.createElement("img");
        const tourImage = tour.images && tour.images.length
            ? tour.images[0]
            : tour.image;

        image.src = getImagePath(tourImage);
        image.alt = tour.name;

        imageArea.appendChild(image);

        const category = document.createElement("span");
        category.className = "category";
        category.textContent = String(tour.type || "TOUR").toUpperCase();
        imageArea.appendChild(category);

        const heart = document.createElement("button");
        heart.className = "wishlist-heart";
        heart.type = "button";
        heart.setAttribute("aria-label", "Remove from wishlist");
        heart.innerHTML = '<i class="fa-solid fa-heart"></i>';

        heart.addEventListener("click", () => {
            savedIds = savedIds.filter(id => id !== String(tour.id));
            saveWishlist();
            renderWishlist();
        });

        imageArea.appendChild(heart);

        const body = document.createElement("div");
        body.className = "card-body";

        const name = document.createElement("h2");
        name.textContent = tour.name;
        body.appendChild(name);

        const place = document.createElement("div");
        place.className = "place";
        place.innerHTML = '<i class="fa-solid fa-location-dot"></i> ';
        place.appendChild(document.createTextNode(tour.destination || ""));
        body.appendChild(place);

        const rating = document.createElement("div");
        rating.className = "rating";
        rating.appendChild(document.createTextNode("★★★★★ "));

        const ratingValue = document.createElement("span");
        ratingValue.textContent = tour.rating || "N/A";
        rating.appendChild(ratingValue);
        body.appendChild(rating);

        const duration = document.createElement("div");
        duration.className = "duration";
        duration.innerHTML = '<i class="fa-regular fa-clock"></i> ';

        const days = Number(tour.duration);
        duration.appendChild(document.createTextNode(
            Number.isFinite(days) && days > 0
                ? `${days} Days`
                : (tour.duration || "Duration not available")
        ));
        body.appendChild(duration);

        const footer = document.createElement("div");
        footer.className = "card-footer";

        const priceBox = document.createElement("div");

        const small = document.createElement("small");
        small.textContent = "Starting from";

        const price = document.createElement("strong");
        price.textContent = "₹" + Number(tour.price || 0).toLocaleString("en-IN");

        priceBox.append(small, price);
        footer.appendChild(priceBox);

        const viewButton = document.createElement("button");
        viewButton.type = "button";
        viewButton.textContent = "View Trip";

        viewButton.addEventListener("click", () => {
            window.location.href = `tour-details.html?id=${encodeURIComponent(tour.id)}`;
        });

        footer.appendChild(viewButton);
        body.appendChild(footer);

        card.append(imageArea, body);

        return card;
    }

    function renderWishlist() {
        savedIds = getWishlist();

        const savedTours = tours.filter(tour =>
            savedIds.includes(String(tour.id))
        );

        const selectedFilters = Array.from(filters)
            .filter(filter => filter.checked)
            .map(filter => filter.value);

        let displayedTours = savedTours.filter(tour =>
            selectedFilters.length === 0 ||
            selectedFilters.includes(getCategory(tour))
        );

        if (sortSelect.value === "low") {
            displayedTours.sort((a, b) => Number(a.price) - Number(b.price));
        } else if (sortSelect.value === "high") {
            displayedTours.sort((a, b) => Number(b.price) - Number(a.price));
        } else if (sortSelect.value === "popular") {
            displayedTours.sort((a, b) => Number(b.rating) - Number(a.rating));
        }

        grid.innerHTML = "";

        displayedTours.forEach(tour => {
            grid.appendChild(createCard(tour));
        });

        countText.textContent =
            `${displayedTours.length} trip${displayedTours.length === 1 ? "" : "s"} saved`;

        summaryCount.textContent = String(savedTours.length).padStart(2, "0");

        emptyMessage.style.display = savedTours.length === 0 ? "block" : "none";
grid.style.display = savedTours.length === 0 ? "none" : "grid";
        if (savedTours.length > 0 && displayedTours.length === 0) {
            emptyMessage.textContent = "No tours match the selected filters.";
            emptyMessage.style.display = "block";
        } else {
            emptyMessage.textContent =
                "Your wishlist is empty. Explore tours and add your favourites!";
        }
    }

    fetch("../data/tours.json")
        .then(response => {
            if (!response.ok) {
                throw new Error("Unable to load tours.json");
            }

            return response.json();
        })
        .then(data => {
            tours = data;
            renderWishlist();
        })
        .catch(error => {
            console.error("Error loading tours:", error);
            grid.innerHTML = "<p>Unable to load wishlist. Please try again.</p>";
        });

    filters.forEach(filter => {
        filter.addEventListener("change", renderWishlist);
    });

    sortSelect.addEventListener("change", renderWishlist);

    document.querySelector(".explore-btn").addEventListener("click", () => {
        window.location.href = "tours.html";
    });

    window.addEventListener("storage", event => {
        if (event.key === WISHLIST_KEY) {
            renderWishlist();
        }
    });

});
