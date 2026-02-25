import express from 'express';
import {
    getShoppingLists,
    getShoppingListById,
    createShoppingList,
    generateShoppingList,
    updateShoppingList,
    deleteShoppingList
} from '../controllers/shoppingListController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(authenticateToken);

router.get('/', getShoppingLists);
router.get('/:id', getShoppingListById);
router.post('/', createShoppingList);
router.post('/generate', generateShoppingList);
router.put('/:id', updateShoppingList);
router.delete('/:id', deleteShoppingList);

export default router;
