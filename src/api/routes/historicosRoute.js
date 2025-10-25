const express = require('express');
const router = express.Router();

const historicosController = require('../../controllers/historicosController');
const {
    historicoValidation,
    historicoUpdateValidation,
    historicoIdValidation,
    petIdValidation,
    validate
} = require('../../validators/historicoValidator');

router.post('/', historicoValidation, validate, historicosController.createHistorico);
router.get('/pet/:pet_id', petIdValidation, validate, historicosController.getHistoricosByPet);
router.get('/pet/:pet_id/completo', petIdValidation, validate, historicosController.getHistoricoCompleto);
router.get('/:id', historicoIdValidation, validate, historicosController.getHistoricoById);
router.put('/:id', historicoIdValidation, historicoUpdateValidation, validate, historicosController.updateHistorico);
router.delete('/:id', historicoIdValidation, validate, historicosController.deleteHistorico);

module.exports = router;
