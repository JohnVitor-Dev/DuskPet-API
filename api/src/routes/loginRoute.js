const express = require('express');
const router = express.Router();

const loginController = require('../controllers/loginController');
const { loginValidation, validate } = require('../validators/authValidator');

router.post('/', loginValidation, validate, loginController.login);
router.post('/admin', loginValidation, validate, loginController.adminLogin);

module.exports = router;