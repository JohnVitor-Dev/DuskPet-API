const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const logger = require('../config/logger');

const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const admin = await prisma.administradores.findUnique({
            where: { email }
        });

        if (!admin) {
            return res.status(401).json({ message: 'Credenciais inválidas' });
        }

        const senhaValida = await bcrypt.compare(password, admin.senha_hash);

        if (!senhaValida) {
            return res.status(401).json({ message: 'Credenciais inválidas' });
        }

        const token = jwt.sign(
            { id: admin.id, tipo: 'admin' },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '8h' }
        );

        logger.info(`Admin ${admin.email} realizou login`);

        res.json({
            token,
            user: {
                name: admin.nome,
                email: admin.email,
                id: admin.id
            }
        });
    } catch (error) {
        logger.error(`Erro ao fazer login admin: ${error.message}`);
        res.status(500).json({ message: 'Erro ao realizar login' });
    }
};

const createVeterinario = async (req, res) => {
    try {
        const { nome, cpf, crmv, especialidades, horarios_trabalho } = req.body;

        const cpfExistente = await prisma.veterinarios.findUnique({
            where: { cpf }
        });

        if (cpfExistente) {
            return res.status(400).json({ message: 'CPF já cadastrado' });
        }

        const crmvExistente = await prisma.veterinarios.findUnique({
            where: { crmv }
        });

        if (crmvExistente) {
            return res.status(400).json({ message: 'CRMV já cadastrado' });
        }

        const veterinario = await prisma.veterinarios.create({
            data: {
                nome,
                cpf,
                crmv,
                especialidades,
                horarios_trabalho
            }
        });

        logger.info(`Veterinário criado: ${veterinario.nome}`);
        res.status(201).json(veterinario);
    } catch (error) {
        logger.error(`Erro ao criar veterinário: ${error.message}`);
        res.status(500).json({ message: 'Erro ao criar veterinário' });
    }
};

const getVeterinarios = async (req, res) => {
    try {
        const veterinarios = await prisma.veterinarios.findMany({
            include: {
                _count: {
                    select: { agendamentos: true }
                }
            }
        });

        res.json(veterinarios);
    } catch (error) {
        logger.error(`Erro ao buscar veterinários: ${error.message}`);
        res.status(500).json({ message: 'Erro ao buscar veterinários' });
    }
};

const updateVeterinario = async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, cpf, crmv, especialidades, horarios_trabalho } = req.body;

        const veterinario = await prisma.veterinarios.findUnique({
            where: { id: parseInt(id) }
        });

        if (!veterinario) {
            return res.status(404).json({ message: 'Veterinário não encontrado' });
        }

        if (cpf && cpf !== veterinario.cpf) {
            const cpfExistente = await prisma.veterinarios.findUnique({
                where: { cpf }
            });
            if (cpfExistente) {
                return res.status(400).json({ message: 'CPF já cadastrado' });
            }
        }

        if (crmv && crmv !== veterinario.crmv) {
            const crmvExistente = await prisma.veterinarios.findUnique({
                where: { crmv }
            });
            if (crmvExistente) {
                return res.status(400).json({ message: 'CRMV já cadastrado' });
            }
        }

        const veterinarioAtualizado = await prisma.veterinarios.update({
            where: { id: parseInt(id) },
            data: {
                nome,
                cpf,
                crmv,
                especialidades,
                horarios_trabalho
            }
        });

        logger.info(`Veterinário atualizado: ${veterinarioAtualizado.nome}`);
        res.json(veterinarioAtualizado);
    } catch (error) {
        logger.error(`Erro ao atualizar veterinário: ${error.message}`);
        res.status(500).json({ message: 'Erro ao atualizar veterinário' });
    }
};

const deleteVeterinario = async (req, res) => {
    try {
        const { id } = req.params;

        const veterinario = await prisma.veterinarios.findUnique({
            where: { id: parseInt(id) },
            include: {
                _count: {
                    select: { agendamentos: true }
                }
            }
        });

        if (!veterinario) {
            return res.status(404).json({ message: 'Veterinário não encontrado' });
        }

        if (veterinario._count.agendamentos > 0) {
            return res.status(400).json({
                message: 'Não é possível excluir veterinário com agendamentos vinculados'
            });
        }

        await prisma.veterinarios.delete({
            where: { id: parseInt(id) }
        });

        logger.info(`Veterinário excluído: ${veterinario.nome}`);
        res.json({ message: 'Veterinário excluído com sucesso' });
    } catch (error) {
        logger.error(`Erro ao excluir veterinário: ${error.message}`);
        res.status(500).json({ message: 'Erro ao excluir veterinário' });
    }
};

const getDashboard = async (req, res) => {
    try {
        const [
            totalClientes,
            totalPets,
            totalAgendamentos,
            agendamentosHoje,
            totalVeterinarios,
            totalProdutos,
            produtosEstoqueBaixo
        ] = await Promise.all([
            prisma.clientes.count(),
            prisma.pets.count(),
            prisma.agendamentos.count(),
            prisma.agendamentos.count({
                where: {
                    data_hora: {
                        gte: new Date(new Date().setHours(0, 0, 0, 0)),
                        lt: new Date(new Date().setHours(23, 59, 59, 999))
                    }
                }
            }),
            prisma.veterinarios.count(),
            prisma.produtos_estoque.count(),
            prisma.produtos_estoque.count({
                where: {
                    quantidade: {
                        lt: 10
                    }
                }
            })
        ]);

        const agendamentosPorStatus = await prisma.agendamentos.groupBy({
            by: ['status'],
            _count: true
        });

        res.json({
            totalClientes,
            totalPets,
            totalAgendamentos,
            agendamentosHoje,
            totalVeterinarios,
            totalProdutos,
            produtosEstoqueBaixo,
            agendamentosPorStatus
        });
    } catch (error) {
        logger.error(`Erro ao buscar dashboard: ${error.message}`);
        res.status(500).json({ message: 'Erro ao buscar dados do dashboard' });
    }
};

const getClientes = async (req, res) => {
    try {
        const clientes = await prisma.clientes.findMany({
            include: {
                _count: {
                    select: {
                        pets: true,
                        agendamentos: true
                    }
                }
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        const clientesSemSenha = clientes.map(({ senha_hash, ...cliente }) => cliente);

        res.json(clientesSemSenha);
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
            include: {
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

        const { senha_hash, ...clienteSemSenha } = cliente;

        res.json(clienteSemSenha);
    } catch (error) {
        logger.error(`Erro ao buscar detalhes do cliente: ${error.message}`);
        res.status(500).json({ message: 'Erro ao buscar detalhes do cliente' });
    }
};

const getRelatorioGeral = async (req, res) => {
    try {
        const { dataInicio, dataFim } = req.query;

        const filtroData = {};
        if (dataInicio && dataFim) {
            filtroData.created_at = {
                gte: new Date(dataInicio),
                lte: new Date(dataFim)
            };
        }

        const [
            novosClientes,
            novosPets,
            agendamentosRealizados,
            vendasProdutos
        ] = await Promise.all([
            prisma.clientes.count({ where: filtroData }),
            prisma.pets.count({ where: filtroData }),
            prisma.agendamentos.count({
                where: {
                    ...filtroData,
                    status: 'Conclu_do'
                }
            }),
            prisma.produtos_estoque.aggregate({
                _sum: {
                    valor: true
                }
            })
        ]);

        const topVeterinarios = await prisma.veterinarios.findMany({
            include: {
                _count: {
                    select: { agendamentos: true }
                }
            },
            orderBy: {
                agendamentos: {
                    _count: 'desc'
                }
            },
            take: 5
        });

        res.json({
            periodo: { dataInicio, dataFim },
            novosClientes,
            novosPets,
            agendamentosRealizados,
            valorTotalEstoque: vendasProdutos._sum.valor || 0,
            topVeterinarios
        });
    } catch (error) {
        logger.error(`Erro ao gerar relatório: ${error.message}`);
        res.status(500).json({ message: 'Erro ao gerar relatório' });
    }
};

module.exports = {
    loginAdmin,
    createVeterinario,
    getVeterinarios,
    updateVeterinario,
    deleteVeterinario,
    getDashboard,
    getClientes,
    getClienteDetalhes,
    getRelatorioGeral
};
