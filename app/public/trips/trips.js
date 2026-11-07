const tripId = window.location.pathname.split("/").pop();
const tripTable = document.getElementById("trip-table");

function setTable(trip) {
  let row = document.createElement("tr");

  ["tripname", "startlocation", "endlocation", "startdatetime", "enddatetime"].forEach((field) => {
    let cell = document.createElement("td");
    cell.textContent = trip[field];
    row.appendChild(cell);
  });

  tripTable.appendChild(row);
}

fetch(`/api/trips/${tripId}`)
  .then((response) => response.json())
  .then((trip) => {
    document.getElementById("name").textContent = `Trip: ${trip.tripname}`;
    setTable(trip);
  })
  .catch((error) => console.log(error));
