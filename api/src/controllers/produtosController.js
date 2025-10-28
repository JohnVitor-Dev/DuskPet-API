const prisma = require('../config/prisma');
const logger = require('../config/logger');

const createProduto = async (req, res) => {
    const { nome_produto, valor, quantidade, validade } = req.body;

    try {
        const produtoExistente = await prisma.produtos_estoque.findUnique({
            where: { nome_produto }
        });

        if (produtoExistente) {
            logger.warn('Tentativa de cadastrar produto duplicado', { nome_produto });
            return res.status(400).json({ error: 'Produto já existe' });
        }

        const novoProduto = await prisma.produtos_estoque.create({
            data: {
                nome_produto,
                valor,
                quantidade: quantidade || 0,
                validade: validade ? new Date(validade) : null
            }
        });

        logger.info('Produto cadastrado', { produtoId: novoProduto.id, nome_produto });
        res.status(201).json(novoProduto);
    } catch (error) {
        logger.error('Erro ao cadastrar produto', { error: error.message, stack: error.stack, nome_produto });
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

const getProdutos = async (req, res) => {
    const { estoque_baixo, vencendo } = req.query;

    try {
        const where = {};

        if (estoque_baixo === 'true') {
            where.quantidade = { lte: 10 };
        }

        if (vencendo === 'true') {
            const trintaDias = new Date();
            trintaDias.setDate(trintaDias.getDate() + 30);
            where.validade = {
                lte: trintaDias,
                gte: new Date()
            };
        }

        const produtos = await prisma.produtos_estoque.findMany({
            where,
            orderBy: { nome_produto: 'asc' }
        });

        logger.info('Lista de produtos acessada', { quantidade: produtos.length });
        res.json(produtos);
    } catch (error) {
        logger.error('Erro ao listar produtos', { error: error.message, stack: error.stack });
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

const getProdutoById = async (req, res) => {
    const { id } = req.params;

    try {
        const produto = await prisma.produtos_estoque.findUnique({
            where: { id: parseInt(id) }
        });

        if (!produto) {
            logger.warn('Produto não encontrado', { produtoId: id });
            return res.status(404).json({ error: 'Produto não encontrado' });
        }

        logger.info('Detalhes do produto acessados', { produtoId: id });
        res.json(produto);
    } catch (error) {
        logger.error('Erro ao buscar produto', { error: error.message, stack: error.stack, produtoId: id });
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

const updateProduto = async (req, res) => {
    const { id } = req.params;
    const { nome_produto, valor, quantidade, validade } = req.body;

    try {
        const produto = await prisma.produtos_estoque.findUnique({
            where: { id: parseInt(id) }
        });

        if (!produto) {
            logger.warn('Produto não encontrado para atualização', { produtoId: id });
            return res.status(404).json({ error: 'Produto não encontrado' });
        }

        if (nome_produto && nome_produto !== produto.nome_produto) {
            const produtoComMesmoNome = await prisma.produtos_estoque.findUnique({
                where: { nome_produto }
            });

            if (produtoComMesmoNome) {
                logger.warn('Tentativa de atualizar para nome duplicado', { nome_produto, produtoId: id });
                return res.status(400).json({ error: 'Nome do produto já existe' });
            }
        }

        const updateData = {};
        if (nome_produto !== undefined) updateData.nome_produto = nome_produto;
        if (valor !== undefined) updateData.valor = valor;
        if (quantidade !== undefined) updateData.quantidade = quantidade;
        if (validade !== undefined) updateData.validade = validade ? new Date(validade) : null;
        updateData.updated_at = new Date();

        const produtoAtualizado = await prisma.produtos_estoque.update({
            where: { id: parseInt(id) },
            data: updateData
        });

        logger.info('Produto atualizado', { produtoId: id });
        res.json(produtoAtualizado);
    } catch (error) {
        logger.error('Erro ao atualizar produto', { error: error.message, stack: error.stack, produtoId: id });
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

const deleteProduto = async (req, res) => {
    const { id } = req.params;

    try {
        const produto = await prisma.produtos_estoque.findUnique({
            where: { id: parseInt(id) }
        });

        if (!produto) {
            logger.warn('Produto não encontrado para exclusão', { produtoId: id });
            return res.status(404).json({ error: 'Produto não encontrado' });
        }

        await prisma.produtos_estoque.delete({
            where: { id: parseInt(id) }
        });

        logger.info('Produto excluído', { produtoId: id, nome: produto.nome_produto });
        res.json({ message: 'Produto excluído com sucesso' });
    } catch (error) {
        logger.error('Erro ao excluir produto', { error: error.message, stack: error.stack, produtoId: id });
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

const ajustarEstoque = async (req, res) => {
    const { id } = req.params;
    const { quantidade, operacao } = req.body;

    try {
        const produto = await prisma.produtos_estoque.findUnique({
            where: { id: parseInt(id) }
        });

        if (!produto) {
            logger.warn('Produto não encontrado para ajuste de estoque', { produtoId: id });
            return res.status(404).json({ error: 'Produto não encontrado' });
        }

        let novaQuantidade;
        if (operacao === 'adicionar') {
            novaQuantidade = produto.quantidade + quantidade;
        } else if (operacao === 'remover') {
            novaQuantidade = produto.quantidade - quantidade;
            if (novaQuantidade < 0) {
                logger.warn('Tentativa de remover mais produtos do que disponível', { produtoId: id, quantidade, disponivel: produto.quantidade });
                return res.status(400).json({ error: 'Estoque insuficiente' });
            }
        } else {
            return res.status(400).json({ error: 'Operação inválida. Use "adicionar" ou "remover"' });
        }

        const produtoAtualizado = await prisma.produtos_estoque.update({
            where: { id: parseInt(id) },
            data: {
                quantidade: novaQuantidade,
                updated_at: new Date()
            }
        });

        logger.info('Estoque ajustado', { produtoId: id, operacao, quantidade, novaQuantidade });
        res.json({
            message: 'Estoque ajustado com sucesso',
            produto: produtoAtualizado
        });
    } catch (error) {
        logger.error('Erro ao ajustar estoque', { error: error.message, stack: error.stack, produtoId: id });
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

const getRelatorioEstoque = async (req, res) => {
    try {
        const totalProdutos = await prisma.produtos_estoque.count();

        const estoqueBaixo = await prisma.produtos_estoque.count({
            where: { quantidade: { lte: 10 } }
        });

        const trintaDias = new Date();
        trintaDias.setDate(trintaDias.getDate() + 30);

        const produtosVencendo = await prisma.produtos_estoque.count({
            where: {
                validade: {
                    lte: trintaDias,
                    gte: new Date()
                }
            }
        });

        const produtosVencidos = await prisma.produtos_estoque.count({
            where: {
                validade: {
                    lt: new Date()
                }
            }
        });

        const valorTotalEstoque = await prisma.produtos_estoque.aggregate({
            _sum: {
                valor: true
            }
        });

        const quantidadeTotalEstoque = await prisma.produtos_estoque.aggregate({
            _sum: {
                quantidade: true
            }
        });

        logger.info('Relatório de estoque acessado');
        res.json({
            total_produtos: totalProdutos,
            estoque_baixo: estoqueBaixo,
            produtos_vencendo: produtosVencendo,
            produtos_vencidos: produtosVencidos,
            valor_total_estoque: valorTotalEstoque._sum.valor || 0,
            quantidade_total_estoque: quantidadeTotalEstoque._sum.quantidade || 0
        });
    } catch (error) {
        logger.error('Erro ao gerar relatório de estoque', { error: error.message, stack: error.stack });
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

module.exports = {
    createProduto,
    getProdutos,
    getProdutoById,
    updateProduto,
    deleteProduto,
    ajustarEstoque,
    getRelatorioEstoque
};
