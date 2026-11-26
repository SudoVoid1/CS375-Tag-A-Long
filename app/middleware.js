// Takes the Postgres object to return validation functions to use as middleware,
// reducing the redundant checking.
module.exports = (pool) => {
  const SESSION_HOURS = 24;

  // Required for every route.
  function requireLogin(req, res, next) {
    let token = req.cookies.token;
    if (!token) {
      console.log(`No login cookie for ${req.method} ${req.originalUrl}`);
      return res.status(401).json({ error: "Please log in" });
    }
    // Tries to match the given cookie to ones saved in the sessions table, if it find one it sets the
    // req.userId to the logged-in user.
    pool
      .query(
        // Check if the session has expired
        `SELECT userId FROM sessions
        WHERE token = $1 AND createdAt > now() - ($2 * interval '1 hour')`,
        [token, SESSION_HOURS],
      )
      .then((result) => {
        if (result.rows.length === 0) {
          console.log(`Unknown or expired login for ${req.method} ${req.originalUrl}`);
          return res.status(401).json({ error: "Your login expired, please log in again" });
        }
        req.userId = Number(result.rows[0].userid);
        next();
      })
      .catch((error) => {
        console.log("The following error occured:", error);
        res.status(500).send();
      });
  }

  // tripId in the URL must be a integar >= 0.
  function checkTripId(req, res, next) {
    let tripId = req.params.tripId;
    // Regex to test if tripId is a number
    if (/^\d+$/.test(tripId)) {
      next();
    } else {
      console.log(`Invalid trip id: ${tripId}`);
      return res.status(400).json({ error: "Trip id must be a integer >= 0" });
    }
  }

  function checkUserId(req, res, next) {
    let userId = req.params.userId;
    if (/^\d+$/.test(userId)) {
      next();
    } else {
      console.log(`Invalid user id: ${userId}`);
      return res.status(400).json({ error: "User id must be a whole number" });
    }
  }

  // Only the owner/members of a trip can see or change it's details.
  function requireMember(req, res, next) {
    let tripId = req.params.tripId;
    pool
      .query(
        `SELECT * FROM tripMembers 
        WHERE tripId = $1 AND userId = $2`,
        [tripId, req.userId],
      )
      .then((result) => {
        if (result.rows.length > 0) {
          // next() tells express to continue to the route.
          next();
        } else {
          res.status(404).json({ error: "Trip not found" });
        }
      })
      .catch((error) => {
        console.log("The following error occured:", error);
        res.status(500).send();
      });
  }

  // Only the trip's creator can add or remove members.
  function requireCreator(req, res, next) {
    let tripId = req.params.tripId;
    pool
      .query(
        `SELECT * FROM trips 
        WHERE tripId = $1 AND createdByUser = $2`,
        [tripId, req.userId],
      )
      .then((result) => {
        if (result.rows.length > 0) {
          // next() tells express to continue to the route.
          next();
        } else {
          res.status(403).json({ error: "Only the trip creator can do that" });
        }
      })
      .catch((error) => {
        console.log("The following error occured:", error);
        res.status(500).send();
      });
  }

  return { requireLogin, checkTripId, checkUserId, requireMember, requireCreator };
};
