const notesList = document.getElementById("notes-list");

function appendDeleteButton(card, note) {
  if (note.ismynote) {
    card.appendChild(createButton("Delete", () => deleteNote(note)));
  }
}

/*
 Each note card shows the note text, who wrote it and when, and a Delete button.
*/
function createNoteCard(noteEntry) {
  let card = document.createElement("div");
  card.className = "note";

  card.appendChild(createTextElement("p", noteEntry.notetext));
  card.appendChild(
    createTextElement("p", `${noteEntry.username}: ${formatDateTime(noteEntry.createdat)}`),
  );
  appendDeleteButton(card, noteEntry);
  return card;
}

function loadNotes() {
  fetch(`/api/trips/${tripId}/notes`)
    .then((response) => response.json())
    .then((notes) => {
      clearChildren(notesList);
      notes.forEach((note) => {
        notesList.appendChild(createNoteCard(note));
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

function deleteNote(note) {
  if (!confirm("Delete this note?")) return;

  fetch(`/api/trips/${tripId}/notes/${note.noteid}`, { method: "DELETE" })
    .then((response) => {
      if (response.ok) {
        loadNotes();
      } else {
        response.json().then((body) => console.log("Failed to delete note:", body.error));
      }
    })
    .catch((error) => console.log(error));
}

document.getElementById("add-note-button").addEventListener("click", addNote);
