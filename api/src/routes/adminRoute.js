const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const verifyAdmin = require('../middlewares/verifyAdmin');
const { validationResult } = require('express-validator');
const {
    loginAdminValidation,
    createVeterinarioValidation,
    updateVeterinarioValidation,
    relatorioValidation
} = require('../validators/adminValidator');

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

router.post('/login', loginAdminValidation, validate, adminController.loginAdmin);

router.use(verifyAdmin);

router.get('/dashboard', adminController.getDashboard);
router.get('/clientes', adminController.getClientes);
router.get('/clientes/:id', adminController.getClienteDetalhes);
router.get('/relatorio', relatorioValidation, validate, adminController.getRelatorioGeral);

router.post('/veterinarios', createVeterinarioValidation, validate, adminController.createVeterinario);
router.get('/veterinarios', adminController.getVeterinarios);
router.put('/veterinarios/:id', updateVeterinarioValidation, validate, adminController.updateVeterinario);
router.delete('/veterinarios/:id', adminController.deleteVeterinario);

module.exports = router;
