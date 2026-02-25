import Recipe from '../models/Recipe.js';
import geminiService from '../services/geminiService.js';

/**
 * Get ingredient substitutions using AI
 * POST /api/ai/substitute
 */
export const getSubstitutions = async (req, res) => {
    try {
        const { ingredient, dietaryRestrictions = [], recipeTitle = '', allIngredients = [] } = req.body;

        if (!ingredient) {
            return res.status(400).json({
                success: false,
                message: 'Ingredient is required'
            });
        }

        // Add context for the AI
        const contextPrompt = recipeTitle ? ` for the recipe "${recipeTitle}"` : '';
        const substitutions = await geminiService.suggestSubstitutions(
            ingredient,
            dietaryRestrictions
        );

        res.status(200).json({
            success: true,
            ingredient,
            substitutions
        });
    } catch (error) {
        console.error('Get substitutions error:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting substitutions',
            error: error.message
        });
    }
};

/**
 * Get AI explanation for a recipe
 * POST /api/ai/explain
 */
export const explainRecipe = async (req, res) => {
    try {
        const { recipeId, recipeData } = req.body;

        let recipe;

        // If recipeData is provided (for AI-generated recipes), use it directly
        if (recipeData) {
            recipe = recipeData;
            console.log('📝 Explaining AI-generated recipe:', recipe.title);
        }
        // Otherwise, fetch from database by ID
        else if (recipeId) {
            recipe = await Recipe.findById(recipeId);

            if (!recipe) {
                return res.status(404).json({
                    success: false,
                    message: 'Recipe not found'
                });
            }
            console.log('📝 Explaining database recipe:', recipe.title);
        }
        else {
            return res.status(400).json({
                success: false,
                message: 'Either recipeId or recipeData is required'
            });
        }

        const explanation = await geminiService.explainRecipe(recipe);

        res.status(200).json({
            success: true,
            recipe: {
                id: recipe._id,
                title: recipe.title,
                isAIGenerated: recipe.isAIGenerated || false
            },
            explanation
        });
    } catch (error) {
        console.error('Explain recipe error:', error);
        res.status(500).json({
            success: false,
            message: 'Error explaining recipe',
            error: error.message
        });
    }
};

/**
 * Validate recipe against dietary restrictions
 * POST /api/ai/validate
 */
export const validateRecipe = async (req, res) => {
    try {
        const { recipeId, dietaryRestrictions = [] } = req.body;

        if (!recipeId) {
            return res.status(400).json({
                success: false,
                message: 'Recipe ID is required'
            });
        }

        const recipe = await Recipe.findById(recipeId);

        if (!recipe) {
            return res.status(404).json({
                success: false,
                message: 'Recipe not found'
            });
        }

        const validation = await geminiService.validateDietaryRestrictions(
            recipe,
            dietaryRestrictions
        );

        res.status(200).json({
            success: true,
            recipe: {
                id: recipe._id,
                title: recipe.title
            },
            validation
        });
    } catch (error) {
        console.error('Validate recipe error:', error);
        res.status(500).json({
            success: false,
            message: 'Error validating recipe',
            error: error.message
        });
    }
};
