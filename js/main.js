function getWishlist() {
  var saved = localStorage.getItem("wishlist");
  if (saved === null) {
    return [];
  }
  return JSON.parse(saved);
}

function updateWishlistCount() {
  var heart = document.querySelector('.nav-icons a[href="wishlist.html"]');
  var count = getWishlist().length;

  if (count > 0) {
    heart.innerHTML = "&#9829;";
  } else {
    heart.innerHTML = "&#9825;";
  }
  heart.title = "Wishlist (" + count + " saved)";
}

function closeMenuOnClick() {
  var menuToggle = document.getElementById("menu-toggle");
  var menuLinks = document.querySelectorAll(".nav-links a");

  for (var i = 0; i < menuLinks.length; i++) {
    menuLinks[i].onclick = function () {
      menuToggle.checked = false;
    };
  }
}

updateWishlistCount();
closeMenuOnClick();
