const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const logger = require('../config/logger');

const JWT_SECRET = process.env.JWT_SECRET_KEY;

const register = async (req, res) => {
    const { name, phone, email, password } = req.body;

    if (!name || !phone || !email || !password) {
        logger.warn('Tentativa de registro com campos faltando', { email });
        return res.status(400).json({ error: 'All fields are required' });
    }

    if (!JWT_SECRET) {
        logger.error('JWT_SECRET_KEY não definido');
        throw new Error("JWT_SECRET_KEY não definido");
    }

    try {
        const existingUser = await prisma.clientes.findUnique({ where: { email } });
        if (existingUser) {
            logger.warn('Tentativa de registro com email já existente', { email, ip: req.ip });
            return res.status(400).json({ error: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 8);
        const newUser = await prisma.clientes.create({
            data: {
                nome: name,
                celular: phone,
                email: email,
                senha_hash: hashedPassword
            }
        });

        const token = jwt.sign(
            { userId: newUser.id, email: newUser.email },
            JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRATION || '1h' }
        );

        logger.info('Novo usuário registrado', { userId: newUser.id, email: newUser.email });
        res.status(201).json({ token });
    } catch (error) {
        logger.error('Erro no registro', { error: error.message, stack: error.stack, email });
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    register
};