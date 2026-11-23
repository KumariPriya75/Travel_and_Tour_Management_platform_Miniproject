document.addEventListener("DOMContentLoaded", () => {
  const wishlist = document.querySelector(".wishlist-full");
  const checkbox = wishlist?.querySelector("input");
  const icon = wishlist?.querySelector("i");
  const name = document.querySelector(".tour-header h1")?.textContent.trim();
  const key = "travelGoWishlistPlaces";

  function getNames() {
    try {
      return JSON.parse(localStorage.getItem(key)) || [];
    } catch {
      return [];
    }
  }

  if (checkbox && name) {
    checkbox.checked = getNames().includes(name);
    if (icon) icon.className = checkbox.checked ? "fa-solid fa-heart" : "fa-regular fa-heart";

    checkbox.addEventListener("change", () => {
      const names = getNames();
      const next = checkbox.checked
        ? [...new Set([...names, name])]
        : names.filter((item) => item !== name);
      localStorage.setItem(key, JSON.stringify(next));
      if (icon) icon.className = checkbox.checked ? "fa-solid fa-heart" : "fa-regular fa-heart";
    });
  }

  document.querySelector(".btn-book-now")?.addEventListener("click", (event) => {
    event.preventDefault();
    alert("Booking details will open here. Your selected tour date has been recorded.");
  });
});
