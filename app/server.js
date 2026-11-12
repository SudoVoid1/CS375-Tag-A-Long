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
app.use("/css", express.static("node_modules/water.css/out"));

// Placeholder for the logged-in user until login exists.
const currentUserId = 1;

const { requireMember, requireCreator } = require("./middleware")(pool, currentUserId);

// Applies the middleware (only the owner/member can access their trips) for EVERY trip route.
app.use("/api/trips/:tripId", requireMember);

// API: Get ALL the trips the current user is a member of
app.get("/api/trips", (req, res) => {
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
    .then((result) => res.json(result.rows))
    .catch((error) => {
      console.log(error);
      res.status(500).send();
    });
});

// API: Get a specific trip
app.get("/api/trips/:tripId", (req, res) => {
  pool
    .query(
      `SELECT trips.*, s.locationName AS startLocation, e.locationName AS endLocation
       FROM trips
       JOIN locations s ON s.locationId = trips.startLocationId
       JOIN locations e ON e.locationId = trips.endLocationId
       WHERE tripId = $1`,
      [req.params.tripId],
    )
    .then((result) => {
      console.log(result.rows[0]);
      res.json(result.rows[0]);
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send();
    });
});

// API: Get all locations (for the From / To / Location dropdowns)
app.get("/api/locations", (req, res) => {
  pool
    .query(`SELECT * FROM locations ORDER BY locationName`)
    .then((result) => res.json(result.rows))
    .catch((error) => {
      console.log(error);
      res.status(500).send();
    });
});

// API: Gets a specific trip's activities
app.get("/api/trips/:tripId/activities", (req, res) => {
  pool
    .query(
      `SELECT activities.*, locations.locationName
       FROM activities
       LEFT JOIN locations ON locations.locationId = activities.locationId
       WHERE tripId = $1
       ORDER BY activityDate, startTime`,
      [req.params.tripId],
    )
    .then((result) => res.json(result.rows))
    .catch((error) => {
      console.log(error);
      res.status(500).send();
    });
});

// API: Add a trip
app.post("/api/trips", (req, res) => {
  const { tripName, startLocationId, endLocationId, startDateTime, endDateTime } = req.body;
  pool
    .query(
      `INSERT INTO trips (tripName, startLocationId, endLocationId, startDateTime, endDateTime, createdByUser)
       VALUES ($1, $2, $3, $4, $5, 1)
       RETURNING tripId`,
      [tripName, startLocationId, endLocationId, startDateTime, endDateTime],
    )
    .then((result) => res.status(201).json(result.rows[0]))
    .catch((error) => {
      console.log(error);
      res.status(500).send();
    });
});

// API: Add a location
app.post("/api/locations", (req, res) => {
  const { locationName, city, region, country, latitude, longitude } = req.body;
  pool
    .query(
      `INSERT INTO trips (locationName, city, region, country, latitude, longitude)
       VALUES ($1, $2, $3, $4, $5, 1)
       RETURNING tripId`,
      [locationName, city, region, country, latitude, longitude],
    )
    .then((result) => res.status(201).json(result.rows[0]))
    .catch((error) => {
      console.log(error);
      res.status(500).send();
    });
});

// API: Add a tripMember by username, restricts this functionality to the owner only.
app.post("/api/trips/:tripId/members", requireCreator, (req, res) => {
  pool
    .query(`SELECT userId FROM users WHERE username = $1`, [req.body.username])
    .then((result) => {
      // Maybe we add a friend system so its easier to add members?
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "No user with that username" });
      }
      return pool
        .query(
          `INSERT INTO tripMembers (tripId, userId) VALUES ($1, $2)
           RETURNING userId`,
          [req.params.tripId, result.rows[0].userid],
        )
        .then((insertedRows) => {
          if (insertedRows.rows.length === 0) {
            // code 409 is built in to signify conflict.
            res.status(409).json({ error: "Already a member of this trip" });
          } else {
            res.status(201).json(insertedRows.rows[0]);
          }
        });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send();
    });
});

// Routing: send the user to trip.html page.
app.get("/trips/:tripId", (req, res) => {
  res.sendFile(__dirname + "/public/trips/trip.html");
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
