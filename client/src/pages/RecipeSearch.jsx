import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { recipeService } from '../services/recipeService';
import RecipeCard from '../components/RecipeCard';
import SearchBar from '../components/SearchBar';
import LoadingSpinner from '../components/LoadingSpinner';

const RecipeSearch = () => {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchMode, setSearchMode] = useState('browse'); // 'browse' or 'ai'
    const [filters, setFilters] = useState({
        cuisine: '',
        difficulty: '',
        dietaryTags: '',
        maxCookingTime: ''
    });
    const navigate = useNavigate();

    useEffect(() => {
        loadRecipes();
    }, []);

    const loadRecipes = async (params = {}) => {
        setLoading(true);
        try {
            const data = await recipeService.getRecipes(params);
            setRecipes(data.recipes || []);
        } catch (error) {
            console.error('Error loading recipes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAISearch = async (query) => {
        setSearchMode('ai');
        setLoading(true);
        try {
            const data = await recipeService.searchRecipes(query);
            setRecipes(data.recipes || []);
        } catch (error) {
            console.error('Error searching recipes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const applyFilters = () => {
        const params = {};
        Object.keys(filters).forEach(key => {
            if (filters[key]) {
                params[key] = filters[key];
            }
        });
        setSearchMode('browse');
        loadRecipes(params);
    };

    const clearFilters = () => {
        setFilters({
            cuisine: '',
            difficulty: '',
            dietaryTags: '',
            maxCookingTime: ''
        });
        setSearchMode('browse');
        loadRecipes();
    };

    return (
        <div className="min-h-[calc(100vh-64px)] bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <h1 className="font-display font-bold text-2xl sm:text-3xl text-gray-900 mb-4">
                        Discover Recipes
                    </h1>

                    {/* AI Search */}
                    <div className="mb-6">
                        <SearchBar
                            onSearch={handleAISearch}
                            placeholder="Try: 'vegan dinner with chickpeas' or 'quick keto breakfast'"
                        />
                    </div>

                    {/* Filters */}
                    <div className="card p-4 sm:p-6 mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-lg">Filters</h3>
                            <button onClick={clearFilters} className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                                Clear All
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Cuisine</label>
                                <select
                                    name="cuisine"
                                    value={filters.cuisine}
                                    onChange={handleFilterChange}
                                    className="input text-sm"
                                >
                                    <option value="">All Cuisines</option>
                                    <option value="italian">Italian</option>
                                    <option value="chinese">Chinese</option>
                                    <option value="indian">Indian</option>
                                    <option value="mexican">Mexican</option>
                                    <option value="japanese">Japanese</option>
                                    <option value="thai">Thai</option>
                                    <option value="mediterranean">Mediterranean</option>
                                    <option value="american">American</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                                <select
                                    name="difficulty"
                                    value={filters.difficulty}
                                    onChange={handleFilterChange}
                                    className="input text-sm"
                                >
                                    <option value="">All Levels</option>
                                    <option value="easy">Easy</option>
                                    <option value="medium">Medium</option>
                                    <option value="hard">Hard</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Dietary Tags</label>
                                <select
                                    name="dietaryTags"
                                    value={filters.dietaryTags}
                                    onChange={handleFilterChange}
                                    className="input text-sm"
                                >
                                    <option value="">All Diets</option>
                                    <option value="vegan">Vegan</option>
                                    <option value="vegetarian">Vegetarian</option>
                                    <option value="gluten-free">Gluten-Free</option>
                                    <option value="keto">Keto</option>
                                    <option value="paleo">Paleo</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Max Cooking Time (min)</label>
                                <input
                                    type="number"
                                    name="maxCookingTime"
                                    value={filters.maxCookingTime}
                                    onChange={handleFilterChange}
                                    placeholder="e.g., 30"
                                    className="input text-sm"
                                />
                            </div>
                        </div>

                        <div className="mt-6">
                            <button onClick={applyFilters} className="btn btn-primary w-full sm:w-auto">
                                Apply Filters
                            </button>
                        </div>
                    </div>
                </div>

                {/* Results */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <LoadingSpinner size="lg" text="Loading recipes..." />
                    </div>
                ) : recipes.length > 0 ? (
                    <>
                        <div className="flex items-center justify-between mb-6">
                            <p className="text-gray-600">
                                Found <span className="font-semibold text-gray-900">{recipes.length}</span> recipes
                                {searchMode === 'ai' && <span className="text-primary-600 ml-2">✨ AI-powered search</span>}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {recipes.map(recipe => (
                                <RecipeCard key={recipe._id} recipe={recipe} />
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="text-center py-12">
                        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No recipes found</h3>
                        <p className="text-gray-600 mb-4">Try adjusting your search or filters</p>
                        <button onClick={clearFilters} className="btn btn-primary">
                            Show All Recipes
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecipeSearch;
