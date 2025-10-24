const { PrismaClient } = require('@prisma/client');
const logger = require('../config/logger');

const prisma = new PrismaClient();

const createPet = async (req, res) => {
    const clienteId = req.user.userId;
    const { nome, especie, raca, sexo, data_nascimento, imagem_url } = req.body;

    try {
        const newPet = await prisma.pets.create({
            data: {
                cliente_id: clienteId,
                nome,
                especie,
                raca: raca || null,
                sexo: sexo || null,
                data_nascimento: data_nascimento ? new Date(data_nascimento) : null,
                imagem_url: imagem_url || null
            }
        });

        logger.info('Pet cadastrado', { petId: newPet.id, clienteId, nome });
        res.status(201).json({
            id: newPet.id,
            nome: newPet.nome,
            especie: newPet.especie,
            raca: newPet.raca,
            sexo: newPet.sexo,
            data_nascimento: newPet.data_nascimento,
            imagem_url: newPet.imagem_url
        });
    } catch (error) {
        logger.error('Erro ao cadastrar pet', { error: error.message, stack: error.stack, clienteId });
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getPets = async (req, res) => {
    const clienteId = req.user.userId;

    try {
        const pets = await prisma.pets.findMany({
            where: { cliente_id: clienteId },
            select: {
                id: true,
                nome: true,
                especie: true,
                raca: true,
                sexo: true,
                data_nascimento: true,
                imagem_url: true,
                created_at: true,
                updated_at: true
            },
            orderBy: { created_at: 'desc' }
        });

        logger.info('Lista de pets acessada', { clienteId, quantidade: pets.length });
        res.json(pets);
    } catch (error) {
        logger.error('Erro ao listar pets', { error: error.message, stack: error.stack, clienteId });
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getPetById = async (req, res) => {
    const clienteId = req.user.userId;
    const { id } = req.params;

    try {
        const pet = await prisma.pets.findUnique({
            where: { id: parseInt(id) },
            include: {
                historicos_clinicos: {
                    orderBy: { created_at: 'desc' },
                    take: 5
                },
                agendamentos: {
                    orderBy: { data_hora: 'desc' },
                    take: 5,
                    include: {
                        veterinarios: {
                            select: {
                                nome: true,
                                crmv: true,
                                especialidades: true
                            }
                        }
                    }
                }
            }
        });

        if (!pet) {
            logger.warn('Pet não encontrado', { petId: id, clienteId });
            return res.status(404).json({ error: 'Pet not found' });
        }

        if (pet.cliente_id !== clienteId) {
            logger.warn('Tentativa de acesso não autorizado a pet', { petId: id, clienteId, ownerId: pet.cliente_id });
            return res.status(403).json({ error: 'Access denied' });
        }

        logger.info('Detalhes do pet acessados', { petId: id, clienteId });
        res.json(pet);
    } catch (error) {
        logger.error('Erro ao buscar pet', { error: error.message, stack: error.stack, petId: id, clienteId });
        res.status(500).json({ error: 'Internal server error' });
    }
};

const updatePet = async (req, res) => {
    const clienteId = req.user.userId;
    const { id } = req.params;
    const { nome, especie, raca, sexo, data_nascimento, imagem_url } = req.body;

    try {
        const pet = await prisma.pets.findUnique({
            where: { id: parseInt(id) }
        });

        if (!pet) {
            logger.warn('Pet não encontrado para atualização', { petId: id, clienteId });
            return res.status(404).json({ error: 'Pet not found' });
        }

        if (pet.cliente_id !== clienteId) {
            logger.warn('Tentativa de atualização não autorizada de pet', { petId: id, clienteId, ownerId: pet.cliente_id });
            return res.status(403).json({ error: 'Access denied' });
        }

        const updateData = {};
        if (nome !== undefined) updateData.nome = nome;
        if (especie !== undefined) updateData.especie = especie;
        if (raca !== undefined) updateData.raca = raca;
        if (sexo !== undefined) updateData.sexo = sexo;
        if (data_nascimento !== undefined) updateData.data_nascimento = data_nascimento ? new Date(data_nascimento) : null;
        if (imagem_url !== undefined) updateData.imagem_url = imagem_url;
        updateData.updated_at = new Date();

        const updatedPet = await prisma.pets.update({
            where: { id: parseInt(id) },
            data: updateData,
            select: {
                id: true,
                nome: true,
                especie: true,
                raca: true,
                sexo: true,
                data_nascimento: true,
                imagem_url: true,
                updated_at: true
            }
        });

        logger.info('Pet atualizado', { petId: id, clienteId });
        res.json(updatedPet);
    } catch (error) {
        logger.error('Erro ao atualizar pet', { error: error.message, stack: error.stack, petId: id, clienteId });
        res.status(500).json({ error: 'Internal server error' });
    }
};

const deletePet = async (req, res) => {
    const clienteId = req.user.userId;
    const { id } = req.params;

    try {
        const pet = await prisma.pets.findUnique({
            where: { id: parseInt(id) }
        });

        if (!pet) {
            logger.warn('Pet não encontrado para exclusão', { petId: id, clienteId });
            return res.status(404).json({ error: 'Pet not found' });
        }

        if (pet.cliente_id !== clienteId) {
            logger.warn('Tentativa de exclusão não autorizada de pet', { petId: id, clienteId, ownerId: pet.cliente_id });
            return res.status(403).json({ error: 'Access denied' });
        }

        await prisma.pets.delete({
            where: { id: parseInt(id) }
        });

        logger.info('Pet excluído', { petId: id, clienteId, nome: pet.nome });
        res.json({ message: 'Pet deleted successfully' });
    } catch (error) {
        logger.error('Erro ao excluir pet', { error: error.message, stack: error.stack, petId: id, clienteId });
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    createPet,
    getPets,
    getPetById,
    updatePet,
    deletePet
};
