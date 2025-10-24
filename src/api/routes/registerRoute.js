const express = require('express');
const router = express.Router();

const registerController = require('../../controllers/registerController');
const { registerValidation, validate } = require('../../validators/authValidator');

router.post('/', registerValidation, validate, registerController.register);

module.exports = router;