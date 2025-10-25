const prisma = require('../config/prisma');
const logger = require('../config/logger');

const getProfile = async (req, res) => {
    const userId = req.user.userId;
    try {
        const user = await prisma.clientes.findUnique({ where: { id: userId } });
        if (!user) {
            logger.warn('Tentativa de acesso a perfil inexistente', { userId, ip: req.ip });
            return res.status(404).json({ error: 'User not found' });
        }
        logger.info('Perfil acessado', { userId, email: user.email });
        res.json({ id: user.id, name: user.nome, email: user.email, phone: user.celular });
    } catch (error) {
        logger.error('Erro ao buscar perfil', { error: error.message, stack: error.stack, userId });
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    getProfile
};