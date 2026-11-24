var searchForm = document.querySelector(".search-box form");
var destinationSelect = document.getElementById("destination");
var dateInput = document.getElementById("travel-date");
var travellersInput = document.getElementById("travellers");

function fillDestinationList() {
  var options = '<option value="">Where do you want to go?</option>';

  for (var i = 0; i < destinations.length; i++) {
    options += '<option value="' + destinations[i].name + '">' + destinations[i].name + "</option>";
  }

  destinationSelect.innerHTML = options;
}

function getTodayDate() {
  var now = new Date();
  var year = now.getFullYear();
  var month = now.getMonth() + 1;
  var day = now.getDate();

  if (month < 10) {
    month = "0" + month;
  }
  if (day < 10) {
    day = "0" + day;
  }

  return year + "-" + month + "-" + day;
}

function checkSearchForm(destination, date, travellers) {
  if (destination === "") {
    return "Please choose a destination.";
  }
  if (date === "") {
    return "Please choose your travel date.";
  }
  if (date < getTodayDate()) {
    return "Travel date cannot be in the past.";
  }
  if (travellers === "" || Number(travellers) < 1) {
    return "Travellers must be at least 1.";
  }
  if (Number(travellers) > 20) {
    return "Maximum 20 travellers allowed.";
  }
  return "";
}

function goToDestinations(searchText) {
  window.location.href = "destinations.html?search=" + encodeURIComponent(searchText);
}

function setUpSearchForm() {
  dateInput.min = getTodayDate();

  searchForm.onsubmit = function (event) {
    event.preventDefault();

    var message = checkSearchForm(destinationSelect.value, dateInput.value, travellersInput.value);
    if (message !== "") {
      alert(message);
      return;
    }

    var cityName = destinationSelect.value.split(",")[0];
    goToDestinations(cityName);
  };
}

function setUpPopularCards() {
  var popularCards = document.querySelectorAll("a.card");

  for (var i = 0; i < popularCards.length; i++) {
    popularCards[i].onclick = function (event) {
      event.preventDefault();
      var cityName = this.querySelector("h3").innerText.split(",")[0];
      goToDestinations(cityName);
    };
  }
}

function setUpCategoryCards() {
  var categoryCards = document.querySelectorAll(".category-card");

  for (var i = 0; i < categoryCards.length; i++) {
    categoryCards[i].onclick = function (event) {
      event.preventDefault();
      var categoryName = this.querySelector("span").innerText;
      window.location.href = "destinations.html?category=" + encodeURIComponent(categoryName);
    };
  }
}

fillDestinationList();
setUpSearchForm();
setUpPopularCards();
setUpCategoryCards();
