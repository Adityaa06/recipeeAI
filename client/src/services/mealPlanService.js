import api from './api';

export const mealPlanService = {
    // Get all user meal plans
    getMealPlans: async () => {
        const response = await api.get('/mealplans');
        return response.data;
    },

    // Get single meal plan
    getMealPlanById: async (id) => {
        const response = await api.get(`/mealplans/${id}`);
        return response.data;
    },

    // Create manual meal plan
    createMealPlan: async (mealPlanData) => {
        const response = await api.post('/mealplans', mealPlanData);
        return response.data;
    },

    // Generate AI-powered meal plan
    generateMealPlan: async (options = {}) => {
        const response = await api.post('/mealplans/generate', options);
        return response.data;
    },

    // Update meal plan
    updateMealPlan: async (id, mealPlanData) => {
        const response = await api.put(`/mealplans/${id}`, mealPlanData);
        return response.data;
    },

    // Delete meal plan
    deleteMealPlan: async (id) => {
        const response = await api.delete(`/mealplans/${id}`);
        return response.data;
    },

    // Add to personal meal plan
    addToPersonalMealPlan: async (recipeId, day, mealType) => {
        const response = await api.post('/mealplans/personal/add', { recipeId, day, mealType });
        return response.data;
    },

    // Get current personal meal plan
    getPersonalMealPlan: async () => {
        const response = await api.get('/mealplans/personal/current');
        return response.data;
    }
};
