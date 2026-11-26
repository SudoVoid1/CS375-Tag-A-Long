require("dotenv").config();
const pg = require("pg");
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

//Postgres Utilities
const env = require("../env.json");
const Pool = pg.Pool;
const pool = new Pool(env);
pool.connect().then(function () {
  console.log(`Connected to database ${env.database}`);
});

//Login/Hasing Utilities
const argon2 = require("argon2");
const cookieParser = require("cookie-parser");
const crypto = require("crypto");

app.use(express.json());
app.use(cookieParser());
app.use(express.static("public"));
app.use(express.static("trips"));
app.use("/css", express.static("../node_modules/water.css/out"));

const { requireLogin, checkTripId, checkUserId, requireMember, requireCreator } =
  require("./middleware")(pool);

/*
 * pool.query returns a object with potentially multiple rows (even if querying one thing),
 * thus, this helper just validates that the query returns only 1 entry.
 */
function getOneRow(result) {
  if (result.rows.length > 1) {
    throw new Error(`Expected 1 row but got ${result.rows.length}`);
  }
  return result.rows[0];
}

app.get("/api/login", (req, res) => {});
app.get("/api/signup", (req, res) => {});
app.get("/api/userInfo", (req, res) => {});

// API: Get ALL the trips the current user is a member of
app.get("/api/trips", (req, res) => {
  console.log(`Getting trips for user ${req.userId}`);
  pool
    .query(
      `SELECT trips.*, s.locationName AS startLocation, e.locationName AS endLocation
       FROM trips
       NATURAL JOIN tripMembers
       JOIN locations s ON s.locationId = trips.startLocationId
       JOIN locations e ON e.locationId = trips.endLocationId
       WHERE tripMembers.userId = $1
       ORDER BY trips.startDateTime`,
      [req.userId],
    )
    .then((result) => {
      console.log(`Found ${result.rows.length} trips for user ${req.userId}:`, result.rows);
      res.json(result.rows);
    })
    .catch((error) => {
      console.log("The following error occured:", error);
      res.status(500).send();
    });
});

// API: Get a specific trip
app.get("/api/trips/:tripId", (req, res) => {
  let tripId = req.params.tripId;
  console.log(`Getting trip ${tripId}`);
  pool
    .query(
      // isCreator is true/false: whether the current user made this trip
      `SELECT trips.*, s.locationName AS startLocation, e.locationName AS endLocation,
              trips.createdByUser = $2 AS isCreator
       FROM trips
       JOIN locations s ON s.locationId = trips.startLocationId
       JOIN locations e ON e.locationId = trips.endLocationId
       WHERE tripId = $1`,
      [tripId, req.userId],
    )
    .then((result) => getOneRow(result))
    .then((trip) => {
      console.log(`Found trip ${tripId}:`, trip);
      res.json(trip);
    })
    .catch((error) => {
      console.log("The following error occured:", error);
      res.status(500).send();
    });
});

// API: Get all locations (for the From / To / Location dropdowns)
app.get("/api/locations", (req, res) => {
  console.log("Getting all locations");
  pool
    .query(`SELECT * FROM locations ORDER BY locationName`)
    .then((result) => {
      console.log(`Found ${result.rows.length} locations:`, result.rows);
      res.json(result.rows);
    })
    .catch((error) => {
      console.log("The following error occured:", error);
      res.status(500).send();
    });
});

// API: Gets a specific trip's activities
app.get("/api/trips/:tripId/activities", (req, res) => {
  let tripId = req.params.tripId;
  console.log(`Getting activities for trip ${tripId}`);
  pool
    .query(
      `SELECT activities.*, locations.locationName
       FROM activities
       LEFT JOIN locations ON locations.locationId = activities.locationId
       WHERE tripId = $1
       ORDER BY activityDate, startTime`,
      [tripId],
    )
    .then((result) => {
      console.log(`Found ${result.rows.length} activities for trip ${tripId}:`, result.rows);
      res.json(result.rows);
    })
    .catch((error) => {
      console.log("The following error occured:", error);
      res.status(500).send();
    });
});

// API: Get the members of a specific trip.
app.get("/api/trips/:tripId/members", (req, res) => {
  let tripId = req.params.tripId;
  console.log(`Getting members for trip ${tripId}`);
  pool
    .query(
      // If isCreator is true it allows the user to add/remove people.
      `SELECT users.userId, users.username, tripMembers.joinedOn,
              trips.createdByUser = users.userId AS isCreator
       FROM tripMembers
       NATURAL JOIN users
       JOIN trips ON trips.tripId = tripMembers.tripId
       WHERE tripMembers.tripId = $1
       ORDER BY tripMembers.joinedOn`,
      [tripId],
    )
    .then((result) => {
      console.log(`Found ${result.rows.length} members for trip ${tripId}:`, result.rows);
      res.json(result.rows);
    })
    .catch((error) => {
      console.log("The following error occured:", error);
      res.status(500).send();
    });
});

// API: Get the notes for a specific trip
app.get("/api/trips/:tripId/notes", (req, res) => {
  let tripId = req.params.tripId;
  console.log(`Getting notes for trip ${tripId}`);
  pool
    .query(
      `SELECT tripNotes.*, users.username, tripNotes.userId = $2 AS isMyNote
       FROM tripNotes NATURAL JOIN users
       WHERE tripId = $1
       ORDER BY tripNotes.createdAt DESC`,
      [tripId, req.userId],
    )
    .then((result) => {
      console.log(`Found ${result.rows.length} notes for trip ${tripId}:`, result.rows);
      res.json(result.rows);
    })
    .catch((error) => {
      console.log("The following error occured:", error);
      res.status(500).send();
    });
});

// API: Add a trip
app.post("/api/trips", (req, res) => {
  let { tripName, startLocationId, endLocationId, startDateTime, endDateTime } = req.body;
  console.log(`Adding trip ${tripName} for user ${req.userId}`);
  pool
    .query(
      `WITH newTrip AS (
        INSERT INTO trips (tripName, startLocationId, endLocationId, startDateTime, endDateTime, createdByUser)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING tripId
      )
      INSERT INTO tripMembers (tripId, userId)
      SELECT tripId, $6 FROM newTrip
      RETURNING tripId`,
      [tripName, startLocationId, endLocationId, startDateTime, endDateTime, req.userId],
    )
    .then((result) => getOneRow(result).tripid)
    .then((newTripId) => {
      console.log(`Added trip ${tripName} with id ${newTripId}`);
      res.status(201).json({ tripid: newTripId });
    })
    .catch((error) => {
      console.log("The following error occured:", error);
      res.status(500).send();
    });
});

// API: Add a location
app.post("/api/locations", (req, res) => {
  let { locationName, city, region, country, latitude, longitude } = req.body;
  console.log(`Adding location ${locationName}`);
  pool
    .query(
      `INSERT INTO locations (locationName, city, region, country, latitude, longitude)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING locationId`,
      [locationName, city, region, country, latitude, longitude],
    )
    .then((result) => getOneRow(result).locationid)
    .then((newLocationId) => {
      console.log(`Added location ${locationName} with id ${newLocationId}`);
      res.status(201).json({ locationid: newLocationId });
    })
    .catch((error) => {
      console.log("The following error occured:", error);
      res.status(500).send();
    });
});

// API: Add a tripMember by username, restricts this functionality to the owner only.
app.post("/api/trips/:tripId/members", requireCreator, (req, res) => {
  let tripId = req.params.tripId;
  let username = req.body.username;
  console.log(`Adding ${username} to trip ${tripId}`);
  pool
    .query(`SELECT userId FROM users WHERE username = $1`, [username])
    .then((result) => getOneRow(result))
    .then((user) => {
      // Maybe we add a friend system so its easier to add members?
      if (!user) {
        console.log(`No user with name ${username} found `);
        return res.status(404).json({ error: "No user with that username" });
      }
      // ON CONFLICT DO NOTHING cleanly informs the user of a duplicate.
      // Whereras, removing it will throw a 500 code because Postgres will error out.
      return pool
        .query(
          `INSERT INTO tripMembers (tripId, userId) VALUES ($1, $2)
          ON CONFLICT DO NOTHING
          RETURNING userId`,
          [tripId, user.userid],
        )
        .then((result) => getOneRow(result))
        .then((newMember) => {
          // No row back means ON CONFLICT skipped it
          if (!newMember) {
            // code 409 is built in to signify conflict.
            console.log(`${username} is already a member`);
            res.status(409).json({ error: "Already a member of this trip" });
          } else {
            console.log(`Added ${username} as a trip member`);
            res.status(201).json(newMember);
          }
        });
    })
    .catch((error) => {
      console.log("The following error occured:", error);
      res.status(500).send();
    });
});

// API: Add a note to a trip (from the current user)
app.post("/api/trips/:tripId/notes", (req, res) => {
  let tripId = req.params.tripId;
  let { noteText } = req.body || {};

  // Check that noteText is populated and a string
  if (typeof noteText !== "string" || noteText.trim() === "") {
    console.log(`Invalid note text: ${noteText}`);
    return res.status(400).json({ error: "Note can't be empty" });
  }
  noteText = noteText.trim();

  console.log(`Adding a note to tripId: ${tripId}`);
  pool
    .query(
      `INSERT INTO tripNotes (tripId, userId, noteText) 
      VALUES ($1, $2, $3) 
      RETURNING noteId`,
      [tripId, req.userId, noteText],
    )
    .then((result) => getOneRow(result).noteid)
    .then((createdNoteId) => {
      console.log(`A new note "${noteText}" was created with id ${createdNoteId}`);
      res.status(201).json({ noteId: createdNoteId });
    })
    .catch((error) => {
      console.log("The following error occured:", error);
      res.status(500).send();
    });
});

// API: Delete a note. Only the person who wrote it can delete it.
app.delete("/api/trips/:tripId/notes/:noteId", (req, res) => {
  let tripId = req.params.tripId;
  let noteId = req.params.noteId;

  // noteId must be only digits, same check as checkTripId
  if (!/^\d+$/.test(noteId)) {
    console.log(`Invalid note id: ${noteId}`);
    return res.status(400).json({ error: "Note id must be a whole number" });
  }

  console.log(`User ${req.userId} deleting note ${noteId} from trip ${tripId}`);
  pool
    .query(`SELECT userId FROM tripNotes WHERE noteId = $1 AND tripId = $2`, [noteId, tripId])
    .then((result) => getOneRow(result))
    .then((note) => {
      if (!note) {
        console.log(`No note ${noteId} in trip ${tripId}`);
        return res.status(404).json({ error: "Note not found" });
      }
      // Postgres sends BIGINT ids back as strings, so compare as numbers
      if (Number(note.userid) !== req.userId) {
        console.log(`User ${req.userId} tried to delete someone else's note ${noteId}`);
        return res.status(403).json({ error: "You can only delete your own notes" });
      }
      return pool.query(`DELETE FROM tripNotes WHERE noteId = $1`, [noteId]).then(() => {
        console.log(`Deleted note ${noteId}`);
        // 204 = worked, nothing to send back
        res.status(204).send();
      });
    })
    .catch((error) => {
      console.log("The following error occured:", error);
      res.status(500).send();
    });
});

// API: Remove a trip member and everything they added.
app.delete("/api/trips/:tripId/members/:userId", [requireCreator, checkUserId], (req, res) => {
  let tripId = req.params.tripId;
  let userId = req.params.userId;

  // Check the creater isnt removing themselves
  if (Number(userId) === req.userId) {
    console.log(`Creator tried to remove themselves from trip ${tripId}`);
    return res.status(400).json({ error: "The creator can't be removed" });
  }

  console.log(`Removing user ${userId} from trip ${tripId}`);
  pool
    .query(
      `DELETE FROM tripMembers WHERE tripId = $1 AND userId = $2
       RETURNING userId`,
      [tripId, userId],
    )
    .then((result) => getOneRow(result))
    .then((removedMember) => {
      // No row back means they weren't a member of this trip
      if (!removedMember) {
        console.log(`User ${userId} is not a member of trip ${tripId}`);
        return res.status(404).json({ error: "That user isn't a member of this trip" });
      }
      console.log(`Removed user ${userId} from trip ${tripId}`);
      res.status(204).send();
    })
    .catch((error) => {
      console.log("The following error occured:", error);
      res.status(500).send();
    });
});

// Routing: send the user to trip.html page.
app.get("/trips/:tripId", (req, res) => {
  res.sendFile(__dirname + "/public/trips/trip.html");
});

// Routing: send the user to login.html page.
app.get("/login", (req, res) => {
  res.sendFile(__dirname + "/public/userAuth/login.html");
});

// Routing: send the user to signup.html page.
app.get("/signup", (req, res) => {
  res.sendFile(__dirname + "/public/userAuth/signup.html");
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
