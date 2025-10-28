const express = require('express');
const router = express.Router();
const atendenteController = require('../controllers/atendenteController');
const verifyAtendente = require('../middlewares/verifyAtendente');
const { validationResult } = require('express-validator');
const {
    loginAtendenteValidation,
    updateStatusValidation,
    buscaClienteValidation
} = require('../validators/atendenteValidator');

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

router.post('/login', loginAtendenteValidation, validate, atendenteController.loginAtendente);

router.use(verifyAtendente);

router.get('/agendamentos', atendenteController.getAgendamentos);
router.patch('/agendamentos/:id/status', updateStatusValidation, validate, atendenteController.updateAgendamentoStatus);
router.get('/clientes', buscaClienteValidation, validate, atendenteController.getClientes);
router.get('/clientes/:id', atendenteController.getClienteDetalhes);
router.get('/produtos', atendenteController.getProdutos);
router.get('/veterinarios', atendenteController.getVeterinarios);

module.exports = router;
