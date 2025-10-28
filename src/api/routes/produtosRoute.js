const express = require('express');
const router = express.Router();

const produtosController = require('../../controllers/produtosController');
const verifyAtendente = require('../../middlewares/verifyAtendente');
const {
    produtoValidation,
    produtoUpdateValidation,
    ajusteEstoqueValidation,
    produtoIdValidation,
    validate
} = require('../../validators/produtoValidator');

router.post('/', verifyAtendente, produtoValidation, validate, produtosController.createProduto);
router.get('/', produtosController.getProdutos);
router.get('/relatorio', verifyAtendente, produtosController.getRelatorioEstoque);
router.get('/:id', produtoIdValidation, validate, produtosController.getProdutoById);
router.put('/:id', verifyAtendente, produtoIdValidation, produtoUpdateValidation, validate, produtosController.updateProduto);
router.patch('/:id/estoque', verifyAtendente, produtoIdValidation, ajusteEstoqueValidation, validate, produtosController.ajustarEstoque);
router.delete('/:id', verifyAtendente, produtoIdValidation, validate, produtosController.deleteProduto);

module.exports = router;
