import api from './api';

export const shoppingListService = {
    // Get all user shopping lists
    getShoppingLists: async () => {
        const response = await api.get('/shoppinglists');
        return response.data;
    },

    // Get single shopping list
    getShoppingListById: async (id) => {
        const response = await api.get(`/shoppinglists/${id}`);
        return response.data;
    },

    // Generate shopping list from meal plan
    generateShoppingList: async (mealPlanId, title) => {
        const response = await api.post('/shoppinglists/generate', { mealPlanId, title });
        return response.data;
    },

    // Create manual shopping list
    createShoppingList: async (shoppingListData) => {
        const response = await api.post('/shoppinglists', shoppingListData);
        return response.data;
    },

    // Update shopping list
    updateShoppingList: async (id, shoppingListData) => {
        const response = await api.put(`/shoppinglists/${id}`, shoppingListData);
        return response.data;
    },

    // Delete shopping list
    deleteShoppingList: async (id) => {
        const response = await api.delete(`/shoppinglists/${id}`);
        return response.data;
    }
};
