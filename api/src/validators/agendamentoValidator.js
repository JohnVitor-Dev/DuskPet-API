const { body, param, query, validationResult } = require('express-validator');

const agendamentoValidation = [
    body('pet_id')
        .isInt({ min: 1 })
        .withMessage('ID do pet inválido'),
    body('veterinario_id')
        .isInt({ min: 1 })
        .withMessage('ID do veterinário inválido'),
    body('data_hora')
        .notEmpty()
        .withMessage('Data e hora são obrigatórias')
        .isISO8601()
        .withMessage('Data e hora inválidas'),
    body('tipo_consulta')
        .optional()
        .trim()
        .isLength({ max: 255 })
        .withMessage('Tipo de consulta deve ter no máximo 255 caracteres')
];

const agendamentoUpdateValidation = [
    body('data_hora')
        .optional()
        .isISO8601()
        .withMessage('Data e hora inválidas'),
    body('tipo_consulta')
        .optional()
        .trim()
        .isLength({ max: 255 })
        .withMessage('Tipo de consulta deve ter no máximo 255 caracteres'),
    body('status')
        .optional()
        .isIn(['Agendado', 'Concluído', 'Conclu_do', 'Cancelado'])
        .withMessage('Status inválido')
];

const agendamentoIdValidation = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('ID do agendamento inválido')
];

const horariosDisponiveisValidation = [
    query('veterinario_id')
        .notEmpty()
        .withMessage('ID do veterinário é obrigatório')
        .isInt({ min: 1 })
        .withMessage('ID do veterinário inválido'),
    query('data')
        .notEmpty()
        .withMessage('Data é obrigatória')
        .isISO8601()
        .withMessage('Data inválida')
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
    agendamentoValidation,
    agendamentoUpdateValidation,
    agendamentoIdValidation,
    horariosDisponiveisValidation,
    validate
};
