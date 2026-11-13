let sectionNames = ["travel", "budget", "itinerary", "notes", "members"];

function selectSectionToDisplay(selected) {
  sectionNames.forEach((sectionName) => {
    let section = document.getElementById(sectionName);
    let tab = document.getElementById(sectionName + "-tab");

    if (sectionName === selected) {
      section.hidden = false;
      tab.classList.add("active");
    } else {
      section.hidden = true;
      tab.classList.remove("active");
    }
  });
}

/*
 * 1. Gets the trip information to display at the top of each section
 * 2. Figures out if your the owner
 * 3. Pre-fetches all the data
 */
function loadTrip() {
  let name = document.getElementById("name");
  let subtitle = document.getElementById("subtitle");
  let tabs = document.getElementById("tabs");
  let main = document.querySelector("main");
  let travelRoute = document.getElementById("travel-route");
  let addMemberCard = document.getElementById("add-member-card");

  fetch(`/api/trips/${tripId}`)
    .then((response) => {
      if (!response.ok) {
        name.textContent = "Cannot Display Trip Information";
        subtitle.textContent = "Please contact the owner if you belive this is a mistake";
        tabs.hidden = true;
        main.hidden = true;

        throw new Error(`Can't load trip ${tripId} (status ${response.status})`);
      }
      return response.json();
    })
    .then((trip) => {
      document.title = trip.tripname;
      name.textContent = trip.tripname;
      let startDate = formatDate(trip.startdatetime);
      let endDate = formatDate(trip.enddatetime);

      // Include the date if provided
      if (startDate) {
        subtitle.textContent = `${trip.startlocation} - ${trip.endlocation} ${startDate} - ${endDate}`;
        travelRoute.textContent = `From ${trip.startlocation} to ${trip.endlocation}, leaving ${startDate}`;
      } else {
        subtitle.textContent = `${trip.startlocation} - ${trip.endlocation}`;
        travelRoute.textContent = `From ${trip.startlocation} to ${trip.endlocation}`;
      }

      // Allow the owner to add/remove member down the line.
      isCreator = trip.iscreator;
      addMemberCard.hidden = !isCreator;
    })
    .then(() => {
      // Pre-fetch all the other data now that we confirmed the user is a owner/member of the trip.
      //loadxyz()
      //...
      loadNotes();
    })
    .catch((error) => console.log(error));
}

// Clicking a tab unhides that section.
sectionNames.forEach((sectionName) => {
  document.getElementById(sectionName + "-tab").addEventListener("click", () => {
    selectSectionToDisplay(sectionName);
  });
});

// Default to the travel page
selectSectionToDisplay("travel");
loadTrip();
