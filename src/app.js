const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const app = express();

app.use(cors());

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

const loginRoute = require('./api/routes/loginRoute');
const registerRoute = require('./api/routes/registerRoute');
const veterinariosRoute = require('./api/routes/veterinariosRoute');
const adminRoute = require('./api/routes/adminRoute');
const atendenteRoute = require('./api/routes/atendenteRoute');

const profileRoute = require('./api/routes/profileRoute');
const petsRoute = require('./api/routes/petsRoute');
const agendamentosRoute = require('./api/routes/agendamentosRoute');
const historicosRoute = require('./api/routes/historicosRoute');
const produtosRoute = require('./api/routes/produtosRoute');

const verifyToken = require('./middlewares/verifyToken');
const verifyCliente = require('./middlewares/verifyCliente');

app.use(generalLimiter);

app.use(express.json({ limit: '10kb' }));

app.get('/', (req, res) => {
    res.send('Bem-vindo à API DuskPet');
});

app.use('/login', loginLimiter, loginRoute);
app.use('/register', registerLimiter, registerRoute);
app.use('/veterinarios', veterinariosRoute);
app.use('/admin', adminRoute);
app.use('/atendente', atendenteRoute);

// Rotas do app do cliente: exigem token válido e perfil de cliente
app.use('/protected', verifyToken, verifyCliente);

app.use('/protected/profile', profileRoute);
app.use('/protected/pets', petsRoute);
app.use('/protected/agendamentos', agendamentosRoute);
app.use('/protected/historicos', historicosRoute);
app.use('/protected/produtos', produtosRoute);


module.exports = app;