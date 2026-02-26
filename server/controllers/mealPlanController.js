import MealPlan from '../models/MealPlan.js';
import Recipe from '../models/Recipe.js';
import User from '../models/User.js';
import geminiService from '../services/geminiService.js';
import mongoose from 'mongoose';

/**
 * Get user's meal plans
 * GET /api/mealplans
 */
export const getMealPlans = async (req, res) => {
    try {
        const mealPlans = await MealPlan.find({ userId: req.userId })
            .populate({
                path: 'meals.breakfast meals.lunch meals.dinner meals.snacks',
                select: 'title imageUrl cookingTime servings'
            })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: mealPlans.length,
            mealPlans
        });
    } catch (error) {
        console.error('Get meal plans error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching meal plans',
            error: error.message
        });
    }
};

/**
 * Get single meal plan by ID
 * GET /api/mealplans/:id
 */
export const getMealPlanById = async (req, res) => {
    try {
        const mealPlan = await MealPlan.findById(req.params.id)
            .populate({
                path: 'meals.breakfast meals.lunch meals.dinner meals.snacks'
            });

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

        res.status(200).json({
            success: true,
            mealPlan
        });
    } catch (error) {
        console.error('Get meal plan error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching meal plan',
            error: error.message
        });
    }
};

/**
 * Create manual meal plan
 * POST /api/mealplans
 */
export const createMealPlan = async (req, res) => {
    try {
        const mealPlanData = {
            ...req.body,
            userId: req.userId
        };

        const mealPlan = await MealPlan.create(mealPlanData);

        res.status(201).json({
            success: true,
            message: 'Meal plan created successfully',
            mealPlan
        });
    } catch (error) {
        console.error('Create meal plan error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating meal plan',
            error: error.message
        });
    }
};

/**
 * Generate AI-powered meal plan
 * POST /api/mealplans/generate
 */
export const generateMealPlan = async (req, res) => {
    try {
        const { days = 7, title = 'AI Generated Meal Plan' } = req.body;

        // Get user preferences
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get recipes matching user preferences
        let query = {};
        if (user.dietaryRestrictions && user.dietaryRestrictions.length > 0) {
            query.dietaryTags = { $in: user.dietaryRestrictions };
        }

        let allRecipes = await Recipe.find(query);

        // If no recipes match restrictions, fallback to all recipes to ensure a plan can be made
        if (allRecipes.length < 5) {
            allRecipes = await Recipe.find({});
        }

        if (allRecipes.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No recipes found. Please add some recipes first.'
            });
        }

        // Check if we have enough recipes for unique meals
        const totalMealsNeeded = days * 3; // breakfast, lunch, dinner for each day
        if (allRecipes.length < totalMealsNeeded) {
            console.log(`Warning: Only ${allRecipes.length} recipes available for ${totalMealsNeeded} meals. Some recipes will repeat.`);
        }

        // Generate meal plan using AI
        const aiParams = {
            days,
            dietaryRestrictions: user.dietaryRestrictions,
            allergies: user.allergies,
            cuisinePreferences: user.cuisinePreferences
        };

        console.log('🤖 Generating AI meal plan with Gemini...');
        const aiGeneratedPlan = await geminiService.generateMealPlan(aiParams, allRecipes);

        const meals = aiGeneratedPlan.map(dayPlan => ({
            day: dayPlan.day,
            breakfast: dayPlan.breakfastId,
            lunch: dayPlan.lunchId,
            dinner: dayPlan.dinnerId,
            snacks: []
        }));

        // Generate meal plan dates
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + days - 1);



        // Create meal plan
        const mealPlan = await MealPlan.create({
            userId: req.userId,
            title,
            startDate,
            endDate,
            meals,
            generatedByAI: true
        });

        const populatedMealPlan = await MealPlan.findById(mealPlan._id)
            .populate({
                path: 'meals.breakfast meals.lunch meals.dinner meals.snacks'
            });

        res.status(201).json({
            success: true,
            message: 'AI meal plan generated successfully',
            mealPlan: populatedMealPlan
        });
    } catch (error) {
        console.error('Generate meal plan error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating meal plan',
            error: error.message
        });
    }
};

/**
 * Update meal plan
 * PUT /api/mealplans/:id
 */
export const updateMealPlan = async (req, res) => {
    try {
        const mealPlan = await MealPlan.findById(req.params.id);

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
                message: 'Not authorized to update this meal plan'
            });
        }

        const updatedMealPlan = await MealPlan.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate({
            path: 'meals.breakfast meals.lunch meals.dinner meals.snacks'
        });

        res.status(200).json({
            success: true,
            message: 'Meal plan updated successfully',
            mealPlan: updatedMealPlan
        });
    } catch (error) {
        console.error('Update meal plan error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating meal plan',
            error: error.message
        });
    }
};

/**
 * Delete meal plan
 * DELETE /api/mealplans/:id
 */
export const deleteMealPlan = async (req, res) => {
    try {
        const mealPlan = await MealPlan.findById(req.params.id);

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
                message: 'Not authorized to delete this meal plan'
            });
        }

        await MealPlan.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Meal plan deleted successfully'
        });
    } catch (error) {
        console.error('Delete meal plan error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting meal plan',
            error: error.message
        });
    }
};

/**
 * Add recipe to personal meal plan
 * POST /api/mealplans/personal/add
 */
export const addToPersonalMealPlan = async (req, res) => {
    try {
        const { recipeId, day, mealType } = req.body;

        if (!recipeId || !day || !mealType) {
            return res.status(400).json({
                success: false,
                message: 'Recipe ID, day, and meal type are required'
            });
        }

        // Validation for ObjectId or AI string ID
        const isValidId = mongoose.Types.ObjectId.isValid(recipeId) || recipeId.startsWith('ai-');
        if (!isValidId) {
            return res.status(400).json({
                success: false,
                message: 'Invalid recipe ID format'
            });
        }

        // Find current manual meal plan or create one for this week
        // We'll simplify: Find the latest non-AI meal plan
        let mealPlan = await MealPlan.findOne({
            userId: req.userId,
            generatedByAI: false
        }).sort({ createdAt: -1 });

        if (!mealPlan) {
            // Create a new manual plan starting today for 7 days
            const startDate = new Date();
            const endDate = new Date();
            endDate.setDate(startDate.getDate() + 6);

            const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            const meals = days.map(d => ({
                day: d,
                breakfast: null,
                lunch: null,
                dinner: null,
                snacks: []
            }));

            mealPlan = await MealPlan.create({
                userId: req.userId,
                title: 'My Personal Meal Plan',
                startDate,
                endDate,
                meals,
                generatedByAI: false
            });
        }

        // Find the day in the meal plan
        const dayIdx = mealPlan.meals.findIndex(m => m.day.toLowerCase() === day.toLowerCase());
        if (dayIdx === -1) {
            return res.status(400).json({
                success: false,
                message: 'Invalid day'
            });
        }

        // Update the specific meal slot
        const type = mealType.toLowerCase();
        if (['breakfast', 'lunch', 'dinner'].includes(type)) {
            mealPlan.meals[dayIdx][type] = recipeId;
        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid meal type'
            });
        }

        await mealPlan.save();

        res.status(200).json({
            success: true,
            message: `Added to ${day} ${mealType}`,
            mealPlan
        });
    } catch (error) {
        console.error('Add to personal meal plan error:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding to personal meal plan',
            error: error.message
        });
    }
};

/**
 * Get user's current personal meal plan
 * GET /api/mealplans/personal
 */
export const getPersonalMealPlan = async (req, res) => {
    try {
        const mealPlan = await MealPlan.findOne({
            userId: req.userId,
            generatedByAI: false
        })
            .populate({
                path: 'meals.breakfast meals.lunch meals.dinner meals.snacks',
                select: 'title imageUrl cookingTime servings'
            })
            .sort({ createdAt: -1 });

        if (!mealPlan) {
            return res.status(200).json({
                success: true,
                message: 'No personal meal plan found',
                mealPlan: null
            });
        }

        res.status(200).json({
            success: true,
            mealPlan
        });
    } catch (error) {
        console.error('Get personal meal plan error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching personal meal plan',
            error: error.message
        });
    }
};
