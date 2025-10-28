const logger = require('../config/logger');

const handleMulterError = (err, req, res, next) => {
    if (err) {
        logger.error('Erro no upload de arquivo', { error: err.message, stack: err.stack });

        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                error: 'Arquivo muito grande. O tamanho máximo permitido é 5MB.'
            });
        }

        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                error: 'Campo de arquivo inesperado. Use o campo "imagem".'
            });
        }

        if (err.message.includes('Tipo de arquivo inválido')) {
            return res.status(400).json({
                error: err.message
            });
        }

        return res.status(500).json({
            error: 'Erro ao processar o upload da imagem.'
        });
    }

    next();
};

module.exports = handleMulterError;
