var cardGrid = document.querySelector(".section .grid-4");
var searchInput = document.querySelector(".search-bar input");
var searchButton = document.querySelector(".search-bar button");
var filterButtons = document.querySelectorAll(".filter-btn");
var selectedCategory = "All";

function findDestinations(category, searchText) {
  var text = searchText.trim().toLowerCase();
  var showOnlyFeatured = (text === "" && category === "All");
  var found = [];

  for (var i = 0; i < destinations.length; i++) {
    var place = destinations[i];

    if (showOnlyFeatured && place.featured === false) {
      continue;
    }
    if (category !== "All" && place.category !== category) {
      continue;
    }

    var allWords = (place.name + " " + place.state + " " + place.category).toLowerCase();
    if (allWords.indexOf(text) === -1) {
      continue;
    }

    found.push(place);
  }

  return found;
}

function makeCard(place, isSaved) {
  var saveClass = "btn btn-outline btn-small btn-full save-btn";
  var saveText = "&#9825; Save to Wishlist";

  if (isSaved) {
    saveClass = "btn btn-primary btn-small btn-full save-btn";
    saveText = "&#9829; Saved";
  }

  var html = "";
  html += '<div class="card">';
  html += '<img src="' + place.image + '" alt="' + place.name + '">';
  html += '<div class="card-body">';
  html += '<span class="tag">' + place.category + "</span>";
  html += "<h3>" + place.name + "</h3>";
  html += "<p>" + place.state + "</p>";
  html += "<p>Rating: " + place.rating + " / 5</p>";
  html += '<a href="tours.html" class="btn btn-primary btn-small btn-full">Explore Tours</a>';
  html += '<button class="' + saveClass + '" data-id="' + place.id + '" style="margin-top:8px;">' + saveText + "</button>";
  html += "</div>";
  html += "</div>";
  return html;
}

function showCards() {
  var found = findDestinations(selectedCategory, searchInput.value);
  var wishlist = getWishlist();
  var html = "";

  if (found.length === 0) {
    html = '<p style="grid-column: 1 / -1; text-align: center; padding: 40px 0;">No destinations found. Try another name or category.</p>';
  }

  for (var i = 0; i < found.length; i++) {
    var isSaved = wishlist.indexOf(found[i].id) !== -1;
    html += makeCard(found[i], isSaved);
  }

  cardGrid.innerHTML = html;
}

function setActiveButton(categoryName) {
  for (var i = 0; i < filterButtons.length; i++) {
    if (filterButtons[i].innerText === categoryName) {
      filterButtons[i].classList.add("active");
    } else {
      filterButtons[i].classList.remove("active");
    }
  }
}

function toggleWishlist(id) {
  var wishlist = getWishlist();
  var position = wishlist.indexOf(id);

  if (position === -1) {
    wishlist.push(id);
  } else {
    wishlist.splice(position, 1);
  }

  localStorage.setItem("wishlist", JSON.stringify(wishlist));
  updateWishlistCount();
}

function setUpFilterButtons() {
  for (var i = 0; i < filterButtons.length; i++) {
    filterButtons[i].onclick = function () {
      selectedCategory = this.innerText;
      setActiveButton(selectedCategory);
      showCards();
    };
  }
}

function setUpSearch() {
  searchButton.onclick = showCards;
  searchInput.onkeyup = showCards;
}

function setUpSaveButtons() {
  cardGrid.onclick = function (event) {
    var clicked = event.target;

    if (clicked.className.indexOf("save-btn") === -1) {
      return;
    }

    toggleWishlist(Number(clicked.getAttribute("data-id")));
    showCards();
  };
}

function readAddressBar() {
  var params = new URLSearchParams(window.location.search);
  var searchFromLink = params.get("search");
  var categoryFromLink = params.get("category");

  if (searchFromLink !== null) {
    searchInput.value = searchFromLink;
  }
  if (categoryFromLink !== null) {
    selectedCategory = categoryFromLink;
    setActiveButton(selectedCategory);
  }
}

readAddressBar();
setUpFilterButtons();
setUpSearch();
setUpSaveButtons();
showCards();
