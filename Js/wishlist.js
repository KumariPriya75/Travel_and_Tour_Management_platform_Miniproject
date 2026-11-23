document.addEventListener("DOMContentLoaded", () => {
  const grid = document.querySelector(".wishlist-grid");
  let cards = Array.from(document.querySelectorAll(".travel-card"));
  const countText = document.querySelector(".wishlist-top > span");
  const summaryCount = document.querySelector(".summary-box strong");
  const sortSelect = document.querySelector(".wishlist-top select");
  const wishlistKey = "travelGoWishlistPlaces";
  const legacyWishlistKey = "travelGoWishlist";
  const seededKey = "travelGoWishlistSeeded";
  const tours = {
    "Goa Beach Escape": {
      location: "Goa, India", category: "BEACH", image: "goa-1.jpg", rating: "4.5",
      duration: "3 Days / 2 Nights", price: 8999, href: "tour-details-goa.html"
    },
    "Manali Hills Adventure": {
      location: "Manali, India", category: "ADVENTURE", image: "manali-1.jpg", rating: "4.8",
      duration: "5 Days / 4 Nights", price: 14499, href: "tour-details-manali.html"
    },
    "Kerala Backwaters": {
      location: "Kerala, India", category: "NATURE", image: "kerala-1.jpg", rating: "4.6",
      duration: "4 Days / 3 Nights", price: 11999, href: "tour-details-kerala.html"
    },
    "Royal Rajasthan Trail": {
      location: "Jaipur, India", category: "CULTURAL", image: "rajasthan-1.jpg", rating: "4.4",
      duration: "6 Days / 5 Nights", price: 16999, href: "tour-details-rajasthan.html"
    },
    "Rishikesh Spiritual Journey": {
      location: "Rishikesh, India", category: "CULTURAL", image: "rishikesh-1.jpg", rating: "4.9",
      duration: "2 Days / 1 Night", price: 5499, href: "tour-details-rishikesh.html"
    },
    "Family Fun Resort Getaway": {
      location: "Lonavala, India", category: "FAMILY", image: "lonavala-1.jpg", rating: "4.3",
      duration: "3 Days / 2 Nights", price: 9499, href: "tour-details-lonavala.html"
    },
    "Andaman Island Bliss": {
      location: "Port Blair, India", category: "BEACH", image: "andaman-1.jpg", rating: "4.7",
      duration: "5 Days / 4 Nights", price: 22999, href: "tour-details-andaman.html"
    },
    "Ladakh Mountain Expedition": {
      location: "Leh, India", category: "ADVENTURE", image: "ladakh-1.jpg", rating: "4.9",
      duration: "7 Days / 6 Nights", price: 24999, href: "tour-details-ladakh.html"
    }
  };

  function readList(key) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || "[]");
      return Array.isArray(value) ? value.filter((name) => typeof name === "string") : [];
    } catch {
      return [];
    }
  }

  function getCardName(card) {
    return card.querySelector("h2")?.textContent.trim() || "";
  }

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function createTourCard(name, tour) {
    const card = element("article", "travel-card");
    card.dataset.detailsHref = tour.href;

    const imageArea = element("div", "card-image");
    const image = element("img");
    image.src = `../images/${tour.image}`;
    image.alt = name;
    imageArea.appendChild(image);
    imageArea.appendChild(element("span", "category", tour.category));

    const removeButton = element("button", "wishlist-heart");
    removeButton.type = "button";
    removeButton.setAttribute("aria-label", `Remove ${name} from wishlist`);
    removeButton.appendChild(element("i", "fa-solid fa-heart"));
    imageArea.appendChild(removeButton);

    const body = element("div", "card-body");
    body.appendChild(element("h2", "", name));

    const place = element("div", "place");
    place.appendChild(element("i", "fa-solid fa-location-dot"));
    place.appendChild(document.createTextNode(` ${tour.location}`));
    body.appendChild(place);

    const rating = element("div", "rating", "★★★★★");
    rating.appendChild(element("span", "", tour.rating));
    body.appendChild(rating);

    const duration = element("div", "duration");
    duration.appendChild(element("i", "fa-regular fa-clock"));
    duration.appendChild(document.createTextNode(` ${tour.duration}`));
    body.appendChild(duration);

    const footer = element("div", "card-footer");
    const price = element("div");
    price.appendChild(element("small", "", "Starting from"));
    price.appendChild(element("strong", "", `₹${tour.price.toLocaleString("en-IN")}`));
    footer.appendChild(price);
    footer.appendChild(element("button", "", "View Trip"));
    body.appendChild(footer);

    card.append(imageArea, body);
    return card;
  }

  function getPrice(card) {
    return Number((card.querySelector(".card-footer strong")?.textContent.match(/[\d,]+/) || ["0"])[0].replace(/,/g, ""));
  }

  function getRating(card) {
    return Number(card.querySelector(".rating span")?.textContent || 0);
  }

  const defaultPlaces = cards.map(getCardName).filter(Boolean);
  let savedPlaces = readList(wishlistKey);
  if (localStorage.getItem(seededKey) !== "true") {
    savedPlaces.push(...defaultPlaces);
  }
  savedPlaces.push(...readList(legacyWishlistKey));
  savedPlaces = [...new Set(savedPlaces)];
  localStorage.setItem(wishlistKey, JSON.stringify(savedPlaces));
  localStorage.setItem(seededKey, "true");
  localStorage.removeItem(legacyWishlistKey);

  cards.slice().forEach((card) => {
    if (!savedPlaces.includes(getCardName(card))) {
      card.remove();
    }
  });

  savedPlaces.forEach((name) => {
    if (tours[name] && !Array.from(grid.querySelectorAll(".travel-card")).some((card) => getCardName(card) === name)) {
      grid.appendChild(createTourCard(name, tours[name]));
    }
  });
  cards = Array.from(grid.querySelectorAll(".travel-card"));

  function updateCounts() {
    const visible = cards.filter((card) => card.style.display !== "none").length;
    if (countText) countText.textContent = `${visible} trip${visible === 1 ? "" : "s"} saved`;
    if (summaryCount) summaryCount.textContent = String(savedPlaces.length).padStart(2, "0");
  }

  cards.forEach((card) => {
    card.querySelector(".wishlist-heart")?.addEventListener("click", () => {
      const name = getCardName(card);
      savedPlaces = savedPlaces.filter((place) => place !== name);
      localStorage.setItem(wishlistKey, JSON.stringify(savedPlaces));
      card.remove();
      cards = cards.filter((item) => item !== card);
      updateCounts();
    });

    card.querySelector(".card-footer button")?.addEventListener("click", () => {
      window.location.href = card.dataset.detailsHref || "tours.html";
    });
  });

  document.querySelectorAll(".wishlist-sidebar input[type='checkbox']").forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const selected = Array.from(document.querySelectorAll(".wishlist-sidebar input:checked"))
        .map((input) => input.parentElement.textContent.trim().toUpperCase());
      cards.forEach((card) => {
        const category = card.querySelector(".category")?.textContent.trim().toUpperCase() || "";
        card.style.display = selected.length === 0 || selected.includes(category) ? "" : "none";
      });
      updateCounts();
    });
  });

  sortSelect?.addEventListener("change", () => {
    const sorted = [...cards];
    if (sortSelect.selectedIndex === 2) sorted.sort((a, b) => getPrice(a) - getPrice(b));
    if (sortSelect.selectedIndex === 3) sorted.sort((a, b) => getPrice(b) - getPrice(a));
    if (sortSelect.selectedIndex === 1) sorted.sort((a, b) => getRating(b) - getRating(a));
    sorted.forEach((card) => grid.appendChild(card));
  });

  document.querySelector(".explore-btn")?.addEventListener("click", () => {
    window.location.href = "tours.html";
  });

  updateCounts();
});
