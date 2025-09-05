const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET_KEY;

const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    if (!JWT_SECRET) throw new Error("JWT_SECRET_KEY não definido");

    try {
        const user = await prisma.clientes.findUnique({ where: { email } });
        if (!user) { return res.status(401).json({ error: 'Invalid credentials' }); }

        const validPassword = await bcrypt.compare(password, user.senha_hash);
        if (!validPassword) { return res.status(401).json({ error: 'Invalid credentials' }); }

        const token = jwt.sign(
            { userId: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRATION || '1h' }
        );

        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

const adminLogin = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    if (!JWT_SECRET) throw new Error("JWT_SECRET_KEY não definido");

    try {
        const admin = await prisma.administradores.findUnique({ where: { email } });
        if (!admin) return res.status(401).json({ error: "Credenciais inválidas" });

        const valid = bcrypt.compareSync(password, admin.senha_hash);
        if (!valid) return res.status(401).json({ error: "Credenciais inválidas" });

        const token = jwt.sign(
            { id: admin.id, nome: admin.nome, role: "admin" },
            JWT_SECRET_KEY,
            { expiresIn: process.env.JWT_EXPIRATION || '1h' }
        );

        res.json({ token });

    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    login,
    adminLogin
};