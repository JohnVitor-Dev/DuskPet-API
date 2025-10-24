const express = require('express');
const router = express.Router();

const petsController = require('../../controllers/petsController');
const { petValidation, petUpdateValidation, petIdValidation, validate } = require('../../validators/petValidator');

router.post('/', petValidation, validate, petsController.createPet);
router.get('/', petsController.getPets);
router.get('/:id', petIdValidation, validate, petsController.getPetById);
router.put('/:id', petIdValidation, petUpdateValidation, validate, petsController.updatePet);
router.delete('/:id', petIdValidation, validate, petsController.deletePet);

module.exports = router;
