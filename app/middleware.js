// Takes the Postgres object AND the currentUser to return validation functions to use as middleware,
// reducing the redundant checking.
module.exports = (pool, currentUserId) => {
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
        [tripId, currentUserId],
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
        [tripId, currentUserId],
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

  return { checkTripId, checkUserId, requireMember, requireCreator };
};
