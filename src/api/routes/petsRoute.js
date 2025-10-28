const express = require('express');
const router = express.Router();

const petsController = require('../../controllers/petsController');
const { petValidation, petUpdateValidation, petIdValidation, validate } = require('../../validators/petValidator');
const upload = require('../../config/multer');
const handleMulterError = require('../../middlewares/handleMulterError');

router.post('/', upload.single('imagem'), handleMulterError, petValidation, validate, petsController.createPet);
router.get('/', petsController.getPets);
router.get('/:id', petIdValidation, validate, petsController.getPetById);
router.get('/:id/imagem', petIdValidation, validate, petsController.getPetImage);
router.put('/:id', upload.single('imagem'), handleMulterError, petIdValidation, petUpdateValidation, validate, petsController.updatePet);
router.delete('/:id', petIdValidation, validate, petsController.deletePet);

module.exports = router;
