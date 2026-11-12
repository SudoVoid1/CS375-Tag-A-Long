// Takes the Postgres object AND the currentUser to return validation functions to use as middleware,
// reducing the redundant checking.
module.exports = (pool, currentUserId) => {
  // Only the owner/members of a trip can see or change it's details.
  function requireMember(req, res, next) {
    let tripId = req.params.tripId;
    pool
      .query(`SELECT * FROM tripMembers WHERE tripId = $1 AND userId = $2`, [
        tripId,
        currentUserId,
      ])
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
      .query(`SELECT * FROM trips WHERE tripId = $1 AND createdByUser = $2`, [
        tripId,
        currentUserId,
      ])
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

  return { requireMember, requireCreator };
};
