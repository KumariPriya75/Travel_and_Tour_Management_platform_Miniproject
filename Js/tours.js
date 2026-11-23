document.addEventListener("DOMContentLoaded", () => {
  const grid = document.querySelector(".tour-grid");
  const cards = Array.from(document.querySelectorAll(".tour-card"));
  const searchForm = document.querySelector(".search-bar");
  const searchInput = searchForm?.querySelector("input");
  const filterForm = document.querySelector(".filter-sidebar form");
  const sortSelect = document.querySelector(".sort-select");
  const resultsCount = document.querySelector(".results-count");
  const wishlistKey = "travelGoWishlistPlaces";

  function getWishlist() {
    try {
      return JSON.parse(localStorage.getItem(wishlistKey)) || [];
    } catch {
      return [];
    }
  }

  function saveWishlist(names) {
    localStorage.setItem(wishlistKey, JSON.stringify(names));
  }

  function getCardName(card) {
    return card.querySelector("h3")?.textContent.trim() || "";
  }

  function getPrice(card) {
    return Number((card.querySelector(".price")?.textContent.match(/[\d,]+/) || [0])[0].replace(/,/g, ""));
  }

  function getRating(card) {
    const text = card.querySelector(".rating")?.textContent || "";
    return Number(text.match(/([0-9]+(?:\.[0-9]+)?)/)?.[1] || 0);
  }

  function updateCount() {
    const visible = cards.filter((card) => card.style.display !== "none").length;
    if (resultsCount) resultsCount.textContent = `${visible} tour${visible === 1 ? "" : "s"} found`;
  }

  function applyFilters() {
    const search = searchInput?.value.trim().toLowerCase() || "";
    const checked = Array.from(filterForm?.querySelectorAll("input:checked") || []);
    const destinations = checked.filter((input) => input.closest(".filter-group")?.querySelector("h3")?.textContent === "Destination").map((input) => input.parentElement.textContent.trim());
    const types = checked.filter((input) => input.closest(".filter-group")?.querySelector("h3")?.textContent === "Tour Type").map((input) => input.parentElement.textContent.trim());
    const priceFilter = checked.find((input) => input.name === "price")?.parentElement.textContent.trim();
    const durationFilter = checked.find((input) => input.name === "duration")?.parentElement.textContent.trim();
    const ratingFilter = checked.find((input) => input.name === "rating")?.parentElement.textContent.trim();

    cards.forEach((card) => {
      const text = card.textContent.toLowerCase();
      const category = card.querySelector(".category-tag")?.textContent.trim() || "";
      const price = getPrice(card);
      const duration = card.querySelector(".duration")?.textContent || "";
      const rating = getRating(card);

      const matchesSearch = !search || text.includes(search);
      const matchesDestination = destinations.length === 0 || destinations.some((value) => text.includes(value.toLowerCase()));
      const matchesType = types.length === 0 || types.some((value) => category.toLowerCase() === value.toLowerCase());
      const matchesPrice = !priceFilter ||
        (priceFilter.includes("Under") && price < 10000) ||
        (priceFilter.includes("10,000") && price >= 10000 && price <= 20000) ||
        (priceFilter.includes("Above") && price > 20000);
      const matchesDuration = !durationFilter ||
        (durationFilter.includes("1–3") && /\b[123] Days\b/i.test(duration)) ||
        (durationFilter.includes("4–7") && /\b[4567] Days\b/i.test(duration)) ||
        (durationFilter.includes("8+") && !/\b[1-7] Days\b/i.test(duration));
      const matchesRating = !ratingFilter ||
        (ratingFilter.includes("4★") && rating >= 4) ||
        (ratingFilter.includes("3★") && rating >= 3);

      card.style.display = matchesSearch && matchesDestination && matchesType && matchesPrice && matchesDuration && matchesRating ? "" : "none";
    });
    updateCount();
  }

  searchForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    applyFilters();
  });

  searchInput?.addEventListener("input", applyFilters);
  filterForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    applyFilters();
  });
  filterForm?.addEventListener("reset", () => {
    setTimeout(() => {
      cards.forEach((card) => { card.style.display = ""; });
      updateCount();
    });
  });

  sortSelect?.addEventListener("change", () => {
    const sorted = [...cards];
    if (sortSelect.selectedIndex === 0) sorted.sort((a, b) => getPrice(a) - getPrice(b));
    if (sortSelect.selectedIndex === 1) sorted.sort((a, b) => getPrice(b) - getPrice(a));
    if (sortSelect.selectedIndex === 2) sorted.sort((a, b) => getRating(b) - getRating(a));
    sorted.forEach((card) => grid.appendChild(card));
  });

  cards.forEach((card) => {
    const checkbox = card.querySelector(".wishlist-btn input");
    if (!checkbox) return;
    const name = getCardName(card);
    const wishlist = getWishlist();
    checkbox.checked = wishlist.includes(name);

    const icon = checkbox.nextElementSibling?.querySelector("i");
    if (icon) icon.className = checkbox.checked ? "fa-solid fa-heart" : "fa-regular fa-heart";

    checkbox.addEventListener("change", () => {
      const names = getWishlist();
      const next = checkbox.checked ? [...new Set([...names, name])] : names.filter((item) => item !== name);
      saveWishlist(next);
      if (icon) icon.className = checkbox.checked ? "fa-solid fa-heart" : "fa-regular fa-heart";
    });
  });

  document.querySelectorAll(".pagination a").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      document.querySelector(".pagination a.active")?.classList.remove("active");
      link.classList.add("active");
    });
  });

  updateCount();
});
