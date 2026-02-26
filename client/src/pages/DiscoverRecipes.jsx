import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

const DiscoverRecipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAISearching, setIsAISearching] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [filters, setFilters] = useState({
    cuisine: '',
    dietaryRestrictions: [],
    maxCookingTime: ''
  });
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    // Fetch all recipes logic
  };

  const handleAISearch = async (query) => {
    if (!query || query.trim().length === 0) {
      // If empty, fetch all recipes
      fetchRecipes();
      setAiSuggestions(null);
      return;
    }

    setIsAISearching(true);
    setLoading(true);
    try {
      const params = new URLSearchParams({
        query: query.trim()
      });

      // Add optional filters if they exist
      if (filters.cuisine && filters.cuisine !== '') {
        params.append('cuisine', filters.cuisine);
      }
      if (filters.dietaryRestrictions && filters.dietaryRestrictions.length > 0) {
        params.append('dietaryRestrictions', filters.dietaryRestrictions.join(','));
      }
      if (filters.maxCookingTime && filters.maxCookingTime !== '') {
        params.append('cookingTime', filters.maxCookingTime);
      }

      const response = await api.get(`/recipes/ai-search?${params.toString()}`);

      console.log('✨ AI Search Response:', response.data);
      setRecipes(response.data.recipes || []);
      setAiSuggestions(response.data.aiSuggestions);
    } catch (error) {
      console.error('AI search failed:', error);
      toast.error('AI search failed, showing all recipes');
      fetchRecipes();
      setAiSuggestions(null);
    } finally {
      setIsAISearching(false);
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Debounce AI search
    const timeout = setTimeout(() => {
      handleAISearch(query);
    }, 800);

    setSearchTimeout(timeout);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setAiSuggestions(null);
    fetchRecipes();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 sm:mb-8 text-center sm:text-left">
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-gray-900 mb-2">Discover Recipes</h1>
        <div className="max-w-2xl mx-auto sm:mx-0 w-full mb-6">
          <div className="relative group">
            <input
              type="text"
              placeholder="🤖 Try: 'vegan dinner...'"
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-4 pr-12 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 transition-all text-sm sm:text-base"
            />
            {isAISearching && (
              <div className="absolute right-12 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-500 transition-colors"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {aiSuggestions && (
          <div className="bg-gradient-to-br from-primary-600 to-primary-800 p-4 sm:p-6 rounded-xl text-white shadow-lg mb-8">
            <p className="text-sm sm:text-base font-medium mb-3 flex items-center gap-2">
              <span className="text-xl">💡</span>
              {aiSuggestions.reasoning}
            </p>
            <div className="flex flex-wrap gap-2">
              {aiSuggestions.searchKeywords?.map((keyword, idx) => (
                <span key={idx} className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold border border-white/30">
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {recipes.map(recipe => (
          <div key={recipe._id} className="card-hover group">
            {/* Using the standard RecipeCard pattern logic */}
            <div className="relative h-48 overflow-hidden rounded-t-xl">
              <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 line-clamp-1">{recipe.title}</h3>
            </div>
          </div>
        ))}
      </div>

      {!loading && recipes.length === 0 && (
        <div className="no-recipes">
          <p>No recipes found</p>
          {(searchQuery || Object.values(filters).some(f => f && f.length > 0)) && (
            <>
              <p>Try adjusting your search or filters</p>
              <button onClick={handleClearSearch} className="show-all-btn">
                Show All Recipes
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default DiscoverRecipes;