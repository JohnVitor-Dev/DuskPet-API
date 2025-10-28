const { body, validationResult } = require('express-validator');

const profileUpdateValidation = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 3, max: 255 })
        .withMessage('Nome deve ter entre 3 e 255 caracteres'),
    body('email')
        .optional()
        .trim()
        .isEmail()
        .withMessage('Email inválido')
        .normalizeEmail(),
    body('phone')
        .optional()
        .trim()
        .isLength({ min: 8, max: 20 })
        .withMessage('Telefone deve ter entre 8 e 20 caracteres')
        .matches(/^[+\d\s()-]+$/)
        .withMessage('Telefone deve conter apenas números e símbolos válidos (+, -, espaço, parênteses)'),
    body('password')
        .optional()
        .isLength({ min: 6 })
        .withMessage('Senha deve ter pelo menos 6 caracteres')
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
    profileUpdateValidation,
    validate
};
