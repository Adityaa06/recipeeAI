import express from 'express';
import {
  getAllRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  aiSearchRecipes,
} from '../controllers/recipeController.js';

const router = express.Router();

// AI-powered search route (add this before other routes to avoid conflicts)
router.get('/ai-search', aiSearchRecipes);

// Get all recipes
router.get('/', getAllRecipes);

// Get recipe by ID
router.get('/:id', getRecipeById);

// Create a new recipe
router.post('/', createRecipe);

// Update an existing recipe
router.put('/:id', updateRecipe);

// Delete a recipe
router.delete('/:id', deleteRecipe);

export default router;