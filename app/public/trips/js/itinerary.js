const activitiesTable = document.getElementById("activities-table");

function loadActivities() {
  fetch(`/api/trips/${tripId}/activities`)
    .then((response) => response.json())
    .then((activities) => {
      activitiesTable.replaceChildren();
      document.getElementById("no-activities").hidden = activities.length > 0;

      activities.forEach((activity) => {
        let row = document.createElement("tr");

        [
          "activitydate",
          "starttime",
          "activityname",
          "category",
          "locationname",
          "durationminutes",
          "cost",
        ].forEach((field) => {
          let cell = document.createElement("td");
          if (field === "activitydate") {
            cell.textContent = formatDate(activity[field]);
          } else if (field === "starttime") {
            cell.textContent = activity[field] ? activity[field].slice(0, 5) : "";
          } else if (field === "durationminutes") {
            cell.textContent = activity[field] + " min";
          } else if (field === "cost") {
            cell.textContent = formatMoney(activity[field]);
          } else {
            cell.textContent = activity[field] || "";
          }
          row.appendChild(cell);
        });

        activitiesTable.appendChild(row);
      });
    })
    .catch((error) => console.log(error));
}

// Fill the Location dropdown, with "None" first
function loadActivityLocations() {
  fetch("/api/locations")
    .then((response) => response.json())
    .then((locations) => {
      const select = document.getElementById("activity-location");
      [{ locationid: "", locationname: "None" }, ...locations].forEach((location) => {
        const option = document.createElement("option");
        option.value = location.locationid;
        option.textContent = location.locationname;
        select.appendChild(option);
      });
    })
    .catch((error) => console.log(error));
}

function addActivity() {
  const nameField = document.getElementById("activity-name");
  const message = document.getElementById("activity-message");
  if (!nameField.value) {
    message.textContent = "Please enter an activity name.";
    return;
  }
  message.textContent = "";

  const activity = {
    activityName: nameField.value,
    category: document.getElementById("activity-category").value || null,
    locationId: document.getElementById("activity-location").value || null,
    activityDate: document.getElementById("activity-date").value || null,
    startTime: document.getElementById("activity-time").value || null,
    durationMinutes: document.getElementById("activity-duration").value || 30,
    cost: document.getElementById("activity-cost").value || 0,
  };

  fetch(`/api/trips/${tripId}/activities`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(activity),
  })
    .then((response) => {
      if (response.ok) {
        nameField.value = "";
        document.getElementById("activity-category").value = "";
        loadActivities();
        loadBudget(); // costs changed
      } else {
        message.textContent = "Failed to add activity.";
      }
    })
    .catch((error) => console.log(error));
}

document.getElementById("add-activity-button").addEventListener("click", addActivity);
