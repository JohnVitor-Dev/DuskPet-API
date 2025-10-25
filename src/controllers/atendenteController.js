const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const logger = require('../config/logger');

const loginAtendente = async (req, res) => {
    try {
        const { email, senha } = req.body;

        const atendente = await prisma.atendentes.findUnique({
            where: { email }
        });

        if (!atendente) {
            return res.status(401).json({ message: 'Credenciais inválidas' });
        }

        const senhaValida = await bcrypt.compare(senha, atendente.senha_hash);

        if (!senhaValida) {
            return res.status(401).json({ message: 'Credenciais inválidas' });
        }

        const token = jwt.sign(
            { id: atendente.id, tipo: 'atendente' },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '8h' }
        ); logger.info(`Atendente ${atendente.email} realizou login`);

        res.json({
            token,
            atendente: {
                id: atendente.id,
                nome: atendente.nome,
                email: atendente.email
            }
        });
    } catch (error) {
        logger.error(`Erro ao fazer login atendente: ${error.message}`);
        res.status(500).json({ message: 'Erro ao realizar login' });
    }
};

const getAgendamentos = async (req, res) => {
    try {
        const { data, status, veterinario_id } = req.query;

        const filtros = {};

        if (data) {
            const dataInicio = new Date(data);
            const dataFim = new Date(data);
            dataFim.setHours(23, 59, 59, 999);

            filtros.data_hora = {
                gte: dataInicio,
                lte: dataFim
            };
        }

        if (status) {
            filtros.status = status;
        }

        if (veterinario_id) {
            filtros.veterinario_id = parseInt(veterinario_id);
        }

        const agendamentos = await prisma.agendamentos.findMany({
            where: filtros,
            include: {
                clientes: {
                    select: {
                        id: true,
                        nome: true,
                        celular: true,
                        email: true
                    }
                },
                pets: {
                    select: {
                        id: true,
                        nome: true,
                        especie: true,
                        raca: true
                    }
                },
                veterinarios: {
                    select: {
                        id: true,
                        nome: true,
                        especialidades: true
                    }
                }
            },
            orderBy: {
                data_hora: 'asc'
            }
        });

        res.json(agendamentos);
    } catch (error) {
        logger.error(`Erro ao buscar agendamentos: ${error.message}`);
        res.status(500).json({ message: 'Erro ao buscar agendamentos' });
    }
};

const updateAgendamentoStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const agendamento = await prisma.agendamentos.findUnique({
            where: { id: parseInt(id) }
        });

        if (!agendamento) {
            return res.status(404).json({ message: 'Agendamento não encontrado' });
        }

        const agendamentoAtualizado = await prisma.agendamentos.update({
            where: { id: parseInt(id) },
            data: { status }
        });

        logger.info(`Agendamento ${id} atualizado para status: ${status}`);
        res.json(agendamentoAtualizado);
    } catch (error) {
        logger.error(`Erro ao atualizar status do agendamento: ${error.message}`);
        res.status(500).json({ message: 'Erro ao atualizar status do agendamento' });
    }
};

const getClientes = async (req, res) => {
    try {
        const { busca } = req.query;

        const filtros = {};

        if (busca) {
            filtros.OR = [
                { nome: { contains: busca, mode: 'insensitive' } },
                { email: { contains: busca, mode: 'insensitive' } },
                { celular: { contains: busca } }
            ];
        }

        const clientes = await prisma.clientes.findMany({
            where: filtros,
            select: {
                id: true,
                nome: true,
                celular: true,
                email: true,
                cpf: true,
                created_at: true,
                _count: {
                    select: {
                        pets: true,
                        agendamentos: true
                    }
                }
            },
            orderBy: {
                nome: 'asc'
            }
        });

        res.json(clientes);
    } catch (error) {
        logger.error(`Erro ao buscar clientes: ${error.message}`);
        res.status(500).json({ message: 'Erro ao buscar clientes' });
    }
};

const getClienteDetalhes = async (req, res) => {
    try {
        const { id } = req.params;

        const cliente = await prisma.clientes.findUnique({
            where: { id: parseInt(id) },
            select: {
                id: true,
                nome: true,
                celular: true,
                email: true,
                cpf: true,
                data_nascimento: true,
                rua: true,
                numero: true,
                complemento: true,
                cep: true,
                bairro: true,
                cidade: true,
                estado: true,
                created_at: true,
                pets: true,
                agendamentos: {
                    include: {
                        pets: true,
                        veterinarios: true
                    },
                    orderBy: {
                        data_hora: 'desc'
                    }
                }
            }
        });

        if (!cliente) {
            return res.status(404).json({ message: 'Cliente não encontrado' });
        }

        res.json(cliente);
    } catch (error) {
        logger.error(`Erro ao buscar detalhes do cliente: ${error.message}`);
        res.status(500).json({ message: 'Erro ao buscar detalhes do cliente' });
    }
};

const getProdutos = async (req, res) => {
    try {
        const { estoque_baixo, vencendo } = req.query;

        const filtros = {};

        if (estoque_baixo === 'true') {
            filtros.quantidade = { lt: 10 };
        }

        if (vencendo === 'true') {
            const dataLimite = new Date();
            dataLimite.setDate(dataLimite.getDate() + 30);

            filtros.validade = {
                lte: dataLimite,
                gte: new Date()
            };
        }

        const produtos = await prisma.produtos_estoque.findMany({
            where: filtros,
            orderBy: {
                nome_produto: 'asc'
            }
        });

        res.json(produtos);
    } catch (error) {
        logger.error(`Erro ao buscar produtos: ${error.message}`);
        res.status(500).json({ message: 'Erro ao buscar produtos' });
    }
};

const getVeterinarios = async (req, res) => {
    try {
        const veterinarios = await prisma.veterinarios.findMany({
            select: {
                id: true,
                nome: true,
                crmv: true,
                especialidades: true,
                horarios_trabalho: true
            },
            orderBy: {
                nome: 'asc'
            }
        });

        res.json(veterinarios);
    } catch (error) {
        logger.error(`Erro ao buscar veterinários: ${error.message}`);
        res.status(500).json({ message: 'Erro ao buscar veterinários' });
    }
};

module.exports = {
    loginAtendente,
    getAgendamentos,
    updateAgendamentoStatus,
    getClientes,
    getClienteDetalhes,
    getProdutos,
    getVeterinarios
};
