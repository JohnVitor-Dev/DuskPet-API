const express = require('express');
const router = express.Router();

const veterinariosController = require('../controllers/veterinariosController');

router.get('/', veterinariosController.getVeterinarios);
router.get('/:id', veterinariosController.getVeterinarioById);

module.exports = router;
