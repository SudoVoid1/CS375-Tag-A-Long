const tripMembersTable = document.getElementById("trip-members-table");
let isCreator = false;

function createCell(text) {
  let cell = document.createElement("td");
  cell.textContent = text;
  return cell;
}

function appendRemoveButton(member) {
  let cell = document.createElement("td");

  if (isCreator && !member.iscreator) {
    let button = document.createElement("button");
    button.textContent = "Remove";
    button.addEventListener("click", () => removeMember(member));
    cell.appendChild(button);
  }
  return cell;
}

/*
 Each row is populated with username, role, date joined, remove button (if user is creator).
*/
function createMemberRow(memberEntry) {
  let row = document.createElement("tr");
  let role = memberEntry.iscreator ? "Creator" : "Member";

  row.appendChild(createCell(memberEntry.username));
  row.appendChild(createCell(role));
  row.appendChild(createCell(formatDate(memberEntry.joinedon)));
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
        // Can return unknown username, already a member, or some server error.
        response.json().then((body) => (message.textContent = body.error));
      }
    })
    .catch((error) => console.log(error));
}

document.getElementById("add-member-button").addEventListener("click", addMember);
