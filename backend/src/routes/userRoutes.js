const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Rotas públicas (não precisam de token)
router.post('/register', userController.register);
router.post('/login', userController.login);

// Rotas protegidas (precisam de JWT válido)
router.get('/', authMiddleware, userController.list);
router.get('/:id', authMiddleware, userController.getById);
router.put('/:id', authMiddleware, userController.update);
router.delete('/:id', authMiddleware, userController.remove);

module.exports = router;
