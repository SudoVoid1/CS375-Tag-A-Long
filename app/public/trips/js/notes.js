const notesList = document.getElementById("notes-list");

function loadNotes() {
  fetch(`/api/trips/${tripId}/notes`)
    .then((response) => response.json())
    .then((notes) => {
      clearChildren(notesList);

      notes.forEach((note) => {
        const card = document.createElement("div");
        const text = document.createElement("p");
        const metaData = document.createElement("p");

        card.className = "note";
        text.textContent = note.notetext;
        metaData.textContent = `${note.username}: ${formatDateTime(note.createdat)}`;

        card.append(text, metaData);
        notesList.appendChild(card);
      });
    })
    .catch((error) => console.log(error));
}

function addNote() {
  let noteText = document.getElementById("note-text");
  if (!noteText.value) return;

  fetch(`/api/trips/${tripId}/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ noteText: noteText.value }),
  })
    .then((response) => {
      if (response.ok) {
        // Reset the "Add note box" and re-fetch the notes.
        noteText.value = "";
        loadNotes();
      } else {
        console.log("Failed to add note:", response.status);
      }
    })
    .catch((error) => console.log(error));
}

document.getElementById("add-note-button").addEventListener("click", addNote);
