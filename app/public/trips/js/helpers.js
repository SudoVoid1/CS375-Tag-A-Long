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
