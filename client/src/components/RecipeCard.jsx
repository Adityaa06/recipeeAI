import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { recipeService } from '../services/recipeService';
import { toast } from 'react-toastify';

const RecipeCard = ({ recipe }) => {
    const { user } = useAuth();
    const [imageLoaded, setImageLoaded] = useState(false);
    const [isSaved, setIsSaved] = useState(user?.savedRecipes?.includes(recipe._id.toString()) || false);
    const [saving, setSaving] = useState(false);
    const defaultImage = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop';

    const handleSave = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            toast.info('Please log in to save recipes');
            return;
        }

        setSaving(true);
        try {
            const data = await recipeService.toggleSaveRecipe(recipe._id);
            setIsSaved(data.saved);
            toast.success(data.message, {
                icon: data.saved ? '❤️' : '🗑️'
            });
        } catch (error) {
            toast.error('Failed to update favorites');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Link
            to={`/recipes/${recipe._id}`}
            state={recipe.isAIGenerated ? { recipe } : undefined}
            className="card-hover group"
        >
            <div className="relative overflow-hidden h-40 sm:h-48 bg-gray-200">
                {/* Loading Skeleton */}
                {!imageLoaded && (
                    <div className="absolute inset-0 animate-pulse bg-gray-300 flex items-center justify-center">
                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                )}

                <img
                    src={recipe.imageUrl || defaultImage}
                    alt={recipe.title}
                    className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={() => setImageLoaded(true)}
                    onError={(e) => {
                        e.target.src = defaultImage;
                        setImageLoaded(true);
                    }}
                />

                {/* AI Badge */}
                {(recipe.source === 'ai' || recipe.isAIGenerated) && (
                    <div className="absolute top-3 left-3">
                        <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-primary-600 text-[10px] font-bold rounded-md shadow-sm border border-primary-100 flex items-center gap-1">
                            <span>AI</span>
                            <span className="animate-pulse">✨</span>
                        </span>
                    </div>
                )}

                {recipe.difficulty && (
                    <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${recipe.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                            recipe.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                            }`}>
                            {recipe.difficulty}
                        </span>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className={`p-2 rounded-full shadow-lg transition-all duration-300 transform active:scale-95 ${isSaved
                                ? 'bg-red-500 text-white hover:bg-red-600'
                                : 'bg-white/90 text-gray-400 hover:text-red-500 hover:bg-white backdrop-blur-sm'
                                }`}
                            title={isSaved ? "Remove from Saved" : "Save Recipe"}
                        >
                            <svg
                                className={`w-5 h-5 transition-colors duration-300 ${isSaved ? 'fill-current' : 'fill-none'}`}
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>

            <div className="p-5">
                <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition">
                    {recipe.title}
                </h3>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {recipe.description}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{recipe.cookingTime} min</span>
                    </div>

                    <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span>{recipe.servings} servings</span>
                    </div>
                </div>

                {recipe.dietaryTags && recipe.dietaryTags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                        {recipe.dietaryTags.slice(0, 3).map((tag, index) => (
                            <span
                                key={index}
                                className="px-2 py-1 bg-primary-50 text-primary-700 text-xs rounded-full font-medium"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </Link>
    );
};

export default RecipeCard;
