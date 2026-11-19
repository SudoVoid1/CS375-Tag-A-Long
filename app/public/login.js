const form = document.getElementById('login-form');
const errorBox = document.getElementById('login-error');

form.addEventListener('submit', (event) => {
  event.preventDefault();
  errorBox.textContent = '';

  const username = form.username.value.trim();
  const password = form.password.value;

  if (!username || !password) {
    errorBox.textContent = 'Please enter both a username and a password.';
    return;
  }

  // TODO: once the Node back-end exists, send the credentials to it, e.g.
  // fetch('/api/login', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ username, password })
  // });
  console.log('Login submitted for:', username);
});