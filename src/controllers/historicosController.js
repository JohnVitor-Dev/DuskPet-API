const prisma = require('../config/prisma');
const logger = require('../config/logger');

const createHistorico = async (req, res) => {
    const clienteId = req.user.userId;
    const { pet_id, agendamento_id, vacinas, doencas_alergias, medicamentos, observacoes } = req.body;

    try {
        const pet = await prisma.pets.findUnique({
            where: { id: pet_id }
        });

        if (!pet) {
            logger.warn('Pet não encontrado para histórico', { petId: pet_id, clienteId });
            return res.status(404).json({ error: 'Pet não encontrado' });
        }

        if (pet.cliente_id !== clienteId) {
            logger.warn('Tentativa de criar histórico para pet de outro cliente', { petId: pet_id, clienteId, ownerId: pet.cliente_id });
            return res.status(403).json({ error: 'Acesso negado' });
        }

        if (agendamento_id) {
            const agendamento = await prisma.agendamentos.findUnique({
                where: { id: agendamento_id }
            });

            if (!agendamento) {
                logger.warn('Agendamento não encontrado', { agendamentoId: agendamento_id, clienteId });
                return res.status(404).json({ error: 'Agendamento não encontrado' });
            }

            if (agendamento.pet_id !== pet_id) {
                logger.warn('Agendamento não pertence ao pet', { agendamentoId: agendamento_id, petId: pet_id, clienteId });
                return res.status(400).json({ error: 'Agendamento não pertence a este pet' });
            }
        }

        const novoHistorico = await prisma.historicos_clinicos.create({
            data: {
                pet_id,
                agendamento_id: agendamento_id || null,
                vacinas: vacinas || null,
                doencas_alergias: doencas_alergias || null,
                medicamentos: medicamentos || null,
                observacoes: observacoes || null
            },
            include: {
                pets: {
                    select: {
                        nome: true,
                        especie: true,
                        raca: true
                    }
                },
                agendamentos: {
                    select: {
                        data_hora: true,
                        tipo_consulta: true,
                        veterinarios: {
                            select: {
                                nome: true,
                                crmv: true
                            }
                        }
                    }
                }
            }
        });

        logger.info('Histórico clínico criado', { historicoId: novoHistorico.id, petId: pet_id, clienteId });
        res.status(201).json(novoHistorico);
    } catch (error) {
        logger.error('Erro ao criar histórico clínico', { error: error.message, stack: error.stack, clienteId });
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

const getHistoricosByPet = async (req, res) => {
    const clienteId = req.user.userId;
    const { pet_id } = req.params;

    try {
        const pet = await prisma.pets.findUnique({
            where: { id: parseInt(pet_id) }
        });

        if (!pet) {
            logger.warn('Pet não encontrado', { petId: pet_id, clienteId });
            return res.status(404).json({ error: 'Pet não encontrado' });
        }

        if (pet.cliente_id !== clienteId) {
            logger.warn('Tentativa de acesso não autorizado aos históricos do pet', { petId: pet_id, clienteId, ownerId: pet.cliente_id });
            return res.status(403).json({ error: 'Acesso negado' });
        }

        const historicos = await prisma.historicos_clinicos.findMany({
            where: { pet_id: parseInt(pet_id) },
            include: {
                agendamentos: {
                    select: {
                        data_hora: true,
                        tipo_consulta: true,
                        veterinarios: {
                            select: {
                                nome: true,
                                crmv: true,
                                especialidades: true
                            }
                        }
                    }
                }
            },
            orderBy: { created_at: 'desc' }
        });

        logger.info('Históricos do pet acessados', { petId: pet_id, clienteId, quantidade: historicos.length });
        res.json(historicos);
    } catch (error) {
        logger.error('Erro ao listar históricos', { error: error.message, stack: error.stack, petId: pet_id, clienteId });
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

const getHistoricoById = async (req, res) => {
    const clienteId = req.user.userId;
    const { id } = req.params;

    try {
        const historico = await prisma.historicos_clinicos.findUnique({
            where: { id: parseInt(id) },
            include: {
                pets: {
                    select: {
                        id: true,
                        nome: true,
                        especie: true,
                        raca: true,
                        sexo: true,
                        data_nascimento: true,
                        cliente_id: true
                    }
                },
                agendamentos: {
                    select: {
                        data_hora: true,
                        tipo_consulta: true,
                        status: true,
                        veterinarios: {
                            select: {
                                nome: true,
                                cpf: true,
                                crmv: true,
                                especialidades: true
                            }
                        }
                    }
                }
            }
        });

        if (!historico) {
            logger.warn('Histórico não encontrado', { historicoId: id, clienteId });
            return res.status(404).json({ error: 'Histórico médico não encontrado' });
        }

        if (historico.pets.cliente_id !== clienteId) {
            logger.warn('Tentativa de acesso não autorizado ao histórico', { historicoId: id, clienteId, ownerId: historico.pets.cliente_id });
            return res.status(403).json({ error: 'Acesso negado' });
        }

        logger.info('Detalhes do histórico acessados', { historicoId: id, clienteId });
        res.json(historico);
    } catch (error) {
        logger.error('Erro ao buscar histórico', { error: error.message, stack: error.stack, historicoId: id, clienteId });
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

const updateHistorico = async (req, res) => {
    const clienteId = req.user.userId;
    const { id } = req.params;
    const { vacinas, doencas_alergias, medicamentos, observacoes } = req.body;

    try {
        const historico = await prisma.historicos_clinicos.findUnique({
            where: { id: parseInt(id) },
            include: {
                pets: {
                    select: {
                        cliente_id: true
                    }
                }
            }
        });

        if (!historico) {
            logger.warn('Histórico não encontrado para atualização', { historicoId: id, clienteId });
            return res.status(404).json({ error: 'Histórico médico não encontrado' });
        }

        if (historico.pets.cliente_id !== clienteId) {
            logger.warn('Tentativa de atualização não autorizada de histórico', { historicoId: id, clienteId, ownerId: historico.pets.cliente_id });
            return res.status(403).json({ error: 'Acesso negado' });
        }

        const updateData = {};
        if (vacinas !== undefined) updateData.vacinas = vacinas;
        if (doencas_alergias !== undefined) updateData.doencas_alergias = doencas_alergias;
        if (medicamentos !== undefined) updateData.medicamentos = medicamentos;
        if (observacoes !== undefined) updateData.observacoes = observacoes;

        const historicoAtualizado = await prisma.historicos_clinicos.update({
            where: { id: parseInt(id) },
            data: updateData,
            include: {
                pets: {
                    select: {
                        nome: true,
                        especie: true,
                        raca: true
                    }
                },
                agendamentos: {
                    select: {
                        data_hora: true,
                        tipo_consulta: true,
                        veterinarios: {
                            select: {
                                nome: true,
                                crmv: true
                            }
                        }
                    }
                }
            }
        });

        logger.info('Histórico atualizado', { historicoId: id, clienteId });
        res.json(historicoAtualizado);
    } catch (error) {
        logger.error('Erro ao atualizar histórico', { error: error.message, stack: error.stack, historicoId: id, clienteId });
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

const deleteHistorico = async (req, res) => {
    const clienteId = req.user.userId;
    const { id } = req.params;

    try {
        const historico = await prisma.historicos_clinicos.findUnique({
            where: { id: parseInt(id) },
            include: {
                pets: {
                    select: {
                        cliente_id: true
                    }
                }
            }
        });

        if (!historico) {
            logger.warn('Histórico não encontrado para exclusão', { historicoId: id, clienteId });
            return res.status(404).json({ error: 'Histórico médico não encontrado' });
        }

        if (historico.pets.cliente_id !== clienteId) {
            logger.warn('Tentativa de exclusão não autorizada de histórico', { historicoId: id, clienteId, ownerId: historico.pets.cliente_id });
            return res.status(403).json({ error: 'Acesso negado' });
        }

        await prisma.historicos_clinicos.delete({
            where: { id: parseInt(id) }
        });

        logger.info('Histórico excluído', { historicoId: id, clienteId });
        res.json({ message: 'Histórico médico excluído com sucesso' });
    } catch (error) {
        logger.error('Erro ao excluir histórico', { error: error.message, stack: error.stack, historicoId: id, clienteId });
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

const getHistoricoCompleto = async (req, res) => {
    const clienteId = req.user.userId;
    const { pet_id } = req.params;

    try {
        const pet = await prisma.pets.findUnique({
            where: { id: parseInt(pet_id) },
            include: {
                historicos_clinicos: {
                    include: {
                        agendamentos: {
                            select: {
                                data_hora: true,
                                tipo_consulta: true,
                                status: true,
                                veterinarios: {
                                    select: {
                                        nome: true,
                                        crmv: true,
                                        especialidades: true
                                    }
                                }
                            }
                        }
                    },
                    orderBy: { created_at: 'desc' }
                },
                agendamentos: {
                    include: {
                        veterinarios: {
                            select: {
                                nome: true,
                                crmv: true,
                                especialidades: true
                            }
                        }
                    },
                    orderBy: { data_hora: 'desc' },
                    take: 10
                }
            }
        });

        if (!pet) {
            logger.warn('Pet não encontrado', { petId: pet_id, clienteId });
            return res.status(404).json({ error: 'Pet não encontrado' });
        }

        if (pet.cliente_id !== clienteId) {
            logger.warn('Tentativa de acesso não autorizado ao histórico completo', { petId: pet_id, clienteId, ownerId: pet.cliente_id });
            return res.status(403).json({ error: 'Acesso negado' });
        }

        logger.info('Histórico completo do pet acessado', { petId: pet_id, clienteId });
        res.json({
            pet: {
                id: pet.id,
                nome: pet.nome,
                especie: pet.especie,
                raca: pet.raca,
                sexo: pet.sexo,
                data_nascimento: pet.data_nascimento,
                imagem_url: pet.imagem_url
            },
            historicos_clinicos: pet.historicos_clinicos,
            agendamentos_recentes: pet.agendamentos
        });
    } catch (error) {
        logger.error('Erro ao buscar histórico completo', { error: error.message, stack: error.stack, petId: pet_id, clienteId });
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

module.exports = {
    createHistorico,
    getHistoricosByPet,
    getHistoricoById,
    updateHistorico,
    deleteHistorico,
    getHistoricoCompleto
};
