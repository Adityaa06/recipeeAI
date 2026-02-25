import ShoppingList from '../models/ShoppingList.js';
import MealPlan from '../models/MealPlan.js';

/**
 * Get user's shopping lists
 * GET /api/shoppinglists
 */
export const getShoppingLists = async (req, res) => {
    try {
        const shoppingLists = await ShoppingList.find({ userId: req.userId })
            .populate('mealPlanId', 'title startDate endDate')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: shoppingLists.length,
            shoppingLists
        });
    } catch (error) {
        console.error('Get shopping lists error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching shopping lists',
            error: error.message
        });
    }
};

/**
 * Get single shopping list by ID
 * GET /api/shoppinglists/:id
 */
export const getShoppingListById = async (req, res) => {
    try {
        const shoppingList = await ShoppingList.findById(req.params.id)
            .populate('mealPlanId');

        if (!shoppingList) {
            return res.status(404).json({
                success: false,
                message: 'Shopping list not found'
            });
        }

        // Check if user owns the shopping list
        if (shoppingList.userId.toString() !== req.userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this shopping list'
            });
        }

        res.status(200).json({
            success: true,
            shoppingList
        });
    } catch (error) {
        console.error('Get shopping list error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching shopping list',
            error: error.message
        });
    }
};

/**
 * Generate shopping list from meal plan
 * POST /api/shoppinglists/generate
 */
export const generateShoppingList = async (req, res) => {
    try {
        const { mealPlanId, title = 'Shopping List' } = req.body;

        if (!mealPlanId) {
            return res.status(400).json({
                success: false,
                message: 'Meal plan ID is required'
            });
        }

        // Get meal plan with populated recipes
        const mealPlan = await MealPlan.findById(mealPlanId)
            .populate('meals.breakfast meals.lunch meals.dinner meals.snacks');

        if (!mealPlan) {
            return res.status(404).json({
                success: false,
                message: 'Meal plan not found'
            });
        }

        // Check if user owns the meal plan
        if (mealPlan.userId.toString() !== req.userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this meal plan'
            });
        }

        // Aggregate all ingredients from all meals
        const ingredientsMap = new Map();

        mealPlan.meals.forEach(meal => {
            const recipes = [
                meal.breakfast,
                meal.lunch,
                meal.dinner,
                ...(meal.snacks || [])
            ].filter(Boolean);

            recipes.forEach(recipe => {
                if (recipe && recipe.ingredients) {
                    recipe.ingredients.forEach(ing => {
                        const key = ing.name.toLowerCase();

                        if (ingredientsMap.has(key)) {
                            // If ingredient exists, you might want to add quantities
                            // For simplicity, we'll just keep the first occurrence
                        } else {
                            ingredientsMap.set(key, {
                                ingredient: ing.name,
                                quantity: ing.quantity,
                                unit: ing.unit || '',
                                checked: false
                            });
                        }
                    });
                }
            });
        });

        const items = Array.from(ingredientsMap.values());

        if (items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No ingredients found in meal plan'
            });
        }

        // Create shopping list
        const shoppingList = await ShoppingList.create({
            userId: req.userId,
            mealPlanId,
            title,
            items
        });

        res.status(201).json({
            success: true,
            message: 'Shopping list generated successfully',
            shoppingList
        });
    } catch (error) {
        console.error('Generate shopping list error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating shopping list',
            error: error.message
        });
    }
};

/**
 * Create manual shopping list
 * POST /api/shoppinglists
 */
export const createShoppingList = async (req, res) => {
    try {
        const shoppingListData = {
            ...req.body,
            userId: req.userId
        };

        const shoppingList = await ShoppingList.create(shoppingListData);

        res.status(201).json({
            success: true,
            message: 'Shopping list created successfully',
            shoppingList
        });
    } catch (error) {
        console.error('Create shopping list error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating shopping list',
            error: error.message
        });
    }
};

/**
 * Update shopping list (including checking items)
 * PUT /api/shoppinglists/:id
 */
export const updateShoppingList = async (req, res) => {
    try {
        const shoppingList = await ShoppingList.findById(req.params.id);

        if (!shoppingList) {
            return res.status(404).json({
                success: false,
                message: 'Shopping list not found'
            });
        }

        // Check if user owns the shopping list
        if (shoppingList.userId.toString() !== req.userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this shopping list'
            });
        }

        const updatedShoppingList = await ShoppingList.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Shopping list updated successfully',
            shoppingList: updatedShoppingList
        });
    } catch (error) {
        console.error('Update shopping list error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating shopping list',
            error: error.message
        });
    }
};

/**
 * Delete shopping list
 * DELETE /api/shoppinglists/:id
 */
export const deleteShoppingList = async (req, res) => {
    try {
        const shoppingList = await ShoppingList.findById(req.params.id);

        if (!shoppingList) {
            return res.status(404).json({
                success: false,
                message: 'Shopping list not found'
            });
        }

        // Check if user owns the shopping list
        if (shoppingList.userId.toString() !== req.userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this shopping list'
            });
        }

        await ShoppingList.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Shopping list deleted successfully'
        });
    } catch (error) {
        console.error('Delete shopping list error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting shopping list',
            error: error.message
        });
    }
};
