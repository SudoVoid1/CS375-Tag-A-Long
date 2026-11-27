# CS375-Tag-A-Long

A simple way to plan and organize a trip with friends. Built with Node, Express and PostgreSQL.

## Requirements

- [Node.js](https://nodejs.org/)
- [PostgreSQL](https://www.postgresql.org/)

## Project layout

```
app/
  server.js              Express server and all routes
  middleware.js          Login and validation checks
  public/
    index.html           Home page
    globalComponents/    Shared CSS and JS (served at /css and /js routes)
    userAuth/            All authentication (login/signup) related pages
    trips/               All trip related pages
create.sql               Script to create the Tag-A-Long database
schema.sql               Script to setup all the tables/relationships
seed.sql                 Script to add some example data to the created tables
```

## Setup

1. Install the packages:

   ```bash
   npm install
   ```

2. Copy the example env file and put all your Postgres configurations in it:

   ```bash
   cp env.example.json env.json
   ```

3. Run the setup script to create the database, tables and sample data:

   ```bash
   npm run setup
   ```

4. Run the app locally

   ```bash
   npm start
   ```
