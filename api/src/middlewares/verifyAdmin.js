const jwt = require('jsonwebtoken');
const logger = require('../config/logger');

const verifyAdmin = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Token não fornecido' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

        const isAdmin = decoded.tipo === 'admin' || decoded.role === 'admin';
        if (!isAdmin) {
            return res.status(403).json({ message: 'Acesso negado: apenas administradores' });
        }

        req.adminId = decoded.id || decoded.userId;
        next();
    } catch (error) {
        logger.error(`Erro ao verificar token admin: ${error.message}`);
        return res.status(401).json({ message: 'Token inválido' });
    }
};

module.exports = verifyAdmin;
