const express = require('express');
const app = express();

// Routes
const loginRoute = require('./api/routes/loginRoute');
const registerRoute = require('./api/routes/registerRoute');

// Protected
const profileRoute = require('./api/routes/profileRoute');

// Middleware
const verifyToken = require('./middlewares/verifyToken');

app.use(express.json());
//app.use('/', (req, res) => { res.send('Welcome to the API'); });
app.use('/login', loginRoute);
app.use('/register', registerRoute);

// Protected Route
app.use('/protected', verifyToken);

// Protected Routes
app.use('/protected/profile', profileRoute);


module.exports = app;