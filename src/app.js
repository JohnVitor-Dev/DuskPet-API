const express = require('express');
const app = express();

const loginRoute = require('./api/routes/loginRoute');
const registerRoute = require('./api/routes/registerRoute');

app.use(express.json());
app.use('/login', loginRoute);
app.use('/register', registerRoute);

module.exports = app;