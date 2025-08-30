const express = require('express');
const router = express.Router();

const testController = require('../../controllers/testController');

router.get('/db', testController.getHourFromDB);

module.exports = router;
