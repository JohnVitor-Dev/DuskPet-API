const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET_KEY;

const register = async (req, res) => {
    const { name, phone, email, password } = req.body;

    if (!name || !phone || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    if (!JWT_SECRET) throw new Error("JWT_SECRET_KEY não definido");

    try {
        const existingUser = await prisma.clientes.findUnique({ where: { email } });
        if (existingUser) {
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

        res.status(201).json({ token });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    register
};