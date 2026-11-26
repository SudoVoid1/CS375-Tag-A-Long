const form = document.getElementById("login-form");
const errorBox = document.getElementById("login-error");

form.addEventListener("submit", (event) => {
  //preventDefault - dont allow the user to do/change anything while loging in.
  event.preventDefault();
  errorBox.textContent = "";

  const username = form.username.value.trim();
  const password = form.password.value;

  // Easy client side check (that the server will also do)
  if (!username || !password) {
    errorBox.textContent = "Please enter both a username and a password.";
    return;
  }

  fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  })
    .then((response) => {
      if (response.ok) {
        // Redirect to the trips page
        window.location.href = "/trips/";
      } else {
        response
          .json()
          .then((body) => (errorBox.textContent = body.error))
          .catch(() => (errorBox.textContent = "Something went wrong, please try again."));
      }
    })
    .catch((error) => console.log(error));
});
