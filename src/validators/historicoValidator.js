const { body, param, validationResult } = require('express-validator');

const historicoValidation = [
    body('pet_id')
        .isInt({ min: 1 })
        .withMessage('ID do pet inválido'),
    body('agendamento_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('ID do agendamento inválido'),
    body('vacinas')
        .optional()
        .trim()
        .isLength({ max: 5000 })
        .withMessage('Vacinas deve ter no máximo 5000 caracteres'),
    body('doencas_alergias')
        .optional()
        .trim()
        .isLength({ max: 5000 })
        .withMessage('Doenças e alergias deve ter no máximo 5000 caracteres'),
    body('medicamentos')
        .optional()
        .trim()
        .isLength({ max: 5000 })
        .withMessage('Medicamentos deve ter no máximo 5000 caracteres'),
    body('observacoes')
        .optional()
        .trim()
        .isLength({ max: 5000 })
        .withMessage('Observações deve ter no máximo 5000 caracteres')
];

const historicoUpdateValidation = [
    body('vacinas')
        .optional()
        .trim()
        .isLength({ max: 5000 })
        .withMessage('Vacinas deve ter no máximo 5000 caracteres'),
    body('doencas_alergias')
        .optional()
        .trim()
        .isLength({ max: 5000 })
        .withMessage('Doenças e alergias deve ter no máximo 5000 caracteres'),
    body('medicamentos')
        .optional()
        .trim()
        .isLength({ max: 5000 })
        .withMessage('Medicamentos deve ter no máximo 5000 caracteres'),
    body('observacoes')
        .optional()
        .trim()
        .isLength({ max: 5000 })
        .withMessage('Observações deve ter no máximo 5000 caracteres')
];

const historicoIdValidation = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('ID do histórico inválido')
];

const petIdValidation = [
    param('pet_id')
        .isInt({ min: 1 })
        .withMessage('ID do pet inválido')
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
    historicoValidation,
    historicoUpdateValidation,
    historicoIdValidation,
    petIdValidation,
    validate
};
