const prisma = require('../config/prisma');
const logger = require('../config/logger');

const createAgendamento = async (req, res) => {
    const clienteId = req.user.userId;
    const { pet_id, veterinario_id, data_hora, tipo_consulta } = req.body;

    try {
        const pet = await prisma.pets.findUnique({
            where: { id: pet_id }
        });

        if (!pet) {
            logger.warn('Pet não encontrado para agendamento', { petId: pet_id, clienteId });
            return res.status(404).json({ error: 'Pet não encontrado' });
        }

        if (pet.cliente_id !== clienteId) {
            logger.warn('Tentativa de agendar para pet de outro cliente', { petId: pet_id, clienteId, ownerId: pet.cliente_id });
            return res.status(403).json({ error: 'Acesso negado' });
        }

        const veterinario = await prisma.veterinarios.findUnique({
            where: { id: veterinario_id }
        });

        if (!veterinario) {
            logger.warn('Veterinário não encontrado', { veterinarioId: veterinario_id, clienteId });
            return res.status(404).json({ error: 'Veterinário não encontrado' });
        }

        const dataHora = new Date(data_hora);
        const now = new Date();

        if (dataHora <= now) {
            logger.warn('Tentativa de agendar para data passada', { data_hora, clienteId });
            return res.status(400).json({ error: 'Não é possível agendar para datas passadas' });
        }

        const conflito = await prisma.agendamentos.findFirst({
            where: {
                veterinario_id,
                data_hora: dataHora
            }
        });

        if (conflito) {
            logger.warn('Conflito de horário no agendamento', { veterinarioId: veterinario_id, data_hora, clienteId });
            return res.status(409).json({ error: 'Horário já reservado' });
        }

        const novoAgendamento = await prisma.agendamentos.create({
            data: {
                cliente_id: clienteId,
                pet_id,
                veterinario_id,
                data_hora: dataHora,
                tipo_consulta: tipo_consulta || null,
                status: 'Agendado'
            },
            include: {
                pets: {
                    select: {
                        nome: true,
                        especie: true,
                        raca: true
                    }
                },
                veterinarios: {
                    select: {
                        nome: true,
                        crmv: true,
                        especialidades: true
                    }
                }
            }
        });

        logger.info('Agendamento criado', { agendamentoId: novoAgendamento.id, clienteId, veterinarioId: veterinario_id });
        res.status(201).json(novoAgendamento);
    } catch (error) {
        logger.error('Erro ao criar agendamento', { error: error.message, stack: error.stack, clienteId });
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

const getAgendamentos = async (req, res) => {
    const clienteId = req.user.userId;
    const { status, pet_id } = req.query;

    try {
        const where = { cliente_id: clienteId };

        if (status) {
            where.status = status;
        }

        if (pet_id) {
            where.pet_id = parseInt(pet_id);
        }

        const agendamentos = await prisma.agendamentos.findMany({
            where,
            include: {
                pets: {
                    select: {
                        nome: true,
                        especie: true,
                        raca: true
                    }
                },
                veterinarios: {
                    select: {
                        nome: true,
                        crmv: true,
                        especialidades: true
                    }
                }
            },
            orderBy: { data_hora: 'desc' }
        });

        logger.info('Lista de agendamentos acessada', { clienteId, quantidade: agendamentos.length });
        res.json(agendamentos);
    } catch (error) {
        logger.error('Erro ao listar agendamentos', { error: error.message, stack: error.stack, clienteId });
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

const getAgendamentoById = async (req, res) => {
    const clienteId = req.user.userId;
    const { id } = req.params;

    try {
        const agendamento = await prisma.agendamentos.findUnique({
            where: { id: parseInt(id) },
            include: {
                pets: {
                    select: {
                        nome: true,
                        especie: true,
                        raca: true,
                        sexo: true,
                        data_nascimento: true
                    }
                },
                veterinarios: {
                    select: {
                        nome: true,
                        cpf: true,
                        crmv: true,
                        especialidades: true
                    }
                },
                historicos_clinicos: true
            }
        });

        if (!agendamento) {
            logger.warn('Agendamento não encontrado', { agendamentoId: id, clienteId });
            return res.status(404).json({ error: 'Agendamento não encontrado' });
        }

        if (agendamento.cliente_id !== clienteId) {
            logger.warn('Tentativa de acesso não autorizado a agendamento', { agendamentoId: id, clienteId, ownerId: agendamento.cliente_id });
            return res.status(403).json({ error: 'Acesso negado' });
        }

        logger.info('Detalhes do agendamento acessados', { agendamentoId: id, clienteId });
        res.json(agendamento);
    } catch (error) {
        logger.error('Erro ao buscar agendamento', { error: error.message, stack: error.stack, agendamentoId: id, clienteId });
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

const updateAgendamento = async (req, res) => {
    const clienteId = req.user.userId;
    const { id } = req.params;
    const { data_hora, tipo_consulta, status } = req.body;

    try {
        const agendamento = await prisma.agendamentos.findUnique({
            where: { id: parseInt(id) }
        });

        if (!agendamento) {
            logger.warn('Agendamento não encontrado para atualização', { agendamentoId: id, clienteId });
            return res.status(404).json({ error: 'Agendamento não encontrado' });
        }

        if (agendamento.cliente_id !== clienteId) {
            logger.warn('Tentativa de atualização não autorizada de agendamento', { agendamentoId: id, clienteId, ownerId: agendamento.cliente_id });
            return res.status(403).json({ error: 'Acesso negado' });
        }

        if (agendamento.status === 'Concluído' || agendamento.status === 'Conclu_do') {
            logger.warn('Tentativa de atualizar agendamento concluído', { agendamentoId: id, clienteId });
            return res.status(400).json({ error: 'Não é possível atualizar agendamento concluído' });
        }

        const updateData = {};

        if (data_hora !== undefined) {
            const novaDataHora = new Date(data_hora);
            const now = new Date();

            if (novaDataHora <= now) {
                logger.warn('Tentativa de reagendar para data passada', { data_hora, clienteId });
                return res.status(400).json({ error: 'Não é possível agendar para datas passadas' });
            }

            const conflito = await prisma.agendamentos.findFirst({
                where: {
                    veterinario_id: agendamento.veterinario_id,
                    data_hora: novaDataHora,
                    NOT: { id: parseInt(id) }
                }
            });

            if (conflito) {
                logger.warn('Conflito de horário ao reagendar', { veterinarioId: agendamento.veterinario_id, data_hora, clienteId });
                return res.status(409).json({ error: 'Horário já reservado' });
            }

            updateData.data_hora = novaDataHora;
        }

        if (tipo_consulta !== undefined) updateData.tipo_consulta = tipo_consulta;
        if (status !== undefined) updateData.status = status;

        const agendamentoAtualizado = await prisma.agendamentos.update({
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
                veterinarios: {
                    select: {
                        nome: true,
                        crmv: true,
                        especialidades: true
                    }
                }
            }
        });

        logger.info('Agendamento atualizado', { agendamentoId: id, clienteId });
        res.json(agendamentoAtualizado);
    } catch (error) {
        logger.error('Erro ao atualizar agendamento', { error: error.message, stack: error.stack, agendamentoId: id, clienteId });
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

const cancelAgendamento = async (req, res) => {
    const clienteId = req.user.userId;
    const { id } = req.params;

    try {
        const agendamento = await prisma.agendamentos.findUnique({
            where: { id: parseInt(id) }
        });

        if (!agendamento) {
            logger.warn('Agendamento não encontrado para cancelamento', { agendamentoId: id, clienteId });
            return res.status(404).json({ error: 'Agendamento não encontrado' });
        }

        if (agendamento.cliente_id !== clienteId) {
            logger.warn('Tentativa de cancelamento não autorizado de agendamento', { agendamentoId: id, clienteId, ownerId: agendamento.cliente_id });
            return res.status(403).json({ error: 'Acesso negado' });
        }

        if (agendamento.status === 'Cancelado') {
            logger.warn('Tentativa de cancelar agendamento já cancelado', { agendamentoId: id, clienteId });
            return res.status(400).json({ error: 'Agendamento já cancelado' });
        }

        if (agendamento.status === 'Concluído' || agendamento.status === 'Conclu_do') {
            logger.warn('Tentativa de cancelar agendamento concluído', { agendamentoId: id, clienteId });
            return res.status(400).json({ error: 'Não é possível cancelar agendamento concluído' });
        }

        const agendamentoCancelado = await prisma.agendamentos.update({
            where: { id: parseInt(id) },
            data: { status: 'Cancelado' }
        });

        logger.info('Agendamento cancelado', { agendamentoId: id, clienteId });
        res.json({ message: 'Agendamento cancelado com sucesso', agendamento: agendamentoCancelado });
    } catch (error) {
        logger.error('Erro ao cancelar agendamento', { error: error.message, stack: error.stack, agendamentoId: id, clienteId });
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

const getHorariosDisponiveis = async (req, res) => {
    const { veterinario_id, data } = req.query;

    try {
        if (!veterinario_id || !data) {
            return res.status(400).json({ error: 'ID do veterinário e data são obrigatórios' });
        }

        const veterinario = await prisma.veterinarios.findUnique({
            where: { id: parseInt(veterinario_id) }
        });

        if (!veterinario) {
            return res.status(404).json({ error: 'Veterinário não encontrado' });
        }

        const dataConsulta = new Date(data);
        const inicioDia = new Date(dataConsulta.setHours(0, 0, 0, 0));
        const fimDia = new Date(dataConsulta.setHours(23, 59, 59, 999));

        const agendamentosOcupados = await prisma.agendamentos.findMany({
            where: {
                veterinario_id: parseInt(veterinario_id),
                data_hora: {
                    gte: inicioDia,
                    lte: fimDia
                },
                status: {
                    not: 'Cancelado'
                }
            },
            select: {
                data_hora: true
            }
        });

        const horariosOcupados = agendamentosOcupados.map(ag => ag.data_hora.getHours());
        const horariosDisponiveis = [];

        for (let hora = 8; hora <= 17; hora++) {
            if (!horariosOcupados.includes(hora)) {
                horariosDisponiveis.push(`${hora.toString().padStart(2, '0')}:00`);
            }
        }

        logger.info('Horários disponíveis consultados', { veterinarioId: veterinario_id, data });
        res.json({
            veterinario: {
                id: veterinario.id,
                nome: veterinario.nome,
                especialidades: veterinario.especialidades
            },
            data: data,
            horarios_disponiveis: horariosDisponiveis
        });
    } catch (error) {
        logger.error('Erro ao buscar horários disponíveis', { error: error.message, stack: error.stack });
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

module.exports = {
    createAgendamento,
    getAgendamentos,
    getAgendamentoById,
    updateAgendamento,
    cancelAgendamento,
    getHorariosDisponiveis
};
