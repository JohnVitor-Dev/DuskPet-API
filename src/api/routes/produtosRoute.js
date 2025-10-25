const express = require('express');
const router = express.Router();

const produtosController = require('../../controllers/produtosController');
const {
    produtoValidation,
    produtoUpdateValidation,
    ajusteEstoqueValidation,
    produtoIdValidation,
    validate
} = require('../../validators/produtoValidator');

router.post('/', produtoValidation, validate, produtosController.createProduto);
router.get('/', produtosController.getProdutos);
router.get('/relatorio', produtosController.getRelatorioEstoque);
router.get('/:id', produtoIdValidation, validate, produtosController.getProdutoById);
router.put('/:id', produtoIdValidation, produtoUpdateValidation, validate, produtosController.updateProduto);
router.patch('/:id/estoque', produtoIdValidation, ajusteEstoqueValidation, validate, produtosController.ajustarEstoque);
router.delete('/:id', produtoIdValidation, validate, produtosController.deleteProduto);

module.exports = router;
