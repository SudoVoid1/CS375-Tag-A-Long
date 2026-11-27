// Shared by every page that needs a login (the trips pages).
// Shows who is logged in, wires up the Log out button,
// and sends the user to the login page if they aren't logged in.

function goToLogin() {
  window.location.href = "/login";
}

function logout() {
  fetch("/api/logout", { method: "POST" })
    .then(() => goToLogin())
    .catch((error) => console.log(error));
}

function showCurrentUser() {
  fetch("/api/userInfo")
    .then((response) => {
      // 401 = no login cookie, or it expired
      if (response.status === 401) {
        goToLogin();
        throw new Error("Not logged in");
      }
      return response.json();
    })
    .then((user) => {
      document.getElementById("current-user").textContent = `Logged in as ${user.username}`;
    })
    .catch((error) => console.log(error));
}

document.getElementById("logout-button").addEventListener("click", logout);
showCurrentUser();
