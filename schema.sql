CREATE TABLE users (
    userId BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    username VARCHAR(50) NOT NULL,
    passwordHash TEXT NOT NULL,
    createdOn TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (email, username)
);
CREATE TABLE locations (
    locationId BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    locationName VARCHAR(255) NOT NULL,
    city VARCHAR(100),
    region VARCHAR(100),
    country VARCHAR(100),
    latitude NUMERIC(9, 6),
    longitude NUMERIC(9, 6),
    UNIQUE (locationName, city, country),
    CONSTRAINT validLatitude CHECK (
        latitude BETWEEN -90 AND 90
    ),
    CONSTRAINT validLongitude CHECK (
        longitude BETWEEN -180 AND 180
    )
);
CREATE TABLE trips (
    tripId BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tripName VARCHAR(255) NOT NULL,
    startLocationId BIGINT NOT NULL REFERENCES locations(locationId),
    endLocationId BIGINT NOT NULL REFERENCES locations(locationId),
    startDateTime DATETIME,
    endDateTime DATETIME,
    createdByUser BIGINT NOT NULL REFERENCES users(userId),
    createdAt TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT validDate CHECK (endDate >= startDate)
);
CREATE TABLE tripMembers (
    tripId BIGINT NOT NULL REFERENCES trips(tripId) ON DELETE CASCADE,
    userId BIGINT NOT NULL REFERENCES users(userId) ON DELETE CASCADE,
    budget NUMERIC(10, 2),
    joinedOn TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (tripId, userId),
    CONSTRAINT nonNegativeBudget CHECK (budget >= 0)
);