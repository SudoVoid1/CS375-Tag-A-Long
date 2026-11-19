const tripMembersTable = document.getElementById("trip-members-table");
let isCreator = false;

function appendRemoveButton(member) {
  let cell = document.createElement("td");

  if (isCreator && !member.iscreator) {
    cell.appendChild(createButton("Remove", () => deleteMember(member)));
  }
  return cell;
}

/*
 Each row is populated with username, role, date joined, remove button (if user is creator).
*/
function createMemberRow(memberEntry) {
  let row = document.createElement("tr");
  let role = memberEntry.iscreator ? "Creator" : "Member";

  row.appendChild(createTextElement("td", memberEntry.username));
  row.appendChild(createTextElement("td", role));
  row.appendChild(createTextElement("td", formatDate(memberEntry.joinedon)));
  row.appendChild(appendRemoveButton(memberEntry));
  return row;
}

function loadMembers() {
  fetch(`/api/trips/${tripId}/members`)
    .then((response) => response.json())
    .then((members) => {
      clearChildren(tripMembersTable);
      members.forEach((member) => {
        tripMembersTable.appendChild(createMemberRow(member));
      });
    })
    .catch((error) => console.log(error));
}

function addMember() {
  const usernameField = document.getElementById("member-username");
  const message = document.getElementById("member-message");
  message.textContent = "";
  if (!usernameField.value) return;

  fetch(`/api/trips/${tripId}/members`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: usernameField.value }),
  })
    .then((response) => {
      if (response.ok) {
        // Set the input field back to blank and reload the member list.
        usernameField.value = "";
        loadMembers();
      } else {
        response.json().then((body) => (message.textContent = body.error));
      }
    })
    .catch((error) => console.log(error));
}

function deleteMember(member) {
  const message = document.getElementById("member-message");
  message.textContent = "";

  let question =
    `Remove ${member.username} from this trip? ` +
    "Their activities, notes and travel plan for this trip will be deleted too.";
  if (!confirm(question)) return;

  fetch(`/api/trips/${tripId}/members/${member.userid}`, { method: "DELETE" })
    .then((response) => {
      if (response.ok) {
        loadMembers();
        loadNotes();
      } else {
        response.json().then((body) => (message.textContent = body.error));
      }
    })
    .catch((error) => console.log(error));
}

document.getElementById("add-member-button").addEventListener("click", addMember);
