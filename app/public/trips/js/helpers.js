const tripId = window.location.pathname.split("/").pop();

//Helper functions
function formatDateTime(value) {
  return value ? new Date(value).toLocaleString() : "";
}

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString() : "";
}

function formatMoney(value) {
  return "$" + Number(value || 0).toFixed(2);
}

function clearChildren(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

// Creates an element with text in it.
function createTextElement(tag, text) {
  let element = document.createElement(tag);
  element.textContent = text;
  return element;
}

// Creates a button that runs the onClick function.
function createButton(text, onClick) {
  let button = document.createElement("button");
  button.textContent = text;
  button.addEventListener("click", onClick);
  return button;
}
