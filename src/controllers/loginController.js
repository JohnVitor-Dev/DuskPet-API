const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const logger = require('../config/logger');

const JWT_SECRET = process.env.JWT_SECRET_KEY;

const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        logger.warn('Tentativa de login sem credenciais completas', { email });
        return res.status(400).json({ error: 'Email and password are required' });
    }

    if (!JWT_SECRET) {
        logger.error('JWT_SECRET_KEY não definido');
        throw new Error("JWT_SECRET_KEY não definido");
    }

    try {
        const user = await prisma.clientes.findUnique({ where: { email } });

        if (!user) {
            logger.warn('Tentativa de login com email inexistente', { email, ip: req.ip });
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const validPassword = await bcrypt.compare(password, user.senha_hash);

        if (!validPassword) {
            logger.warn('Tentativa de login com senha inválida', { email, ip: req.ip });
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRATION || '1h' }
        );

        logger.info('Login bem-sucedido', { userId: user.id, email: user.email });
        res.json({ token });
    } catch (error) {
        logger.error('Erro no login', { error: error.message, stack: error.stack, email });
        res.status(500).json({ error: 'Internal server error' });
    }
};

const adminLogin = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        logger.warn('Tentativa de login admin sem credenciais completas', { email });
        return res.status(400).json({ error: 'Email and password are required' });
    }

    if (!JWT_SECRET) {
        logger.error('JWT_SECRET_KEY não definido');
        throw new Error("JWT_SECRET_KEY não definido");
    }

    try {
        const admin = await prisma.administradores.findUnique({ where: { email } });

        if (!admin) {
            logger.warn('Tentativa de login admin com email inexistente', { email, ip: req.ip });
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const valid = await bcrypt.compare(password, admin.senha_hash);

        if (!valid) {
            logger.warn('Tentativa de login admin com senha inválida', { email, ip: req.ip });
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: admin.id, email: admin.email, role: "admin" },
            JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRATION || '1h' }
        );

        logger.info('Login admin bem-sucedido', { userId: admin.id, email: admin.email });
        res.json({ token });

    } catch (error) {
        logger.error('Erro no login admin', { error: error.message, stack: error.stack, email });
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    login,
    adminLogin
};