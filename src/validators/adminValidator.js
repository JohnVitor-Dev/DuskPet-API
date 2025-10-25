const { body, query } = require('express-validator');

const loginAdminValidation = [
    body('email').isEmail().withMessage('Email inválido'),
    body('senha').notEmpty().withMessage('Senha é obrigatória')
];

const createVeterinarioValidation = [
    body('nome')
        .trim()
        .isLength({ min: 3, max: 255 })
        .withMessage('Nome deve ter entre 3 e 255 caracteres'),
    body('cpf')
        .trim()
        .matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)
        .withMessage('CPF inválido (formato: 000.000.000-00)'),
    body('crmv')
        .trim()
        .isLength({ min: 3, max: 20 })
        .withMessage('CRMV deve ter entre 3 e 20 caracteres'),
    body('especialidades')
        .isArray({ min: 1 })
        .withMessage('Pelo menos uma especialidade é obrigatória'),
    body('horarios_trabalho')
        .optional()
        .isObject()
        .withMessage('Horários de trabalho devem ser um objeto JSON')
];

const updateVeterinarioValidation = [
    body('nome')
        .optional()
        .trim()
        .isLength({ min: 3, max: 255 })
        .withMessage('Nome deve ter entre 3 e 255 caracteres'),
    body('cpf')
        .optional()
        .trim()
        .matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)
        .withMessage('CPF inválido (formato: 000.000.000-00)'),
    body('crmv')
        .optional()
        .trim()
        .isLength({ min: 3, max: 20 })
        .withMessage('CRMV deve ter entre 3 e 20 caracteres'),
    body('especialidades')
        .optional()
        .isArray({ min: 1 })
        .withMessage('Pelo menos uma especialidade é obrigatória'),
    body('horarios_trabalho')
        .optional()
        .isObject()
        .withMessage('Horários de trabalho devem ser um objeto JSON')
];

const relatorioValidation = [
    query('dataInicio')
        .optional()
        .isISO8601()
        .withMessage('Data de início inválida'),
    query('dataFim')
        .optional()
        .isISO8601()
        .withMessage('Data de fim inválida')
];

module.exports = {
    loginAdminValidation,
    createVeterinarioValidation,
    updateVeterinarioValidation,
    relatorioValidation
};
