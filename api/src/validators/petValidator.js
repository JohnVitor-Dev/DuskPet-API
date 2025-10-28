const { body, param, validationResult } = require('express-validator');

const petValidation = [
    body('nome')
        .trim()
        .notEmpty()
        .withMessage('Nome é obrigatório')
        .isLength({ min: 2, max: 255 })
        .withMessage('Nome deve ter entre 2 e 255 caracteres'),
    body('especie')
        .trim()
        .notEmpty()
        .withMessage('Espécie é obrigatória')
        .isLength({ min: 2, max: 100 })
        .withMessage('Espécie deve ter entre 2 e 100 caracteres'),
    body('raca')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Raça deve ter no máximo 100 caracteres'),
    body('sexo')
        .optional()
        .isIn(['Macho', 'Fêmea', 'F_mea'])
        .withMessage('Sexo deve ser "Macho" ou "Fêmea"')
        .customSanitizer(value => value === 'Fêmea' ? 'F_mea' : value),
    body('data_nascimento')
        .optional()
        .isISO8601()
        .withMessage('Data de nascimento inválida')
        .custom((value) => {
            const date = new Date(value);
            const today = new Date();
            if (date > today) {
                throw new Error('Data de nascimento não pode ser no futuro');
            }
            return true;
        })
];

const petUpdateValidation = [
    body('nome')
        .optional()
        .trim()
        .isLength({ min: 2, max: 255 })
        .withMessage('Nome deve ter entre 2 e 255 caracteres'),
    body('especie')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Espécie deve ter entre 2 e 100 caracteres'),
    body('raca')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Raça deve ter no máximo 100 caracteres'),
    body('sexo')
        .optional()
        .isIn(['Macho', 'Fêmea', 'F_mea'])
        .withMessage('Sexo deve ser "Macho" ou "Fêmea"')
        .customSanitizer(value => value === 'Fêmea' ? 'F_mea' : value),
    body('data_nascimento')
        .optional()
        .isISO8601()
        .withMessage('Data de nascimento inválida')
        .custom((value) => {
            if (value) {
                const date = new Date(value);
                const today = new Date();
                if (date > today) {
                    throw new Error('Data de nascimento não pode ser no futuro');
                }
            }
            return true;
        })
];

const petIdValidation = [
    param('id')
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
    petValidation,
    petUpdateValidation,
    petIdValidation,
    validate
};
