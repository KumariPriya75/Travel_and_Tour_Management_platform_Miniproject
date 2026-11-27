
document.addEventListener("DOMContentLoaded", function () {

    var featuredContainer = document.querySelector(".home-tour-grid");

    if (!featuredContainer) {
        return;
    }

    fetch("../data/tours.json")
        .then(function (response) {
            if (!response.ok) {
                throw new Error("Tours data could not be loaded.");
            }

            return response.json();
        })
        .then(function (tours) {

            var featuredIds = [1, 2, 5];

            var featuredTours = tours.filter(function (tour) {
                return featuredIds.includes(Number(tour.id));
            });

            featuredContainer.innerHTML = "";

            featuredTours.forEach(function (tour) {

                var card = document.createElement("div");
                card.className = "home-tour-card";

                var imagePath = tour.image;

                card.innerHTML = `
                    <div class="tour-image">
                        <img src="${imagePath}" alt="${tour.name}">
                        <span class="tour-label">${tour.type}</span>
                    </div>

                    <div class="tour-content">
                        <h3>${tour.name}</h3>

                        <div class="tour-rating">
                            <i class="fa-solid fa-star"></i>
                            <span>${tour.rating}</span>
                            <span class="rating-text">Excellent</span>
                        </div>

                        <div class="tour-info">
                            <span>
                                <i class="fa-regular fa-clock"></i>
                                ${tour.duration} Days
                            </span>

                            <span>
                                <i class="fa-solid fa-location-dot"></i>
                                ${tour.destination}
                            </span>
                        </div>

                        <div class="tour-bottom">
                            <div>
                                <small>Starting from</small>
                                <p class="tour-price">
                                    ₹${Number(tour.price).toLocaleString("en-IN")}
                                    <span>/ person</span>
                                </p>
                            </div>

                            <a href="${tour.detailsPage}?id=${tour.id}" class="tour-link">
                                View Details
                                <i class="fa-solid fa-arrow-right"></i>
                            </a>
                        </div>
                    </div>
                `;

                featuredContainer.appendChild(card);

            });

        })
        .catch(function (error) {
            console.error("Error loading tours:", error);

            featuredContainer.innerHTML =
                "<p>Unable to load tour packages. Please try again.</p>";
        });

});
