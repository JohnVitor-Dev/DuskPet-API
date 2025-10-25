const prisma = require('../config/prisma');
const logger = require('../config/logger');

const getVeterinarios = async (req, res) => {
    const { especialidade } = req.query;

    try {
        const where = {};

        if (especialidade) {
            where.especialidades = {
                has: especialidade
            };
        }

        const veterinarios = await prisma.veterinarios.findMany({
            where,
            select: {
                id: true,
                nome: true,
                crmv: true,
                especialidades: true,
                horarios_trabalho: true
            },
            orderBy: { nome: 'asc' }
        });

        logger.info('Lista de veterinários acessada', { quantidade: veterinarios.length });
        res.json(veterinarios);
    } catch (error) {
        logger.error('Erro ao listar veterinários', { error: error.message, stack: error.stack });
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getVeterinarioById = async (req, res) => {
    const { id } = req.params;

    try {
        const veterinario = await prisma.veterinarios.findUnique({
            where: { id: parseInt(id) },
            select: {
                id: true,
                nome: true,
                crmv: true,
                especialidades: true,
                horarios_trabalho: true,
                created_at: true
            }
        });

        if (!veterinario) {
            logger.warn('Veterinário não encontrado', { veterinarioId: id });
            return res.status(404).json({ error: 'Veterinarian not found' });
        }

        logger.info('Detalhes do veterinário acessados', { veterinarioId: id });
        res.json(veterinario);
    } catch (error) {
        logger.error('Erro ao buscar veterinário', { error: error.message, stack: error.stack, veterinarioId: id });
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    getVeterinarios,
    getVeterinarioById
};
