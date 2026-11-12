require("dotenv").config();
const pg = require("pg");
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

const env = require("../env.json");
const Pool = pg.Pool;
const pool = new Pool(env);
pool.connect().then(function () {
  console.log(`Connected to database ${env.database}`);
});

app.use(express.json());
app.use(express.static("public"));
app.use(express.static("trips"));
app.use("/css", express.static("../node_modules/water.css/out"));

// Placeholder for the logged-in user until login exists.
const currentUserId = 1;

const { requireMember, requireCreator } = require("./middleware")(pool, currentUserId);

// Applies the middleware (only the owner/member can access their trips) for EVERY trip route.
app.use("/api/trips/:tripId", requireMember);

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

// API: Get ALL the trips the current user is a member of
app.get("/api/trips", (req, res) => {
  console.log(`Getting trips for user ${currentUserId}`);
  pool
    .query(
      `SELECT trips.*, s.locationName AS startLocation, e.locationName AS endLocation
       FROM trips
       NATURAL JOIN tripMembers
       JOIN locations s ON s.locationId = trips.startLocationId
       JOIN locations e ON e.locationId = trips.endLocationId
       WHERE tripMembers.userId = $1
       ORDER BY trips.startDateTime`,
      [currentUserId],
    )
    .then((result) => {
      console.log(`Found ${result.rows.length} trips for user ${currentUserId}:`, result.rows);
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
      `SELECT trips.*, s.locationName AS startLocation, e.locationName AS endLocation
       FROM trips
       JOIN locations s ON s.locationId = trips.startLocationId
       JOIN locations e ON e.locationId = trips.endLocationId
       WHERE tripId = $1`,
      [tripId],
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

// API: Add a trip
app.post("/api/trips", (req, res) => {
  let { tripName, startLocationId, endLocationId, startDateTime, endDateTime } = req.body;
  console.log(`Adding trip ${tripName} for user ${currentUserId}`);
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
      [tripName, startLocationId, endLocationId, startDateTime, endDateTime, currentUserId],
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

// Routing: send the user to trip.html page.
app.get("/trips/:tripId", (req, res) => {
  res.sendFile(__dirname + "/public/trips/trip.html");
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
