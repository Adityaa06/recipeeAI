import api from './api';

export const recipeService = {
    // Get all recipes with filters
    getRecipes: async (params = {}) => {
        const response = await api.get('/recipes', { params });
        return response.data;
    },

    // AI-powered natural language search
    searchRecipes: async (query) => {
        const response = await api.post('/recipes/search', { query });
        return response.data;
    },

    // Get single recipe by ID
    getRecipeById: async (id) => {
        const response = await api.get(`/recipes/${id}`);
        return response.data;
    },

    // Create new recipe
    createRecipe: async (recipeData) => {
        const response = await api.post('/recipes', recipeData);
        return response.data;
    },

    // Update recipe
    updateRecipe: async (id, recipeData) => {
        const response = await api.put(`/recipes/${id}`, recipeData);
        return response.data;
    },

    // Delete recipe
    deleteRecipe: async (id) => {
        const response = await api.delete(`/recipes/${id}`);
        return response.data;
    },

    // Toggle save recipe
    toggleSaveRecipe: async (id) => {
        const response = await api.post(`/recipes/toggle-save/${id}`);
        return response.data;
    },

    // Get saved recipes
    getSavedRecipes: async () => {
        const response = await api.get('/recipes/collection/saved');
        return response.data;
    }
};
