const express = require('express');
const multer = require('multer');
const router = express.Router();
const controller = require('../controllers/livroController');
const upload = multer({ storage: multer.memoryStorage() });

router.get('/listar', controller.listar);
router.get('/:id', controller.obter);
router.post('/', controller.criar);
router.put('/:id', controller.atualizar);
router.delete('/:id', controller.deletar);
router.post('/upload/:id', upload.single('imagem'), controller.uploadCapa);

module.exports = router;
