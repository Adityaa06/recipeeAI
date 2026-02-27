import express from 'express';
import {
    getRecipes,
    searchRecipes,
    getRecipeById,
    createRecipe,
    updateRecipe,
    deleteRecipe,
    toggleSaveRecipe,
    getSavedRecipes
} from '../controllers/recipeController.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Public routes (with optional auth for personalization)
router.get('/', optionalAuth, getRecipes);
router.get('/:id', optionalAuth, getRecipeById);

// AI-powered search
router.post('/search', optionalAuth, searchRecipes);

// Protected routes
router.post('/', authenticateToken, createRecipe);
router.put('/:id', authenticateToken, updateRecipe);
router.delete('/:id', authenticateToken, deleteRecipe);

// Saved recipes routes
router.get('/collection/saved', authenticateToken, getSavedRecipes);
router.post('/toggle-save/:id', authenticateToken, toggleSaveRecipe);

export default router;
