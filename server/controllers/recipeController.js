import Recipe from '../models/Recipe.js';
import User from '../models/User.js';
import geminiService from '../services/geminiService.js';
import mongoose from 'mongoose';

/**
 * Get all recipes with optional filtering
 * GET /api/recipes
 */
export const getRecipes = async (req, res) => {
    try {
        const {
            cuisine,
            difficulty,
            dietaryTags,
            maxCookingTime,
            page = 1,
            limit = 12
        } = req.query;

        // Build filter object
        const filter = {};
        if (cuisine) filter.cuisine = cuisine;
        if (difficulty) filter.difficulty = difficulty;
        if (dietaryTags) {
            const tags = dietaryTags.split(',');
            filter.dietaryTags = { $all: tags };
        }
        if (maxCookingTime) filter.cookingTime = { $lte: parseInt(maxCookingTime) };

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const recipes = await Recipe.find(filter)
            .populate('createdBy', 'username')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Recipe.countDocuments(filter);

        res.status(200).json({
            success: true,
            count: recipes.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            recipes
        });
    } catch (error) {
        console.error('Get recipes error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching recipes',
            error: error.message
        });
    }
};

/**
 * AI-powered natural language recipe search
 * POST /api/recipes/search
 */
export const searchRecipes = async (req, res) => {
    try {
        const { query } = req.body;

        if (!query) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }

        console.log('🔍 Searching for:', query);

        // Use Gemini AI to parse the query
        const parsedQuery = await geminiService.parseRecipeQuery(query);

        // Build MongoDB filter from parsed query
        const filter = {};

        if (parsedQuery.cuisine) {
            filter.cuisine = parsedQuery.cuisine;
        }

        if (parsedQuery.difficulty) {
            filter.difficulty = parsedQuery.difficulty;
        }

        if (parsedQuery.dietaryRestrictions && parsedQuery.dietaryRestrictions.length > 0) {
            filter.dietaryTags = { $all: parsedQuery.dietaryRestrictions };
        }

        if (parsedQuery.cookingTime) {
            filter.cookingTime = { $lte: parsedQuery.cookingTime };
        }

        // If ingredients were specified, use text search
        let recipes;
        if (parsedQuery.ingredients && parsedQuery.ingredients.length > 0) {
            const ingredientQuery = parsedQuery.ingredients.join(' ');
            recipes = await Recipe.find({
                ...filter,
                $text: { $search: ingredientQuery }
            })
                .populate('createdBy', 'username')
                .limit(20);
        } else {
            // Search by title and description using regex
            const searchRegex = new RegExp(query, 'i');
            recipes = await Recipe.find({
                ...filter,
                $or: [
                    { title: searchRegex },
                    { description: searchRegex }
                ]
            })
                .populate('createdBy', 'username')
                .limit(20);
        }

        console.log(`📊 Found ${recipes.length} recipes in database`);

        // AI FALLBACK: If we have fewer than 3 recipes, generate more with AI
        const MIN_RESULTS = 3;
        let aiGeneratedRecipes = [];

        if (recipes.length < MIN_RESULTS) {
            const recipesToGenerate = MIN_RESULTS - recipes.length;
            console.log(`🤖 Generating ${recipesToGenerate} AI recipes to supplement results...`);

            try {
                const rawAiRecipes = await geminiService.generateRecipe(query, recipesToGenerate);

                // Get a demo user ID to attribute recipes to (or use req.userId if available)
                const creatorId = req.userId || (await User.findOne({ email: 'demo@example.com' }))?._id;

                // Persist AI recipes to database
                const persistedAiRecipes = await Promise.all(rawAiRecipes.map(async (recipeData) => {
                    try {
                        return await Recipe.create({
                            ...recipeData,
                            createdBy: creatorId
                        });
                    } catch (dbError) {
                        console.error('❌ Failed to persist AI recipe:', dbError.message);
                        return null;
                    }
                }));

                aiGeneratedRecipes = persistedAiRecipes.filter(r => r !== null);
                console.log(`✨ Successfully generated and persisted ${aiGeneratedRecipes.length} AI recipes`);
            } catch (aiError) {
                console.error('⚠️ AI generation failed, continuing with database results only:', aiError.message);
            }
        }

        // Combine database and AI-generated recipes
        const allRecipes = [...recipes, ...aiGeneratedRecipes];

        res.status(200).json({
            success: true,
            query: query,
            parsedQuery,
            count: allRecipes.length,
            databaseCount: recipes.length,
            aiGeneratedCount: aiGeneratedRecipes.length,
            recipes: allRecipes
        });
    } catch (error) {
        console.error('Search recipes error:', error);
        res.status(500).json({
            success: false,
            message: 'Error searching recipes',
            error: error.message
        });
    }
};

/**
 * Get single recipe by ID
 * GET /api/recipes/:id
 */
export const getRecipeById = async (req, res) => {
    try {
        const { id } = req.params;

        // Validation for ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({
                success: false,
                message: 'Invalid recipe ID format'
            });
        }

        const recipe = await Recipe.findById(id)
            .populate('createdBy', 'username email');

        if (!recipe) {
            return res.status(404).json({
                success: false,
                message: 'Recipe not found'
            });
        }

        res.status(200).json({
            success: true,
            recipe
        });
    } catch (error) {
        console.error('Get recipe error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching recipe',
            error: error.message
        });
    }
};

/**
 * Create new recipe
 * POST /api/recipes
 */
export const createRecipe = async (req, res) => {
    try {
        const recipeData = {
            ...req.body,
            createdBy: req.userId
        };

        const recipe = await Recipe.create(recipeData);

        res.status(201).json({
            success: true,
            message: 'Recipe created successfully',
            recipe
        });
    } catch (error) {
        console.error('Create recipe error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating recipe',
            error: error.message
        });
    }
};

/**
 * Update recipe
 * PUT /api/recipes/:id
 */
export const updateRecipe = async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);

        if (!recipe) {
            return res.status(404).json({
                success: false,
                message: 'Recipe not found'
            });
        }

        // Check if user owns the recipe
        if (recipe.createdBy.toString() !== req.userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this recipe'
            });
        }

        const updatedRecipe = await Recipe.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Recipe updated successfully',
            recipe: updatedRecipe
        });
    } catch (error) {
        console.error('Update recipe error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating recipe',
            error: error.message
        });
    }
};

/**
 * Delete recipe
 * DELETE /api/recipes/:id
 */
export const deleteRecipe = async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);

        if (!recipe) {
            return res.status(404).json({
                success: false,
                message: 'Recipe not found'
            });
        }

        // Check if user owns the recipe
        if (recipe.createdBy.toString() !== req.userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this recipe'
            });
        }

        await Recipe.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Recipe deleted successfully'
        });
    } catch (error) {
        console.error('Delete recipe error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting recipe',
            error: error.message
        });
    }
};

/**
 * AI-powered recipe search
 * GET /api/recipes/ai-search
 */
export const aiSearchRecipes = async (req, res) => {
    try {
        const { query, dietaryRestrictions, cuisine, cookingTime } = req.query;

        if (!query || query.trim().length === 0) {
            return res.status(400).json({ message: 'Search query is required' });
        }

        console.log('🤖 AI-powered recipe search for:', query);

        // Get AI suggestions
        const aiSuggestions = await geminiService.searchRecipesWithAI(query, {
            dietaryRestrictions: dietaryRestrictions ? dietaryRestrictions.split(',') : [],
            cuisine,
            cookingTime
        });

        console.log('✨ AI Search Suggestions:', aiSuggestions);

        // STEP 1: Search with ONLY the original user query (strict search)
        const strictSearchConditions = [
            { title: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } },
            { ingredients: { $elemMatch: { name: { $regex: query, $options: 'i' } } } }
        ];

        const strictSearchQuery = { $or: strictSearchConditions };

        // Apply additional filters to strict search
        if (dietaryRestrictions) {
            const restrictions = dietaryRestrictions.split(',');
            strictSearchQuery.dietaryRestrictions = { $all: restrictions };
        }
        if (cuisine) {
            strictSearchQuery.cuisine = { $regex: cuisine, $options: 'i' };
        }
        if (cookingTime) {
            strictSearchQuery.cookingTime = { $lte: parseInt(cookingTime) };
        }

        const strictRecipes = await Recipe.find(strictSearchQuery)
            .populate('author', 'username email')
            .sort({ createdAt: -1 })
            .limit(50);

        console.log(`✅ Found ${strictRecipes.length} recipes with strict search`);

        // AI FALLBACK: If we have fewer than 3 recipes, generate more with AI
        const MIN_RESULTS = 3;
        let aiGeneratedRecipes = [];

        if (strictRecipes.length < MIN_RESULTS) {
            const recipesToGenerate = MIN_RESULTS - strictRecipes.length;
            console.log(`🤖 Strict search returned only ${strictRecipes.length} recipes. Generating ${recipesToGenerate} AI recipes...`);

            try {
                const rawAiRecipes = await geminiService.generateRecipe(query, recipesToGenerate);

                // Get a creator ID
                const creatorId = req.userId || (await User.findOne({ email: 'demo@example.com' }))?._id;

                // Persist AI recipes to database
                const persistedAiRecipes = await Promise.all(rawAiRecipes.map(async (recipeData) => {
                    try {
                        return await Recipe.create({
                            ...recipeData,
                            createdBy: creatorId
                        });
                    } catch (dbError) {
                        console.error('❌ Failed to persist AI recipe in AI search:', dbError.message);
                        return null;
                    }
                }));

                aiGeneratedRecipes = persistedAiRecipes.filter(r => r !== null);
                console.log(`✨ Successfully generated and persisted ${aiGeneratedRecipes.length} AI recipes for AI search`);
            } catch (aiError) {
                console.error('⚠️ AI generation failed, continuing with database results only:', aiError.message);
            }
        }

        // Combine database and AI-generated recipes
        const allRecipes = [...strictRecipes, ...aiGeneratedRecipes];

        res.json({
            recipes: allRecipes,
            aiSuggestions,
            totalResults: allRecipes.length,
            databaseCount: strictRecipes.length,
            aiGeneratedCount: aiGeneratedRecipes.length
        });
    } catch (error) {
        console.error('❌ AI search error:', error);
        res.status(500).json({
            message: 'Error performing AI search',
            error: error.message
        });
    }
};

/**
 * Toggle save recipe for user
 * POST /api/recipes/:id/save
 */
export const toggleSaveRecipe = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        const recipeId = req.params.id;

        // Validation for ObjectId
        if (!mongoose.Types.ObjectId.isValid(recipeId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid recipe ID'
            });
        }

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const isSaved = user.savedRecipes.includes(recipeId);

        if (isSaved) {
            // Unsave
            user.savedRecipes = user.savedRecipes.filter(id => id.toString() !== recipeId);
            await user.save();
            res.status(200).json({
                success: true,
                message: 'Recipe removed from saved collection',
                isSaved: false
            });
        } else {
            // Save
            user.savedRecipes.push(recipeId);
            await user.save();
            res.status(200).json({
                success: true,
                message: 'Recipe saved to collection',
                isSaved: true
            });
        }
    } catch (error) {
        console.error('Toggle save recipe error:', error);
        res.status(500).json({
            success: false,
            message: 'Error toggling save recipe',
            error: error.message
        });
    }
};

/**
 * Get user's saved recipes
 * GET /api/recipes/saved
 */
export const getSavedRecipes = async (req, res) => {
    try {
        const user = await User.findById(req.userId).populate({
            path: 'savedRecipes',
            populate: { path: 'createdBy', select: 'username' }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            count: user.savedRecipes.length,
            recipes: user.savedRecipes
        });
    } catch (error) {
        console.error('Get saved recipes error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching saved recipes',
            error: error.message
        });
    }
};
