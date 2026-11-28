
var cardGrid = document.getElementById("destination-grid");
var searchInput = document.getElementById("destination-search");
var searchButton = document.getElementById("search-button");
var filterButtons = document.querySelectorAll(".filter-btn");
var clearButton = document.getElementById("clear-filters");
var resultCount = document.getElementById("result-count");

var selectedCategory = "All";
var lastSurpriseId = null;

function getWishlist() {
    var saved = localStorage.getItem("wishlist");

    if (saved === null) {
        return [];
    }

    try {
        var wishlist = JSON.parse(saved);
        return Array.isArray(wishlist) ? wishlist : [];
    } catch (error) {
        return [];
    }
}

function updateWishlistCount() {
    var heart = document.querySelector('.nav-icons a[href="wishlist.html"]');

    if (!heart) {
        return;
    }

    var count = getWishlist().length;
    heart.title = "Wishlist (" + count + " saved)";
}


function findDestination(id) {
    for (var i = 0; i < destinations.length; i++) {
        if (destinations[i].id === id) {
            return destinations[i];
        }
    }

    return null;
}

function makeCard(place) {
    var wishlist = getWishlist();
    var isSaved = wishlist.indexOf(place.id) !== -1;

    var html = '<div class="card destination-card">';
    html += '<div class="destination-image">';
    html += '<img src="' + place.image + '" alt="' + place.name + '">';
    html += '<button class="wishlist-btn ' + (isSaved ? "saved" : "") + '" data-id="' + place.id + '" title="Save to Wishlist">';
   html += isSaved
    ? '<i class="fa-solid fa-heart"></i>'
    : '<i class="fa-regular fa-heart"></i>';
    html += '</button>';
    html += '</div>';

    html += '<div class="card-body">';
    html += '<span class="tag">' + place.category + '</span>';
    html += '<h3>' + place.name + '</h3>';
    html += '<p>' + place.state + '</p>';
    html += '<p class="famous-text">' + place.famousFor + '</p>';

    html += '<button class="btn btn-outline btn-small btn-full details-btn" data-id="' + place.id + '">View Details</button>';
    html += '<a href="tours.html?destination=' + encodeURIComponent(place.name.split(",")[0]) + '" class="btn btn-primary btn-small btn-full">Explore Tours</a>';

    html += '</div></div>';

    return html;
}

function showCards(list) {
    var found = list || findDestinations(selectedCategory, searchInput.value);
    var html = "";

    for (var i = 0; i < found.length; i++) {
        html += makeCard(found[i]);
    }

    if (found.length === 0) {
        html = '<p class="empty-message">No destinations found. Try another search or category.</p>';
    }

    cardGrid.innerHTML = html;
    resultCount.innerText = "Showing " + found.length + " of " + destinations.length + " destinations";
}

function findDestinations(category, searchText) {
    var text = searchText.trim().toLowerCase();
    var found = [];

    for (var i = 0; i < destinations.length; i++) {
        var place = destinations[i];

        if (category !== "All" && place.category !== category) {
            continue;
        }

        var allWords = (place.name + " " + place.state + " " + place.category + " " + place.famousFor).toLowerCase();

        if (allWords.indexOf(text) === -1) {
            continue;
        }

        found.push(place);
    }

    return found;
}

function setActiveButton(category) {
    for (var i = 0; i < filterButtons.length; i++) {
        filterButtons[i].classList.toggle("active", filterButtons[i].getAttribute("data-category") === category);
    }
}

function setUpFilters() {
    for (var i = 0; i < filterButtons.length; i++) {
        filterButtons[i].onclick = function () {
            selectedCategory = this.getAttribute("data-category");
            setActiveButton(selectedCategory);
            showCards();
        };
    }

    searchInput.oninput = function () {
        showCards();
    };

    searchButton.onclick = function () {
        showCards();
    };

    clearButton.onclick = function () {
        selectedCategory = "All";
        searchInput.value = "";
        setActiveButton("All");
        showCards();
    };
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
    showCards();
}

function setUpCardButtons() {
    cardGrid.onclick = function (event) {
        var target = event.target;

        var wishlistButton = target.closest(".wishlist-btn");
        var detailsButton = target.closest(".details-btn");

        if (wishlistButton) {
            toggleWishlist(Number(wishlistButton.getAttribute("data-id")));
        }

        if (detailsButton) {
            openDestinationModal(Number(detailsButton.getAttribute("data-id")));
        }
    };
}

function openDestinationModal(id) {
    var place = findDestination(id);

    if (!place) {
        return;
    }

    document.getElementById("modal-image").src = place.image;
    document.getElementById("modal-image").alt = place.name;
    document.getElementById("modal-category").innerText = place.category;
    document.getElementById("modal-title").innerText = place.name;
    document.getElementById("modal-description").innerText = place.description;
    document.getElementById("modal-famous").innerText = place.famousFor;
    document.getElementById("modal-best-time").innerText = place.bestTime;

    var highlights = document.getElementById("modal-highlights");
    highlights.innerHTML = "";

    for (var i = 0; i < place.highlights.length; i++) {
        var li = document.createElement("li");
        li.innerText = place.highlights[i];
        highlights.appendChild(li);
    }

    document.getElementById("modal-tours-link").href =
        "tours.html?destination=" + encodeURIComponent(place.name.split(",")[0]);

    document.getElementById("destination-modal").hidden = false;
    document.body.classList.add("modal-open");
}

function closeDestinationModal() {
    document.getElementById("destination-modal").hidden = true;
    document.body.classList.remove("modal-open");
}

document.getElementById("modal-close").onclick = closeDestinationModal;
document.getElementById("modal-overlay").onclick = closeDestinationModal;

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        closeDestinationModal();
    }
});

function showMoodResults(mood) {
    var found = [];

    for (var i = 0; i < destinations.length; i++) {
        if (destinations[i].moods.indexOf(mood) !== -1) {
            found.push(destinations[i]);
        }
    }

    var result = document.getElementById("mood-result");

    result.hidden = false;
    result.innerHTML = "";

    var heading = document.createElement("h3");
    heading.innerText = "Destinations matching: " + mood;
    result.appendChild(heading);

    var list = document.createElement("div");
    list.className = "mood-result-grid";

    for (var j = 0; j < found.length; j++) {
        var button = document.createElement("button");
        button.className = "mood-result-card";
        button.innerHTML = '<img src="' + found[j].image + '" alt="' + found[j].name + '"><strong>' + found[j].name + '</strong>';
        button.setAttribute("data-id", found[j].id);
        list.appendChild(button);
    }

    result.appendChild(list);

    list.onclick = function (event) {
        var clicked = event.target.closest("[data-id]");

        if (clicked) {
            openDestinationModal(Number(clicked.getAttribute("data-id")));
        }
    };
}

function setUpMoodButtons() {
    var buttons = document.querySelectorAll(".mood-card");

    for (var i = 0; i < buttons.length; i++) {
        buttons[i].onclick = function () {
            for (var j = 0; j < buttons.length; j++) {
                buttons[j].classList.remove("selected");
            }

            this.classList.add("selected");
            showMoodResults(this.getAttribute("data-mood"));
        };
    }
}

var quizQuestions = [
    {
        question: "What kind of experience are you looking for?",
        answers: [
            { text: "Adventure and excitement", mood: "Adventure Seeker" },
            { text: "Peace and relaxation", mood: "Peace Seeker" },
            { text: "Nature and greenery", mood: "Nature Lover" },
            { text: "History and culture", mood: "Culture Explorer" }
        ]
    },
    {
        question: "Which place would you love to wake up in?",
        answers: [
            { text: "Near a beautiful beach", mood: "Beach Lover" },
            { text: "Surrounded by mountains", mood: "Adventure Seeker" },
            { text: "In a peaceful green valley", mood: "Nature Lover" },
            { text: "In a historic royal city", mood: "Culture Explorer" }
        ]
    },
    {
        question: "What is your ideal holiday?",
        answers: [
            { text: "An exciting outdoor trip", mood: "Adventure Seeker" },
            { text: "A calm and refreshing escape", mood: "Need a Break" },
            { text: "Exploring local traditions", mood: "Culture Explorer" },
            { text: "Enjoying beautiful natural views", mood: "Nature Lover" }
        ]
    }
];

var currentQuestion = 0;
var quizAnswers = [];

function showQuestion() {
    var question = quizQuestions[currentQuestion];

    document.getElementById("question-number").innerText = "Question " + (currentQuestion + 1) + " of 3";
    document.getElementById("question-text").innerText = question.question;
    document.getElementById("progress-bar").style.width = ((currentQuestion + 1) / 3 * 100) + "%";

    var options = document.getElementById("answer-options");
    options.innerHTML = "";

    for (var i = 0; i < question.answers.length; i++) {
        var button = document.createElement("button");
        button.className = "answer-option";
        button.innerText = question.answers[i].text;
        button.setAttribute("data-mood", question.answers[i].mood);

        button.onclick = function () {
            var allOptions = options.querySelectorAll(".answer-option");

            for (var j = 0; j < allOptions.length; j++) {
                allOptions[j].classList.remove("selected");
            }

            this.classList.add("selected");
            document.getElementById("next-question").disabled = false;
        };

        options.appendChild(button);
    }

    document.getElementById("next-question").innerText =
        currentQuestion === 2 ? "See My Destination" : "Next";

    document.getElementById("next-question").disabled = true;
}

function startQuiz() {
    currentQuestion = 0;
    quizAnswers = [];

    document.getElementById("quiz-result").hidden = true;
    document.getElementById("quiz-content").hidden = false;
    document.getElementById("start-quiz").hidden = true;

    showQuestion();
}

function nextQuestion() {
    var selected = document.querySelector(".answer-option.selected");

    if (!selected) {
        return;
    }

    quizAnswers.push(selected.getAttribute("data-mood"));

    if (currentQuestion < 2) {
        currentQuestion++;
        showQuestion();
    } else {
        showQuizResult();
    }
}

function showQuizResult() {
    var moodCount = {};

    for (var i = 0; i < quizAnswers.length; i++) {
        var mood = quizAnswers[i];
        moodCount[mood] = (moodCount[mood] || 0) + 1;
    }

    var bestMood = quizAnswers[0];

    for (var key in moodCount) {
        if (moodCount[key] > moodCount[bestMood]) {
            bestMood = key;
        }
    }

    var matches = [];

    for (var j = 0; j < destinations.length; j++) {
        if (destinations[j].moods.indexOf(bestMood) !== -1) {
            matches.push(destinations[j]);
        }
    }

    var chosen = matches[Math.floor(Math.random() * matches.length)];
    var result = document.getElementById("quiz-result");

    document.getElementById("quiz-content").hidden = true;
    result.hidden = false;

    result.innerHTML =
        '<span>Your Travel Personality</span>' +
        '<h3>' + bestMood + '</h3>' +
        '<p>We think you will love this destination!</p>' +
        '<img src="' + chosen.image + '" alt="' + chosen.name + '">' +
        '<h3>' + chosen.name + '</h3>' +
        '<p>' + chosen.description + '</p>' +
        '<button class="btn btn-primary" id="quiz-details">View Destination</button>' +
        '<button class="btn btn-outline" id="retry-quiz">Try Again</button>';

    document.getElementById("quiz-details").onclick = function () {
        openDestinationModal(chosen.id);
    };

    document.getElementById("retry-quiz").onclick = startQuiz;
}

function setUpQuiz() {
    document.getElementById("start-quiz").onclick = startQuiz;
    document.getElementById("next-question").onclick = nextQuestion;
}

function surpriseMe() {
    var available = destinations.filter(function (place) {
        return place.id !== lastSurpriseId;
    });

    if (available.length === 0) {
        available = destinations;
    }

    var chosen = available[Math.floor(Math.random() * available.length)];
    lastSurpriseId = chosen.id;

    var result = document.getElementById("surprise-result");
    result.hidden = false;

    result.innerHTML =
        '<div class="surprise-card">' +
        '<img src="' + chosen.image + '" alt="' + chosen.name + '">' +
        '<div><span>Your surprise destination</span>' +
        '<h3>' + chosen.name + '</h3>' +
        '<p>' + chosen.description + '</p>' +
        '<button class="btn btn-primary" id="surprise-details">Discover This Place</button></div>' +
        '</div>';

    document.getElementById("surprise-details").onclick = function () {
        openDestinationModal(chosen.id);
    };
}

document.getElementById("surprise-button").onclick = surpriseMe;

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
setUpFilters();
setUpCardButtons();
setUpMoodButtons();
setUpQuiz();
showCards();
updateWishlistCount();
