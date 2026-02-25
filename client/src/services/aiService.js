import api from './api';

export const aiService = {
    // Get ingredient substitutions
    getSubstitutions: async (ingredient, dietaryRestrictions = [], recipeTitle = '', allIngredients = []) => {
        const response = await api.post('/ai/substitute', {
            ingredient,
            dietaryRestrictions,
            recipeTitle,
            allIngredients
        });
        return response.data;
    },

    // Get AI explanation for recipe
    explainRecipe: async (recipeId, recipeData = null) => {
        const payload = recipeData ? { recipeData } : { recipeId };
        const response = await api.post('/ai/explain', payload);
        return response.data;
    },

    // Validate recipe against dietary restrictions
    validateRecipe: async (recipeId, dietaryRestrictions = []) => {
        const response = await api.post('/ai/validate', {
            recipeId,
            dietaryRestrictions
        });
        return response.data;
    }
};
