const express = require('express');
const taskController = require('../controllers/taskController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Todas as rotas de tarefas exigem token
router.use(authMiddleware);

router.post('/', taskController.create);
router.get('/', taskController.list);
router.get('/:id', taskController.getById);
router.put('/:id', taskController.update);
router.delete('/:id', taskController.remove);

module.exports = router;
