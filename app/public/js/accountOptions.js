/*
 * Reusable menu to show the logged in account across pages.
 *
 * To use it on a page:
 *   1. Add a link to the stylesheet in the <head>
 *      <link rel="stylesheet" href="/css/accountOptions.css" />
 *   2. Add the div where you want the menu
 *      <div id="account-options"></div>  where the button should go
 *   3. Add the script
 *      <script src="/js/accountOptions.js"></script>
 *
 * Add data-login-optional for non-restrictive pages with a login link
 *     <div id="account-options" data-login-optional>
 *        <a href="/login" class="btn">Login</a>
 */

function goToLogin() {
  window.location.href = "/login";
}

function logout() {
  fetch("/api/logout", { method: "POST" })
    .then(() => goToLogin())
    .catch((error) => console.log(error));
}

function createMenuLink(text, url) {
  let link = document.createElement("a");
  link.textContent = text;
  link.href = url;
  return link;
}

function createAccountMenu(username) {
  let menu = document.createElement("details");
  menu.className = "account-menu";

  // Shows the indicator arrow
  let button = document.createElement("summary");
  button.textContent = username;

  // Selectable options
  let dropdown = document.createElement("div");
  dropdown.className = "account-dropdown";

  let logoutButton = document.createElement("button");
  logoutButton.className = "logout";
  logoutButton.textContent = "Log out";
  logoutButton.addEventListener("click", logout);

  dropdown.appendChild(createMenuLink("Profile", "/profile"));
  dropdown.appendChild(createMenuLink("Settings", "/settings"));
  dropdown.appendChild(logoutButton);

  menu.appendChild(button);
  menu.appendChild(dropdown);

  // clicking out of the menu closes it
  document.addEventListener("click", (event) => {
    if (!menu.contains(event.target)) {
      menu.open = false;
    }
  });

  return menu;
}

function loadAccountOptions() {
  let container = document.getElementById("account-options");
  // Pages anyone can visit (like the home page) add data-login-optional to the div.
  // There, a logged-out visitor just keeps whatever is inside the div (e.g. a Login link)
  // instead of being sent to /login.
  let loginOptional = container.hasAttribute("data-login-optional");

  fetch("/api/userInfo")
    .then((response) => {
      // 401 = no login cookie, or it expired
      if (response.status === 401) {
        if (!loginOptional) {
          goToLogin();
        }
        throw new Error("Not logged in");
      }
      return response.json();
    })
    .then((user) => {
      // Logged in: replace anything already in the div (like the Login link) with the menu
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
      container.appendChild(createAccountMenu(user.username));
    })
    .catch((error) => console.log(error));
}

loadAccountOptions();
