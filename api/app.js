const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
const app = express();

app.use(cors());
app.set('trust proxy', 1);

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { error: 'Muitas tentativas de login, tente novamente mais tarde' },
    standardHeaders: true,
    legacyHeaders: false,
});

const registerLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: 'Muitas tentativas de registro, tente novamente mais tarde' },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => process.env.NODE_ENV === 'test',
});

const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'Muitas requisições, tente novamente mais tarde' },
    standardHeaders: true,
    legacyHeaders: false,
});

const loginRoute = require('./src/routes/loginRoute');
const registerRoute = require('./src/routes/registerRoute');
const veterinariosRoute = require('./src/routes/veterinariosRoute');
const adminRoute = require('./src/routes/adminRoute');
const atendenteRoute = require('./src/routes/atendenteRoute');

const profileRoute = require('./src/routes/profileRoute');
const petsRoute = require('./src/routes/petsRoute');
const agendamentosRoute = require('./src/routes/agendamentosRoute');
const historicosRoute = require('./src/routes/historicosRoute');
const produtosRoute = require('./src/routes/produtosRoute');

const verifyToken = require('./src/middlewares/verifyToken');
const verifyCliente = require('./src/middlewares/verifyCliente');

app.use('/public', express.static(path.join(__dirname, '..', 'public')));

app.use(generalLimiter);

app.use(express.json({ limit: '10kb' }));

app.get('/', (req, res) => {
    res.send('Bem-vindo à API DuskPet');
});

app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        uptime: process.uptime(),
        timestamp: Date.now(),
        env: process.env.NODE_ENV || 'development'
    });
});

app.use('/login', loginLimiter, loginRoute);
app.use('/register', registerLimiter, registerRoute);
app.use('/veterinarios', veterinariosRoute);
app.use('/admin', adminRoute);
app.use('/atendente', atendenteRoute);

app.use('/protected', verifyToken, verifyCliente);

app.use('/protected/profile', profileRoute);
app.use('/protected/pets', petsRoute);
app.use('/protected/agendamentos', agendamentosRoute);
app.use('/protected/historicos', historicosRoute);
app.use('/protected/produtos', produtosRoute);


module.exports = app;