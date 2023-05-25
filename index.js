const express = require('express')
const bodyParser = require("body-parser");

const app = express()
const cors = require('cors')
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

let users = [];
let nextId = 1;

// Create a new user
app.post("/api/users", function(req, res) {
  const username = req.body.username;
  const user = {
    username: username,
    _id: nextId,
    log: []
  };
  users.push(user);
  nextId++;
  res.json(user);
});

// Get a list of all users
app.get("/api/users", function(req, res) {
  const usersArray = users.map(({ username, _id }) => ({
    username: username,
    _id: _id.toString()
  }));
  res.json(usersArray);
});

// Add an exercise for a user
app.post("/api/users/:_id/exercises", function(req, res) {
  const userId = parseInt(req.params._id);
  const { description, duration, date } = req.body;
  const userIndex = users.findIndex((user) => user._id === userId);

  if (userIndex === -1) {
    return res.json({ error: "User not found" });
  }

  const exercise = {
    description: description,
    duration: parseInt(duration),
    date: date ? new Date(date).toDateString() : new Date().toDateString()
  };

  users[userIndex].log.push(exercise);

  const { username, _id } = users[userIndex];
  const response = {
    username: username,
    description: exercise.description,
    duration: exercise.duration,
    date: exercise.date,
    _id: _id
  };

  res.json(response); // Return the user object with exercise fields added
});



// Get the exercise log of a user
app.get("/api/users/:_id/logs", function(req, res) {
  const userId = parseInt(req.params._id);
  const user = users.find((user) => user._id === userId);

  if (!user) {
    return res.json({ error: "User not found" });
  }

  let { from, to, limit } = req.query;

  if (from) {
    from = new Date(from);
  }

  if (to) {
    to = new Date(to);
  }

  let log = user.log.map(({ description, duration, date }) => ({
    description,
    duration,
    date: new Date(date).toDateString() // Format the date as a string
  }));

  if (from) {
    log = log.filter((exercise) => new Date(exercise.date) >= from);
  }

  if (to) {
    log = log.filter((exercise) => new Date(exercise.date) <= to);
  }

  if (limit) {
    limit = parseInt(limit);
    log = log.slice(0, limit);
  }

  res.json({
    _id: user._id,
    username: user.username,
    count: log.length,
    log: log
  });
});



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
