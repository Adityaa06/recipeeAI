import express from 'express';
import {
    getSubstitutions,
    explainRecipe,
    validateRecipe
} from '../controllers/aiController.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// AI routes with optional auth
router.post('/substitute', optionalAuth, getSubstitutions);
router.post('/explain', optionalAuth, explainRecipe);
router.post('/validate', optionalAuth, validateRecipe);

export default router;
