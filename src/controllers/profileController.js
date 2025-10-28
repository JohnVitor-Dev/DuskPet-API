const prisma = require('../config/prisma');
const logger = require('../config/logger');
const bcrypt = require('bcryptjs');

const getProfile = async (req, res) => {
    const userId = req.user.userId;
    try {
        const user = await prisma.clientes.findUnique({ where: { id: userId } });
        if (!user) {
            logger.warn('Tentativa de acesso a perfil inexistente', { userId, ip: req.ip });
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        logger.info('Perfil acessado', { userId, email: user.email });
        res.json({ id: user.id, name: user.nome, email: user.email, phone: user.celular, created_at: user.created_at });
    } catch (error) {
        logger.error('Erro ao buscar perfil', { error: error.message, stack: error.stack, userId });
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

const updateProfile = async (req, res) => {
    const userId = req.user.userId;
    const { name, email, phone, password } = req.body;

    try {
        const user = await prisma.clientes.findUnique({ where: { id: userId } });
        if (!user) {
            logger.warn('Tentativa de atualização de perfil inexistente', { userId, ip: req.ip });
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        const updateData = {};
        if (name !== undefined) updateData.nome = name;
        if (email !== undefined) updateData.email = email;
        if (phone !== undefined) updateData.celular = phone;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(password, salt);
            updateData.senha_hash = hash;
        }
        updateData.updated_at = new Date();

        const updated = await prisma.clientes.update({
            where: { id: userId },
            data: updateData,
            select: { id: true, nome: true, email: true, celular: true, created_at: true }
        });

        logger.info('Perfil atualizado', { userId, email: updated.email });
        res.json({ id: updated.id, name: updated.nome, email: updated.email, phone: updated.celular, created_at: updated.created_at });
    } catch (error) {
        // Prisma unique constraint violation
        if (error.code === 'P2002') {
            const target = (error.meta && error.meta.target) ? error.meta.target.join(',') : 'campo único';
            logger.warn('Violação de unicidade ao atualizar perfil', { userId, target });
            return res.status(409).json({ error: `Valor já utilizado para ${target}` });
        }
        logger.error('Erro ao atualizar perfil', { error: error.message, stack: error.stack, userId });
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

module.exports = {
    getProfile,
    updateProfile
};