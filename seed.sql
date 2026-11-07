
INSERT INTO users (email, username, passwordHash) VALUES
    ('alice@example.com', 'alice', 'placeholder-hash-alice'),
    ('bob@example.com',   'bob',   'placeholder-hash-bob'),
    ('carol@example.com', 'carol', 'placeholder-hash-carol');

INSERT INTO locations (locationName, city, region, country, latitude, longitude) VALUES
    ('30th Street Station',     'Philadelphia', 'PA', 'USA', 39.955615, -75.181961),
    ('Penn Station',            'New York',     'NY', 'USA', 40.750568, -73.993519),
    ('Union Station',           'Washington',   'DC', 'USA', 38.897600, -77.006300),
    ('Logan International Airport', 'Boston',   'MA', 'USA', 42.365600, -71.009600),
    ('Central Park',            'New York',     'NY', 'USA', 40.785091, -73.968285);

INSERT INTO trips (tripName, startLocationId, endLocationId, startDateTime, endDateTime, createdByUser) VALUES
    ('NYC Weekend',      1, 2, '2026-12-04 08:00', '2026-12-06 20:00', 1),
    ('DC Museum Trip',   1, 3, '2027-01-15 09:00', '2027-01-17 18:00', 2),
    ('Boston Spring Break', 1, 4, '2027-03-20 07:00', '2027-03-27 21:00', 1);


INSERT INTO tripMembers (tripId, userId, budget) VALUES
    (1, 1, 100.00),
    (1, 2, 200.00),
    (2, 2, 300.00),
    (2, 1, 400.00),
    (3, 1, 500.00),
    (3, 3, 600.00);

INSERT INTO activities (tripId, createdByUser, locationId, activityName, category, activityDate, startTime, durationMinutes, cost) VALUES
    (1, 1, 5, 'Walk through Central Park', 'Sightseeing', '2026-12-05', '10:00', 60, 0),
    (1, 2, 2, 'Dinner near Penn Station',  'Food',        '2026-12-05', '19:00', 90,  45.00),
    (2, 2, 3, 'Smithsonian museums',       'Museum',      '2027-01-16', '10:00', 120, 0);
