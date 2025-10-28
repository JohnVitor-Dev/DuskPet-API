const { body, param, query, validationResult } = require('express-validator');

const produtoValidation = [
    body('nome_produto')
        .trim()
        .notEmpty()
        .withMessage('Nome do produto é obrigatório')
        .isLength({ min: 2, max: 255 })
        .withMessage('Nome do produto deve ter entre 2 e 255 caracteres'),
    body('valor')
        .notEmpty()
        .withMessage('Valor é obrigatório')
        .isFloat({ min: 0.01 })
        .withMessage('Valor deve ser maior que zero'),
    body('quantidade')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Quantidade deve ser um número inteiro positivo'),
    body('validade')
        .optional()
        .isISO8601()
        .withMessage('Data de validade inválida')
];

const produtoUpdateValidation = [
    body('nome_produto')
        .optional()
        .trim()
        .isLength({ min: 2, max: 255 })
        .withMessage('Nome do produto deve ter entre 2 e 255 caracteres'),
    body('valor')
        .optional()
        .isFloat({ min: 0.01 })
        .withMessage('Valor deve ser maior que zero'),
    body('quantidade')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Quantidade deve ser um número inteiro positivo'),
    body('validade')
        .optional()
        .isISO8601()
        .withMessage('Data de validade inválida')
];

const ajusteEstoqueValidation = [
    body('quantidade')
        .notEmpty()
        .withMessage('Quantidade é obrigatória')
        .isInt({ min: 1 })
        .withMessage('Quantidade deve ser um número inteiro maior que zero'),
    body('operacao')
        .notEmpty()
        .withMessage('Operação é obrigatória')
        .isIn(['adicionar', 'remover'])
        .withMessage('Operação deve ser "adicionar" ou "remover"')
];

const produtoIdValidation = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('ID do produto inválido')
];

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Dados inválidos',
            details: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }
    next();
};

module.exports = {
    produtoValidation,
    produtoUpdateValidation,
    ajusteEstoqueValidation,
    produtoIdValidation,
    validate
};
