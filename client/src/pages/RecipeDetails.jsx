import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { recipeService } from '../services/recipeService';
import { aiService } from '../services/aiService';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import AddToMealPlanModal from '../components/AddToMealPlanModal';
import { mealPlanService } from '../services/mealPlanService';
import { toast } from 'react-toastify';

const RecipeDetails = () => {
    const { id } = useParams();
    const location = useLocation();
    const { user } = useAuth();
    const [recipe, setRecipe] = useState(null);
    const [explanation, setExplanation] = useState(null);
    const [substitutions, setSubstitutions] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedIngredient, setSelectedIngredient] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadRecipe();
    }, [id]);

    const loadRecipe = async () => {
        try {
            // Check if recipe data was passed via navigation state (for AI-generated recipes)
            if (location.state?.recipe) {
                setRecipe(location.state.recipe);
                setLoading(false);
                return;
            }

            // Otherwise, fetch from database
            const data = await recipeService.getRecipeById(id);
            setRecipe(data.recipe);

            // Check if recipe is saved if user is logged in
            if (user && user.savedRecipes) {
                setIsSaved(user.savedRecipes.includes(id));
            }
        } catch (error) {
            console.error('Error loading recipe:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!user) {
            toast.info('Please log in to save recipes');
            return;
        }

        setSaving(true);
        try {
            const data = await recipeService.toggleSaveRecipe(recipe._id);
            setIsSaved(data.isSaved);
            toast.success(data.message);
        } catch (error) {
            toast.error('Failed to save recipe');
        } finally {
            setSaving(false);
        }
    };

    const handleAddToMealPlan = async (day, mealType) => {
        try {
            const data = await mealPlanService.addToPersonalMealPlan(recipe._id, day, mealType);
            toast.success(`Added to ${day} ${mealType}!`);
            return data;
        } catch (error) {
            toast.error('Failed to add to meal plan');
            throw error;
        }
    };

    const getExplanation = async () => {
        if (!recipe) return;
        try {
            // For AI-generated recipes, pass the full recipe data
            // For database recipes, pass the ID
            const data = recipe.isAIGenerated
                ? await aiService.explainRecipe(null, recipe)
                : await aiService.explainRecipe(recipe._id);
            setExplanation(data.explanation);
        } catch (error) {
            console.error('Error getting explanation:', error);
        }
    };

    const getSubstitution = async (ingredient) => {
        try {
            const data = await aiService.getSubstitutions(
                ingredient.name,
                user?.dietaryRestrictions || [],
                recipe.title,
                recipe.ingredients
            );
            setSubstitutions(prev => ({
                ...prev,
                [ingredient.name]: data.substitutions
            }));
            setSelectedIngredient(ingredient.name);
        } catch (error) {
            console.error('Error getting substitutions:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
                <LoadingSpinner size="lg" text="Loading recipe..." />
            </div>
        );
    }

    if (!recipe) {
        return (
            <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Recipe not found</h2>
                    <p className="text-gray-600">The recipe you're looking for doesn't exist.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-64px)] bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        {/* Header */}
                        <div className="card overflow-hidden mb-6">
                            <div className="h-64 sm:h-80 md:h-96 overflow-hidden">
                                <img
                                    src={recipe.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop'}
                                    alt={recipe.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop';
                                    }}
                                />
                            </div>

                            <div className="p-4 sm:p-6 md:p-8">
                                <div className="flex items-center gap-3 mb-4">
                                    {recipe.difficulty && (
                                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${recipe.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                                            recipe.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                            {recipe.difficulty}
                                        </span>
                                    )}
                                    {recipe.cuisine && (
                                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold capitalize">
                                            {recipe.cuisine}
                                        </span>
                                    )}
                                </div>

                                <h1 className="font-display font-bold text-gray-900 mb-4">
                                    {recipe.title}
                                </h1>

                                <p className="text-lg text-gray-600 mb-6">
                                    {recipe.description}
                                </p>

                                <div className="flex items-center gap-6 text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>{recipe.cookingTime} min</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        <span>{recipe.servings} servings</span>
                                    </div>
                                </div>

                                {recipe.dietaryTags && recipe.dietaryTags.length > 0 && (
                                    <div className="mt-6 flex flex-wrap gap-2">
                                        {recipe.dietaryTags.map((tag, index) => (
                                            <span
                                                key={index}
                                                className="px-3 py-1 bg-primary-50 text-primary-700 text-sm rounded-full font-medium"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Ingredients */}
                        <div className="card p-4 sm:p-6 md:p-8 mb-6">
                            <h2 className="font-semibold mb-4">Ingredients</h2>
                            <ul className="space-y-3">
                                {recipe.ingredients.map((ing, index) => (
                                    <li key={index} className="flex items-start justify-between group">
                                        <span className="flex-1">
                                            <span className="font-medium">{ing.quantity} {ing.unit}</span> {ing.name}
                                        </span>
                                        <button
                                            onClick={() => getSubstitution(ing)}
                                            className="text-primary-600 hover:text-primary-700 text-sm font-medium opacity-0 group-hover:opacity-100 transition"
                                        >
                                            Get Substitutes ✨
                                        </button>
                                    </li>
                                ))}
                            </ul>

                            {selectedIngredient && substitutions[selectedIngredient] && (
                                <div className="mt-6 p-4 bg-primary-50 rounded-lg border border-primary-200">
                                    <h3 className="font-semibold text-primary-900 mb-3">
                                        Substitutes for {selectedIngredient}:
                                    </h3>
                                    <div className="space-y-2">
                                        {substitutions[selectedIngredient].map((sub, index) => (
                                            <div key={index} className="text-sm">
                                                <span className="font-medium text-primary-900">{sub.substitute}</span>
                                                <span className="text-primary-700"> ({sub.ratio})</span>
                                                <p className="text-primary-600 text-xs mt-1">{sub.reason}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Instructions */}
                        <div className="card p-4 sm:p-6 md:p-8">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                                <h2 className="font-semibold">Instructions</h2>
                                {!explanation && (
                                    <button
                                        onClick={getExplanation}
                                        className="btn btn-outline text-sm"
                                    >
                                        Get AI Explanation ✨
                                    </button>
                                )}
                            </div>

                            {explanation ? (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="font-semibold text-lg mb-3">Simplified Steps:</h3>
                                        <ol className="space-y-3">
                                            {explanation.simplifiedSteps.map((step, index) => (
                                                <li key={index} className="flex gap-4">
                                                    <span className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-semibold">
                                                        {index + 1}
                                                    </span>
                                                    <span className="flex-1 pt-1">{step}</span>
                                                </li>
                                            ))}
                                        </ol>
                                    </div>

                                    {explanation.nutritionalHighlights && (
                                        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                            <h3 className="font-semibold text-green-900 mb-2">Nutritional Highlights:</h3>
                                            <p className="text-green-700 text-sm">{explanation.nutritionalHighlights}</p>
                                        </div>
                                    )}

                                    {explanation.tips && explanation.tips.length > 0 && (
                                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                            <h3 className="font-semibold text-blue-900 mb-2">Cooking Tips:</h3>
                                            <ul className="space-y-1">
                                                {explanation.tips.map((tip, index) => (
                                                    <li key={index} className="text-blue-700 text-sm flex gap-2">
                                                        <span>•</span>
                                                        <span>{tip}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <ol className="space-y-4">
                                    {recipe.instructions.map((instruction, index) => (
                                        <li key={index} className="flex gap-4">
                                            <span className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-semibold">
                                                {index + 1}
                                            </span>
                                            <span className="flex-1 pt-1">{instruction}</span>
                                        </li>
                                    ))}
                                </ol>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="card p-6 sticky top-24">
                            <h3 className="font-semibold text-lg mb-4">Recipe Info</h3>

                            <div className="space-y-4 text-sm">
                                <div>
                                    <span className="text-gray-600">Created by:</span>
                                    <div className="font-medium">
                                        {(recipe.source === 'ai' || recipe.isAIGenerated) ? (
                                            <span className="flex items-center gap-1 text-primary-600">
                                                <span>AI Generated</span>
                                                <span className="animate-pulse">✨</span>
                                            </span>
                                        ) : (
                                            recipe.createdBy?.username || 'Anonymous'
                                        )}
                                    </div>
                                </div>

                                {recipe.createdAt && (
                                    <div>
                                        <span className="text-gray-600">Added on:</span>
                                        <p className="font-medium">{new Date(recipe.createdAt).toLocaleDateString()}</p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <h4 className="font-semibold mb-3">Actions</h4>
                                <div className="space-y-2">
                                    <button
                                        onClick={() => setIsModalOpen(true)}
                                        className="btn btn-primary w-full text-sm"
                                    >
                                        Add to Meal Plan
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className={`btn w-full text-sm ${isSaved ? 'bg-primary-100 text-primary-700 border-primary-200' : 'btn-outline'}`}
                                    >
                                        {saving ? 'Processing...' : isSaved ? '✓ Saved' : 'Save Recipe'}
                                    </button>
                                </div>
                            </div>

                            <AddToMealPlanModal
                                isOpen={isModalOpen}
                                onClose={() => setIsModalOpen(false)}
                                onAdd={handleAddToMealPlan}
                                recipeTitle={recipe.title}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecipeDetails;
