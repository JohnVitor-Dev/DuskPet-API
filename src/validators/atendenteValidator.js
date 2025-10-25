const { body, query } = require('express-validator');

const loginAtendenteValidation = [
    body('email').isEmail().withMessage('Email inválido'),
    body('senha').notEmpty().withMessage('Senha é obrigatória')
];

const updateStatusValidation = [
    body('status')
        .isIn(['Agendado', 'Conclu_do', 'Cancelado'])
        .withMessage('Status inválido')
];

const buscaClienteValidation = [
    query('busca')
        .optional()
        .trim()
        .isLength({ min: 2 })
        .withMessage('Busca deve ter no mínimo 2 caracteres')
];

module.exports = {
    loginAtendenteValidation,
    updateStatusValidation,
    buscaClienteValidation
};
