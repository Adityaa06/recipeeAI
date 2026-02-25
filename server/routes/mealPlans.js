import express from 'express';
import {
    getMealPlans,
    getMealPlanById,
    createMealPlan,
    generateMealPlan,
    updateMealPlan,
    deleteMealPlan,
    addToPersonalMealPlan,
    getPersonalMealPlan
} from '../controllers/mealPlanController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(authenticateToken);

router.get('/', getMealPlans);
router.get('/:id', getMealPlanById);
router.post('/', createMealPlan);
router.post('/generate', generateMealPlan);
router.put('/:id', updateMealPlan);
router.delete('/:id', deleteMealPlan);

// Personal meal plan routes
router.get('/personal/current', getPersonalMealPlan);
router.post('/personal/add', addToPersonalMealPlan);

export default router;
