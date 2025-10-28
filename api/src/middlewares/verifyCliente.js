const jwt = require('jsonwebtoken');
const logger = require('../config/logger');

// Garante que apenas clientes (não admin, não atendente) acessem rotas protegidas do app do cliente
const verifyCliente = (req, res, next) => {
    try {
        const decoded = req.user || jwt.verify(
            req.headers.authorization?.split(' ')[1] || '',
            process.env.JWT_SECRET_KEY
        );

        const isAdmin = decoded?.tipo === 'admin' || decoded?.role === 'admin';
        const isAtendente = decoded?.tipo === 'atendente';

        if (isAdmin || isAtendente) {
            return res.status(403).json({ message: 'Acesso negado: apenas clientes' });
        }

        // Para conveniência em controllers
        req.user = decoded;
        req.clienteId = decoded?.userId;
        next();
    } catch (error) {
        logger.error(`Erro ao verificar cliente: ${error.message}`);
        return res.status(401).json({ message: 'Token inválido' });
    }
};

module.exports = verifyCliente;
