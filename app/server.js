require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("public"));

app.get("/trip", (req, res) => {
  res.sendFile(path.join(__dirname, "public/trip/index.html"));
});

app.get("/itinerary", (req, res) => {
  res.sendFile(path.join(__dirname, "public/trip/itinerary.html"));
});

app.get("/budget", (req, res) => {
  res.sendFile(path.join(__dirname, "public/trip/budget.html"));
});

app.get("/budget", (req, res) => {
  res.sendFile(path.join(__dirname, "public/trip/notes.html"));
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
