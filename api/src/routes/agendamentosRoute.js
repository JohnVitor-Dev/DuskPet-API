const express = require('express');
const router = express.Router();

const agendamentosController = require('../controllers/agendamentosController');
const {
    agendamentoValidation,
    agendamentoUpdateValidation,
    agendamentoIdValidation,
    horariosDisponiveisValidation,
    validate
} = require('../validators/agendamentoValidator');

router.post('/', agendamentoValidation, validate, agendamentosController.createAgendamento);
router.get('/', agendamentosController.getAgendamentos);
router.get('/horarios-disponiveis', horariosDisponiveisValidation, validate, agendamentosController.getHorariosDisponiveis);
router.get('/:id', agendamentoIdValidation, validate, agendamentosController.getAgendamentoById);
router.put('/:id', agendamentoIdValidation, agendamentoUpdateValidation, validate, agendamentosController.updateAgendamento);
router.patch('/:id/cancel', agendamentoIdValidation, validate, agendamentosController.cancelAgendamento);

module.exports = router;
