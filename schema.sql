CREATE TABLE user (
    userId BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    username VARCHAR(50) NOT NULL,
    passwordHash VARCHAR(50) NOT NULL,
    createdOn TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (email, username)
);
CREATE TABLE locations (
    locationId BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100),
    region VARCHAR(100),
    country VARCHAR(100),
    latitude NUMERIC(9, 6) CHECK (
        latitude BETWEEN -90 AND 90
    ),
    longitude NUMERIC(9, 6) CHECK (
        longitude BETWEEN -180 AND 180
    ),
    UNIQUE (name, city, country)
);
CREATE TABLE trips (
    tripId BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tripName VARCHAR(255) NOT NULL startLocation INT NOT NULL REFERENCES users(userId),
    startLocationId BIGINT NOT NULL REFERENCES locations(locationId),
    endLocationId BIGINT NOT NULL REFERENCES locations(locationId),
    startDate DATE,
    endDate DATE,
    createdByUser INT NOT NULL REFERENCES users(userId),
    createdAt TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (endDate >= startDate)
);
CREATE TABLE tripMembers (
    tripId INT NOT NULL REFERENCES trips(tripId) ON DELETE CASCADE,
    userId INT NOT NULL REFERENCES users(userId) ON DELETE CASCADE,
    budget NUMERIC(10, 2) CHECK (personal_budget >= 0),
    joinedON TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (tripId, userId)
);