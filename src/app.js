const express = require('express');
const rateLimit = require('express-rate-limit');
const app = express();

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { error: 'Too many login attempts, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});

const registerLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: 'Too many registration attempts, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => process.env.NODE_ENV === 'test',
});

const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'Too many requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});

const loginRoute = require('./api/routes/loginRoute');
const registerRoute = require('./api/routes/registerRoute');

const profileRoute = require('./api/routes/profileRoute');
const petsRoute = require('./api/routes/petsRoute');

const verifyToken = require('./middlewares/verifyToken');

app.use(generalLimiter);

app.use(express.json({ limit: '10kb' }));

app.get('/', (req, res) => {
    res.send('Welcome to the API');
});

app.use('/login', loginLimiter, loginRoute);
app.use('/register', registerLimiter, registerRoute);

app.use('/protected', verifyToken);

app.use('/protected/profile', profileRoute);
app.use('/protected/pets', petsRoute);


module.exports = app;