const express = require('express');
const router = express.Router();
const controller = require('../controllers/editoraController');

router.get('/listar', controller.listar);
router.get('/:id', controller.obter);
router.post('/', controller.criar);
router.put('/:id', controller.atualizar);
router.delete('/:id', controller.deletar);

module.exports = router;
