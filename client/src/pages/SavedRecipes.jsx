import { useState, useEffect } from 'react';
import { recipeService } from '../services/recipeService';
import RecipeCard from '../components/RecipeCard';
import { toast } from 'react-toastify';

const SavedRecipes = () => {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchSavedRecipes = async () => {
        try {
            setLoading(true);
            const data = await recipeService.getSavedRecipes();
            setRecipes(data.recipes);
        } catch (error) {
            console.error('Error fetching saved recipes:', error);
            toast.error('Failed to load saved recipes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSavedRecipes();
    }, []);

    // Function to handle removal from list (passed to or handled via re-fetch)
    // Actually, RecipeCard already handles the heart toggle. 
    // To make the SavedRecipes page responsive to removals, we might want to pass a callback or use a shared state.
    // For now, if someone un-hearts in this page, they might want to see it disappear.

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
                    <p className="mt-4 text-gray-600 font-medium">Loading your favorites...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="mb-8">
                <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Saved Recipes</h1>
                <p className="text-gray-600">All your favorite recipes in one place.</p>
            </div>

            {recipes.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                    <div className="w-24 h-24 bg-primary-50 rounded-full flex items-center justify-center mb-6">
                        <svg className="w-12 h-12 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">No saved recipes yet</h2>
                    <p className="text-gray-500 max-w-sm mb-8">
                        Save recipes to access them quickly. Your favorites will appear here!
                    </p>
                    <a
                        href="/recipes"
                        className="btn btn-primary px-8 py-3"
                    >
                        Explore Recipes
                    </a>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
                    {recipes.map((recipe) => (
                        <RecipeCard key={recipe._id} recipe={recipe} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default SavedRecipes;
