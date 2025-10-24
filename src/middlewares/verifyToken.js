const jwt = require('jsonwebtoken');
const logger = require('../config/logger');
const secret = process.env.JWT_SECRET_KEY;

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1] || null;

    if (!token) {
        logger.warn('Token não fornecido', { ip: req.ip, path: req.path });
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, secret);

        if (!decoded) {
            logger.warn('Falha ao decodificar token', { ip: req.ip, path: req.path });
            return res.status(401).json({ message: 'Failed to authenticate token' });
        }

        req.user = decoded;
        next();
    } catch (error) {
        logger.error('Erro ao verificar token', {
            error: error.message,
            ip: req.ip,
            path: req.path
        });

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' });
        }

        return res.status(401).json({ message: 'Failed to authenticate token' });
    }
};

module.exports = verifyToken;