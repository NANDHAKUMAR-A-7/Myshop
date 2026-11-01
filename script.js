// MOBILE NAVIGATION

const menuBtn = document.getElementById("menuBtn");
const navbar = document.getElementById("navbar");

menuBtn.addEventListener("click", () => {

```
navbar.classList.toggle("active");
```

});

// CLOSE MOBILE MENU AFTER CLICK

document.querySelectorAll("#navbar a").forEach(link => {

```
link.addEventListener("click", () => {
    navbar.classList.remove("active");
});
```

});

// SEARCH

const searchBtn = document.getElementById("searchBtn");
const searchBox = document.getElementById("searchBox");
const closeSearch = document.getElementById("closeSearch");
const searchInput = document.getElementById("searchInput");

searchBtn.addEventListener("click", () => {

```
searchBox.classList.toggle("active");

if (searchBox.classList.contains("active")) {
    searchInput.focus();
}
```

});

closeSearch.addEventListener("click", () => {

```
searchBox.classList.remove("active");

searchInput.value = "";

document.querySelectorAll(".product-card").forEach(card => {
    card.style.display = "";
});
```

});

// PRODUCT SEARCH

searchInput.addEventListener("input", () => {

```
const value = searchInput.value.toLowerCase();

document.querySelectorAll(".product-card").forEach(card => {

    const productName = card.dataset.name.toLowerCase();

    card.style.display =
        productName.includes(value) ? "" : "none";

});
```

});

// WISHLIST

document.querySelectorAll(".wishlist").forEach(button => {

```
button.addEventListener("click", () => {

    button.classList.toggle("active");

    const icon = button.querySelector("i");

    if (button.classList.contains("active")) {

        icon.classList.remove("fa-regular");
        icon.classList.add("fa-solid");

    } else {

        icon.classList.remove("fa-solid");
        icon.classList.add("fa-regular");

    }

});
```

});

// SHOPPING BAG DEMO

let cartCount = 0;

const cartDisplay = document.getElementById("cartCount");

document.querySelectorAll(".add-cart").forEach(button => {

```
button.addEventListener("click", () => {

    cartCount++;

    cartDisplay.textContent = cartCount;

    button.textContent = "ADDED ✓";

    setTimeout(() => {

        button.textContent = "ADD TO BAG";

    }, 1200);

});
```

});
