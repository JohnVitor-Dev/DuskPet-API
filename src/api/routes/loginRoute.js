const express = require('express');
const router = express.Router();

const loginController = require('../../controllers/loginController');

router.post('/', loginController.login);
router.post('/admin', loginController.adminLogin);

module.exports = router;