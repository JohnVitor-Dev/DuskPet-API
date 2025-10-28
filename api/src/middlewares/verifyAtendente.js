const jwt = require('jsonwebtoken');
const logger = require('../config/logger');

const verifyAtendente = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Token não fornecido' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

        const isAtendente = decoded.tipo === 'atendente';
        const isAdmin = decoded.tipo === 'admin' || decoded.role === 'admin';
        if (!isAtendente && !isAdmin) {
            return res.status(403).json({ message: 'Acesso negado: apenas atendentes ou administradores' });
        }

        req.atendenteId = decoded.id || decoded.userId;
        req.tipo = isAdmin ? 'admin' : 'atendente';
        next();
    } catch (error) {
        logger.error(`Erro ao verificar token atendente: ${error.message}`);
        return res.status(401).json({ message: 'Token inválido' });
    }
};

module.exports = verifyAtendente;
