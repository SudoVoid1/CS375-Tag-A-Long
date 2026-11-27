/*
 * Reusable site navigation (Home, Travel, Trips)
 *
 * To use it on a page:
 *   1. Add the stylesheet
 *      <link rel="stylesheet" href="/css/navigation.css" />
 *   2. Add the nav in the header
 *      <nav id="site-nav"></nav>
 *   3. Add the script
 *      <script src="/js/navigation.js"></script>
 */

// Adds these urls in order.
const NAV_LINKS = [
  { text: "Home", url: "/" },
  { text: "Travel", url: "/travel" },
  { text: "Trips", url: "/trips/" },
];

function isCurrentPage(url) {
  let path = window.location.pathname;
  if (url === "/") {
    return path === "/";
  }
  return path.startsWith(url);
}

function createNavLink(text, url) {
  let link = document.createElement("a");
  link.textContent = text;
  link.href = url;
  if (isCurrentPage(url)) {
    link.className = "active";
  }
  return link;
}

function loadNavigation() {
  let nav = document.getElementById("site-nav");
  NAV_LINKS.forEach((navLink) => {
    nav.appendChild(createNavLink(navLink.text, navLink.url));
  });
}

loadNavigation();
