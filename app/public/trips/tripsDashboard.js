const tripsTable = document.getElementById("trips-table");

function formatDate(value) {
  return value ? new Date(value).toLocaleString() : "";
}

function addTrip() {
  // Get all the entered values when the user clicks submit.
  const trip = {
    tripName: document.getElementById("name").value,
    startLocationId: document.getElementById("start-location").value,
    endLocationId: document.getElementById("end-location").value,
    startDateTime: document.getElementById("start-date").value || null,
    endDateTime: document.getElementById("end-date").value || null,
  };

  // Restricts the name field to be required
  // TODO any others? + validation on server for this.
  if (!trip.tripName) {
    document.getElementById("message").textContent = "Please enter a trip name.";
    return;
  }

  fetch("/api/trips", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(trip),
  })
    .then((response) => {
      if (response.ok) {
        // Reload the page to show the new trip in the table.
        location.reload();
      } else {
        document.getElementById("message").textContent = "Failed to add trip.";
      }
    })
    .catch((error) => console.log(error));
}

function getTrips() {
  fetch("/api/trips")
    .then((response) => response.json())
    .then((trips) => {
      trips.forEach((trip) => {
        let row = document.createElement("tr");

        ["tripname", "startlocation", "endlocation", "startdatetime", "enddatetime"].forEach(
          (field) => {
            let cell = document.createElement("td");
            if (field === "tripname") {
              let link = document.createElement("a");
              link.href = `/trips/${trip.tripid}`;
              link.textContent = trip.tripname;
              cell.appendChild(link);
            } else if (field === "startdatetime" || field === "enddatetime") {
              cell.textContent = formatDate(trip[field]);
            } else {
              cell.textContent = trip[field];
            }
            row.appendChild(cell);
          },
        );

        tripsTable.appendChild(row);
      });
    })
    .catch((error) => console.log(error));
}

// Get all the location option
function getLocationOptions() {
  fetch("/api/locations")
    .then((response) => response.json())
    .then((locations) => {
      ["start-location", "end-location"].forEach((id) => {
        const select = document.getElementById(id);
        locations.forEach((location) => {
          const option = document.createElement("option");
          option.value = location.locationid;
          option.textContent = location.locationname;
          select.appendChild(option);
        });
      });
    })
    .catch((error) => console.log(error));
}

document.getElementById("submit-button").addEventListener("click", addTrip);

// Get all the users trips and location options on page load.
getLocationOptions();
getTrips();
