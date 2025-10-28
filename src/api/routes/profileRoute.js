const express = require('express');
const router = express.Router();

const profileController = require('../../controllers/profileController');
const { profileUpdateValidation, validate } = require('../../validators/profileValidator');

router.get('/', profileController.getProfile);
router.put('/', profileUpdateValidation, validate, profileController.updateProfile);

module.exports = router;