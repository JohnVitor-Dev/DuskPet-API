const prisma = require('../config/prisma');
const logger = require('../config/logger');

const createPet = async (req, res) => {
    const clienteId = req.user.userId;
    const { nome, especie, raca, sexo, data_nascimento } = req.body;

    try {
        const imagemData = req.file ? {
            imagem: req.file.buffer,
            imagem_tipo: req.file.mimetype,
            imagem_nome: req.file.originalname
        } : {
            imagem: null,
            imagem_tipo: null,
            imagem_nome: null
        };

        const newPet = await prisma.pets.create({
            data: {
                cliente_id: clienteId,
                nome,
                especie,
                raca: raca || null,
                sexo: sexo || null,
                data_nascimento: data_nascimento ? new Date(data_nascimento) : null,
                ...imagemData
            }
        });

        const response = {
            id: newPet.id,
            nome: newPet.nome,
            especie: newPet.especie,
            raca: newPet.raca,
            sexo: newPet.sexo,
            data_nascimento: newPet.data_nascimento,
            tem_imagem: !!newPet.imagem,
            imagem_tipo: newPet.imagem_tipo,
            imagem_nome: newPet.imagem_nome
        };

        logger.info('Pet cadastrado', { petId: newPet.id, clienteId, nome });
        res.status(201).json(response);
    } catch (error) {
        logger.error('Erro ao cadastrar pet', { error: error.message, stack: error.stack, clienteId });
        res.status(500).json({ error: 'Erro interno do servidor' });
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
                imagem_tipo: true,
                imagem_nome: true,
                created_at: true,
                updated_at: true
            },
            orderBy: { created_at: 'desc' }
        });

        const petsResponse = pets.map(pet => ({
            ...pet,
            tem_imagem: !!pet.imagem_tipo
        }));

        logger.info('Lista de pets acessada', { clienteId, quantidade: pets.length });
        res.json(petsResponse);
    } catch (error) {
        logger.error('Erro ao listar pets', { error: error.message, stack: error.stack, clienteId });
        res.status(500).json({ error: 'Erro interno do servidor' });
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
            return res.status(404).json({ error: 'Pet não encontrado' });
        }

        if (pet.cliente_id !== clienteId) {
            logger.warn('Tentativa de acesso não autorizado a pet', { petId: id, clienteId, ownerId: pet.cliente_id });
            return res.status(403).json({ error: 'Acesso negado' });
        }

        const { imagem, ...petResponse } = pet;
        petResponse.tem_imagem = !!pet.imagem;

        logger.info('Detalhes do pet acessados', { petId: id, clienteId });
        res.json(petResponse);
    } catch (error) {
        logger.error('Erro ao buscar pet', { error: error.message, stack: error.stack, petId: id, clienteId });
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

const updatePet = async (req, res) => {
    const clienteId = req.user.userId;
    const { id } = req.params;
    const { nome, especie, raca, sexo, data_nascimento } = req.body;

    try {
        const pet = await prisma.pets.findUnique({
            where: { id: parseInt(id) }
        });

        if (!pet) {
            logger.warn('Pet não encontrado para atualização', { petId: id, clienteId });
            return res.status(404).json({ error: 'Pet não encontrado' });
        }

        if (pet.cliente_id !== clienteId) {
            logger.warn('Tentativa de atualização não autorizada de pet', { petId: id, clienteId, ownerId: pet.cliente_id });
            return res.status(403).json({ error: 'Acesso negado' });
        }

        const updateData = {};
        if (nome !== undefined) updateData.nome = nome;
        if (especie !== undefined) updateData.especie = especie;
        if (raca !== undefined) updateData.raca = raca;
        if (sexo !== undefined) updateData.sexo = sexo;
        if (data_nascimento !== undefined) updateData.data_nascimento = data_nascimento ? new Date(data_nascimento) : null;

        if (req.file) {
            updateData.imagem = req.file.buffer;
            updateData.imagem_tipo = req.file.mimetype;
            updateData.imagem_nome = req.file.originalname;
        }

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
                imagem_tipo: true,
                imagem_nome: true,
                updated_at: true
            }
        });

        const response = {
            ...updatedPet,
            tem_imagem: !!updatedPet.imagem_tipo
        };

        logger.info('Pet atualizado', { petId: id, clienteId });
        res.json(response);
    } catch (error) {
        logger.error('Erro ao atualizar pet', { error: error.message, stack: error.stack, petId: id, clienteId });
        res.status(500).json({ error: 'Erro interno do servidor' });
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
            return res.status(404).json({ error: 'Pet não encontrado' });
        }

        if (pet.cliente_id !== clienteId) {
            logger.warn('Tentativa de exclusão não autorizada de pet', { petId: id, clienteId, ownerId: pet.cliente_id });
            return res.status(403).json({ error: 'Acesso negado' });
        }

        await prisma.pets.delete({
            where: { id: parseInt(id) }
        });

        logger.info('Pet excluído', { petId: id, clienteId, nome: pet.nome });
        res.json({ message: 'Pet excluído com sucesso' });
    } catch (error) {
        logger.error('Erro ao excluir pet', { error: error.message, stack: error.stack, petId: id, clienteId });
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

const getPetImage = async (req, res) => {
    const clienteId = req.user.userId;
    const { id } = req.params;

    try {
        const pet = await prisma.pets.findUnique({
            where: { id: parseInt(id) },
            select: {
                cliente_id: true,
                imagem: true,
                imagem_tipo: true,
                imagem_nome: true
            }
        });

        if (!pet) {
            logger.warn('Pet não encontrado', { petId: id, clienteId });
            return res.status(404).json({ error: 'Pet não encontrado' });
        }

        if (pet.cliente_id !== clienteId) {
            logger.warn('Tentativa de acesso não autorizado à imagem do pet', { petId: id, clienteId, ownerId: pet.cliente_id });
            return res.status(403).json({ error: 'Acesso negado' });
        }

        if (!pet.imagem) {
            return res.status(404).json({ error: 'Este pet não possui imagem' });
        }

        res.set('Content-Type', pet.imagem_tipo);
        res.set('Content-Disposition', `inline; filename="${pet.imagem_nome}"`);
        res.send(pet.imagem);

        logger.info('Imagem do pet acessada', { petId: id, clienteId });
    } catch (error) {
        logger.error('Erro ao buscar imagem do pet', { error: error.message, stack: error.stack, petId: id, clienteId });
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

module.exports = {
    createPet,
    getPets,
    getPetById,
    updatePet,
    deletePet,
    getPetImage
};
