const express = require('express');
const app = express();

const userRoute = require('./api/routes/userRoute');
const testRoute = require('./api/routes/testRoute');

app.use('/users', userRoute);
app.use('/test', testRoute);

module.exports = app;