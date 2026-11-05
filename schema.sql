DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS tripMembers CASCADE;
DROP TABLE IF EXISTS trips CASCADE;
DROP TABLE IF EXISTS locations CASCADE;
DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users (
    userId BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(50) NOT NULL UNIQUE,
    passwordHash TEXT NOT NULL,
    createdOn TIMESTAMPTZ NOT NULL DEFAULT now()
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
    startLocationId BIGINT NOT NULL,
    endLocationId BIGINT NOT NULL,
    startDateTime TIMESTAMP,
    endDateTime TIMESTAMP,
    createdByUser BIGINT NOT NULL,
    createdAt TIMESTAMPTZ NOT NULL DEFAULT now(),
    FOREIGN KEY (startLocationId) REFERENCES locations(locationId),
    FOREIGN KEY (endLocationId) REFERENCES locations(locationId),
    FOREIGN KEY (createdByUser) REFERENCES users(userId),
    CONSTRAINT validDate CHECK (endDateTime >= startDateTime)
);
CREATE TABLE tripMembers (
    tripId BIGINT NOT NULL,
    userId BIGINT NOT NULL,
    budget NUMERIC(10, 2),
    joinedOn TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (tripId, userId),
    FOREIGN KEY (tripId) REFERENCES trips(tripId) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE,
    CONSTRAINT nonNegativeBudget CHECK (budget >= 0)
);
CREATE TABLE activities (
    activityId BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tripId BIGINT NOT NULL,
    createdByUser BIGINT NOT NULL,
    locationId BIGINT,
    activityName VARCHAR(255) NOT NULL,
    category VARCHAR(30),
    activityDate DATE,
    startTime TIME,
    durationMinutes INT NOT NULL DEFAULT 30,
    cost NUMERIC(10, 2) NOT NULL DEFAULT 0,
    createdAt TIMESTAMPTZ NOT NULL DEFAULT now(),
    FOREIGN KEY (tripId, createdByUser) REFERENCES tripMembers(tripId, userId) ON DELETE CASCADE,
    FOREIGN KEY (locationId) REFERENCES locations(locationId) ON DELETE SET NULL,
    CONSTRAINT nonNegativeCost CHECK (cost >= 0),
    CONSTRAINT positiveDuration CHECK (durationMinutes > 0)
);