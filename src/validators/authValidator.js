const { body, validationResult } = require('express-validator');

const loginValidation = [
    body('email')
        .isEmail()
        .withMessage('Email inválido')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Senha deve ter no mínimo 6 caracteres')
];

const registerValidation = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Nome é obrigatório')
        .isLength({ min: 2, max: 255 })
        .withMessage('Nome deve ter entre 2 e 255 caracteres'),
    body('phone')
        .trim()
        .notEmpty()
        .withMessage('Telefone é obrigatório')
        .matches(/^[\d\s\-\(\)+]+$/)
        .withMessage('Telefone inválido'),
    body('email')
        .isEmail()
        .withMessage('Email inválido')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Senha deve ter no mínimo 6 caracteres')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número')
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
    loginValidation,
    registerValidation,
    validate
};
