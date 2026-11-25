
console.log("JavaScript is connected");

const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const filterForm = document.getElementById("filter-form");
const sortSelect = document.getElementById("sort-select");
const resultsCount = document.getElementById("results-count");
const noResults = document.getElementById("no-results");
const grid = document.getElementById("tour-grid");
const pagination = document.querySelector(".pagination");

let tours = [];
let searchText = "";
let currentPage = 1;

const toursPerPage = 6;

// Load Tours from JSON
async function loadTours() {
    try {
        const response = await fetch("../data/tours.json");

        if (!response.ok) {
            throw new Error("Unable to load tours data");
        }

        tours = await response.json();
        applyFilters();

    } catch (error) {
        console.error("Error loading tours:", error);
        resultsCount.textContent = "Unable to load tours";
        noResults.textContent = "Something went wrong while loading tours.";
        noResults.style.display = "block";
    }
}

// Create Tour Card
function createTourCard(tour) {
    const card = document.createElement("article");

    card.className = "tour-card";

    const fullStars = Math.floor(Number(tour.rating));
    const emptyStars = 5 - fullStars;

    let starsHTML = "";

    for (let i = 0; i < fullStars; i++) {
        starsHTML += '<i class="fa-solid fa-star"></i>';
    }

    for (let i = 0; i < emptyStars; i++) {
        starsHTML += '<i class="fa-regular fa-star"></i>';
    }

    const nights = Math.max(0, Number(tour.duration) - 1);

    card.innerHTML = `
        <div class="card-image">
            <img src="${tour.image}" alt="${tour.name}">
            <span class="category-tag">${tour.type}</span>

            <label class="wishlist-btn">
                <input type="checkbox">
                <span class="heart-icon">
                    <i class="fa-regular fa-heart"></i>
                </span>
            </label>
        </div>

        <div class="card-body">
            <h3>${tour.name}</h3>

            <p class="destination">
                <i class="fa-solid fa-location-dot"></i>
                ${tour.destination}, India
            </p>

            <p class="rating">
                ${starsHTML}
                ${tour.rating}
            </p>

            <p class="duration">
                <i class="fa-regular fa-clock"></i>
                ${tour.duration} Days / ${nights} Nights
            </p>

            <p class="card-desc">${tour.description}</p>

            <p class="price">
                ₹${Number(tour.price).toLocaleString("en-IN")}
                <span>/ person</span>
            </p>

            <a href="${tour.detailsPage}?id=${tour.id}" class="btn-view">
                View Details
            </a>
        </div>
    `;

    card.dataset.destination = tour.destination;
    card.dataset.price = tour.price;
    card.dataset.duration = tour.duration;
    card.dataset.type = tour.type;
    card.dataset.rating = tour.rating;

    return card;
}

// Heart Fill Functionality
grid.addEventListener("change", function(e) {

    if (e.target.matches(".wishlist-btn input")) {

        const heart = e.target.parentElement.querySelector(".heart-icon i");

        if (e.target.checked) {
            heart.classList.remove("fa-regular");
            heart.classList.add("fa-solid");
        } else {
            heart.classList.remove("fa-solid");
            heart.classList.add("fa-regular");
        }
    }
});

// Get Filtered Tours
function getFilteredTours() {
    const destinations = [
        ...document.querySelectorAll('[name="destination"]:checked')
    ].map(input => input.value);

    const types = [
        ...document.querySelectorAll('[name="type"]:checked')
    ].map(input => input.value);

    const price = document.querySelector('[name="price"]:checked')?.value;
    const duration = document.querySelector('[name="duration"]:checked')?.value;
    const rating = document.querySelector('[name="rating"]:checked')?.value;

    let filteredTours = tours.filter(tour => {

        const type = tour.type;
        const amount = Number(tour.price);
        const days = Number(tour.duration);
        const stars = Number(tour.rating);

        const text = (
            tour.name + " " +
            tour.destination + " " +
            tour.type + " " +
            tour.description
        ).toLowerCase();

        let show = text.includes(searchText);

        if (destinations.length && !destinations.includes(tour.destination)) {
            show = false;
        }

        if (types.length && !types.includes(type)) {
            show = false;
        }

        if (price === "under" && amount >= 10000) {
            show = false;
        }

        if (price === "middle" && (amount < 10000 || amount > 20000)) {
            show = false;
        }

        if (price === "above" && amount <= 20000) {
            show = false;
        }

        if (duration === "short" && days > 3) {
            show = false;
        }

        if (duration === "medium" && (days < 4 || days > 7)) {
            show = false;
        }

        if (duration === "long" && days < 8) {
            show = false;
        }

        if (rating && stars < Number(rating)) {
            show = false;
        }

        return show;
    });

    return filteredTours;
}

// Sort Tours
function sortTours(tourList) {
    const sortedTours = [...tourList];

    if (sortSelect.value === "low") {
        sortedTours.sort((a, b) => Number(a.price) - Number(b.price));

    } else if (sortSelect.value === "high") {
        sortedTours.sort((a, b) => Number(b.price) - Number(a.price));

    } else {
        sortedTours.sort((a, b) => Number(b.rating) - Number(a.rating));
    }

    return sortedTours;
}

// Display Tours for Current Page
function displayTours(tourList) {
    grid.innerHTML = "";

    const startIndex = (currentPage - 1) * toursPerPage;
    const endIndex = startIndex + toursPerPage;

    const currentTours = tourList.slice(startIndex, endIndex);

    currentTours.forEach(tour => {
        grid.appendChild(createTourCard(tour));
    });

    resultsCount.textContent =
        tourList.length + (tourList.length === 1 ? " tour found" : " tours found");

    noResults.style.display = tourList.length === 0 ? "block" : "none";
}

// Display Pagination
function displayPagination(totalTours) {
    pagination.innerHTML = "";

    const totalPages = Math.ceil(totalTours / toursPerPage);

    if (totalPages <= 1) {
        return;
    }

    // Previous Button
    const previous = document.createElement("a");

    previous.href = "#";
    previous.textContent = "Previous";
    previous.className = currentPage === 1 ? "disabled" : "";

    previous.addEventListener("click", function(e) {
        e.preventDefault();

        if (currentPage > 1) {
            currentPage--;
            updatePage(true);
        }
    });

    pagination.appendChild(previous);

    // Page Numbers
    for (let i = 1; i <= totalPages; i++) {
        const pageLink = document.createElement("a");

        pageLink.href = "#";
        pageLink.textContent = i;

        if (i === currentPage) {
            pageLink.classList.add("active");
        }

        pageLink.addEventListener("click", function(e) {
            e.preventDefault();

            if (currentPage !== i) {
                currentPage = i;
                updatePage(true);
            }
        });

        pagination.appendChild(pageLink);
    }

    // Next Button
    const next = document.createElement("a");

    next.href = "#";
    next.textContent = "Next";
    next.className = currentPage === totalPages ? "disabled" : "";

    next.addEventListener("click", function(e) {
        e.preventDefault();

        if (currentPage < totalPages) {
            currentPage++;
            updatePage(true);
        }
    });

    pagination.appendChild(next);
}

// Update Current Page
function updatePage(scrollToTop = false) {
    const filteredTours = sortTours(getFilteredTours());

    const totalPages = Math.ceil(filteredTours.length / toursPerPage);

    if (currentPage > totalPages) {
        currentPage = Math.max(1, totalPages);
    }

    displayTours(filteredTours);
    displayPagination(filteredTours.length);

    if (scrollToTop) {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }
}

// Apply Search and Filters
function applyFilters() {
    currentPage = 1;
    updatePage();
}

// Search
function searchTours() {
    searchText = searchInput.value.toLowerCase().trim();
    applyFilters();
}

searchForm.addEventListener("submit", function(e) {
    e.preventDefault();
    searchTours();
});

searchInput.addEventListener("input", searchTours);

// Apply Checkbox Filters
filterForm.querySelectorAll('input[type="checkbox"]').forEach(input => {

    input.addEventListener("change", function() {
        applyFilters();
    });
});

// Radio Buttons: Single Click Apply and Second Click Remove
filterForm.querySelectorAll('input[type="radio"]').forEach(radio => {

    radio.addEventListener("mousedown", function() {
        this.dataset.wasChecked = this.checked;
    });

    radio.addEventListener("click", function() {

        if (this.dataset.wasChecked === "true") {

            this.checked = false;

            this.dataset.wasChecked = "false";

            applyFilters();

        } else {

            this.dataset.wasChecked = "false";

            applyFilters();
        }
    });

});
// Apply Filters Button
filterForm.addEventListener("submit", function(e) {
    e.preventDefault();
    applyFilters();
});

// Sorting
sortSelect.addEventListener("change", function() {
    applyFilters();
});

// Clear All
filterForm.addEventListener("reset", function() {

    searchInput.value = "";
    searchText = "";
    sortSelect.value = "low";

    setTimeout(function() {
        applyFilters();
    }, 0);
});

// Initial Display
loadTours();
