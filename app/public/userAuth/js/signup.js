const form = document.getElementById("signup-form");
const errorBox = document.getElementById("signup-error");

form.addEventListener("submit", (event) => {
  event.preventDefault();
  errorBox.textContent = "";

  const username = form.username.value.trim();
  const email = form.email.value.trim();
  const password = form.password.value;
  const confirmPassword = form.confirmPassword.value;

  // Easy client side checks (that the server will also do)
  if (!username || !email || !password) {
    errorBox.textContent = "Please fill in every field.";
    return;
  }
  if (password !== confirmPassword) {
    errorBox.textContent = "The passwords don't match.";
    return;
  }

  fetch("/api/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
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
