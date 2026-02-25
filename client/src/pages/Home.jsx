import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { recipeService } from '../services/recipeService';
import RecipeCard from '../components/RecipeCard';
import LoadingSpinner from '../components/LoadingSpinner';

const Home = () => {
    const [selectedMode, setSelectedMode] = useState(null); // 'dish' or 'ingredient'
    const [query, setQuery] = useState('');
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const navigate = useNavigate();

    // Spotlight Zoom Refs
    const heroCircleRef = useRef(null);
    const heroImgRef = useRef(null);

    useEffect(() => {
        const circle = heroCircleRef.current;
        const img = heroImgRef.current;
        if (!circle || !img) return;

        // Disable on touch devices
        if (window.matchMedia("(pointer: coarse)").matches) return;

        const handleMouseMove = (e) => {
            const rect = circle.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;

            img.style.transformOrigin = `${x}% ${y}%`;
            img.style.transform = "scale(1.35)";
        };

        const handleMouseLeave = () => {
            img.style.transform = "scale(1)";
            img.style.transformOrigin = "center";
        };

        circle.addEventListener("mousemove", handleMouseMove);
        circle.addEventListener("mouseleave", handleMouseLeave);

        return () => {
            circle.removeEventListener("mousemove", handleMouseMove);
            circle.removeEventListener("mouseleave", handleMouseLeave);
        };
    }, []);

    const handleModeSelect = (mode) => {
        setSelectedMode(mode);
        setQuery('');
        setRecipes([]);
        setHasSearched(false);
    };

    const handleSearch = async (e, customQuery = null) => {
        if (e) e.preventDefault();
        const searchQuery = customQuery || query;
        if (!searchQuery.trim()) return;

        setLoading(true);
        setHasSearched(true);
        try {
            const data = await recipeService.searchRecipes(searchQuery);
            setRecipes(data.recipes || []);
        } catch (error) {
            console.error('Error searching recipes:', error);
            setRecipes([]);
        } finally {
            setLoading(false);
        }
    };

    const handleRecipeClick = (recipe) => {
        // For AI-generated recipes, pass the full recipe data via state
        if (recipe.isAIGenerated) {
            navigate(`/recipes/${recipe._id}`, { state: { recipe } });
        } else {
            navigate(`/recipes/${recipe._id}`);
        }
    };

    return (
        <div className="min-h-screen bg-white overflow-hidden">
            {/* Hero Section */}
            {!selectedMode && !hasSearched && (
                <div className="relative min-h-[85vh] flex items-center overflow-hidden">
                    {/* Background with Gradient Overlay */}
                    <div className="absolute inset-0 z-0">
                        <img
                            src="https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&q=80&w=2000"
                            alt="Healthy food background"
                            className="w-full h-full object-cover scale-105 blur-[2px]"
                        />
                        <div className="absolute inset-0 bg-black/50 bg-gradient-to-r from-black/70 to-transparent z-10"></div>

                        {/* Animated Gradient Blobs */}
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.3, 0.5, 0.3],
                                x: [0, 50, 0],
                                y: [0, 30, 0]
                            }}
                            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -top-24 -left-24 w-96 h-96 bg-primary-500/20 rounded-full blur-[100px] z-0"
                        />
                        <motion.div
                            animate={{
                                scale: [1.2, 1, 1.2],
                                opacity: [0.2, 0.4, 0.2],
                                x: [0, -40, 0],
                                y: [0, -20, 0]
                            }}
                            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -bottom-24 right-1/4 w-[500px] h-[500px] bg-primary-300/10 rounded-full blur-[120px] z-0"
                        />
                    </div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24 relative z-20 w-full">
                        <div className="grid lg:grid-cols-2 gap-12 items-center text-center lg:text-left">
                            {/* Left Side: Content */}
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className="flex flex-col items-center lg:items-start"
                            >
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2, duration: 0.6 }}
                                    className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full mb-6"
                                >
                                    <span className="flex h-2 w-2 rounded-full bg-primary-400 animate-pulse"></span>
                                    <span className="text-white text-xs sm:text-sm font-medium tracking-wide">AI-Powered Kitchen Assistant</span>
                                </motion.div>

                                <h1 className="font-display font-bold text-gray-900 mb-6 leading-tight text-white">
                                    Cook Smarter.<br />
                                    <span className="text-primary-400">Eat Better.</span>
                                </h1>
                                <p className="text-base sm:text-xl text-gray-200 mb-10 max-w-xl leading-relaxed mx-auto lg:mx-0">
                                    Discover AI-powered recipes tailored to your taste and turn your ingredients into delicious meals in seconds.
                                </p>

                                <div className="flex flex-col sm:flex-row flex-wrap justify-center lg:justify-start gap-4 mb-8 w-full sm:w-auto">
                                    <motion.button
                                        whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(34, 197, 94, 0.4)" }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleModeSelect('dish')}
                                        className="btn btn-primary text-base sm:text-lg px-8 py-4 rounded-xl flex items-center justify-center"
                                    >
                                        Start Cooking
                                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.05, background: "rgba(255, 255, 255, 0.1)" }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleModeSelect('ingredient')}
                                        className="px-8 py-4 rounded-xl border-2 border-white/30 text-white font-semibold backdrop-blur-sm transition-all text-base sm:text-lg"
                                    >
                                        Find Recipes
                                    </motion.button>
                                </div>

                                {/* Trust Line */}
                                <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 pt-4 border-t border-white/10 w-full">
                                    <div className="flex items-center space-x-2 text-gray-300 text-xs sm:text-sm">
                                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        <span>AI-powered plan</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-gray-300 text-xs sm:text-sm">
                                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        <span>Personalized diet</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-gray-300 text-xs sm:text-sm">
                                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        <span>Smart generation</span>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Right Side: Hero Image */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="hidden lg:flex justify-center relative pt-10"
                            >
                                <motion.div
                                    animate={{
                                        y: [0, -12, 0],
                                    }}
                                    transition={{
                                        duration: 7,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                    whileHover={{
                                        transition: { duration: 0.4, ease: "easeOut" }
                                    }}
                                    onHoverStart={() => {
                                        // Optional: logic to pause animation if needed, 
                                        // but Framer Motion handles standard animations smoothly.
                                        // We will use CSS to pause the animation if we use CSS animations.
                                        // For Framer, we just leave it or use a boolean state.
                                    }}
                                    className="relative z-10 group"
                                >
                                    <style>
                                        {`
                                            @keyframes floatSmooth {
                                                0% { transform: translateY(0px); }
                                                50% { transform: translateY(-12px); }
                                                100% { transform: translateY(0px); }
                                            }
                                            .hero-floating-container {
                                                animation: floatSmooth 7s ease-in-out infinite;
                                            }
                                            .hero-floating-container:hover {
                                                animation-play-state: paused;
                                            }
                                        `}
                                    </style>

                                    <div className="hero-floating-container">
                                        {/* Breathing Glow Effect */}
                                        <motion.div
                                            animate={{
                                                opacity: [0, 0.4, 0],
                                                scale: [0.95, 1.05, 0.95]
                                            }}
                                            transition={{
                                                duration: 6,
                                                repeat: Infinity,
                                                ease: "easeInOut"
                                            }}
                                            className="absolute -inset-8 bg-primary-500/20 blur-3xl rounded-full -z-10"
                                        />

                                        {/* Circular Frame with Shadow & Spotlight Zoom */}
                                        <div
                                            ref={heroCircleRef}
                                            className="w-[430px] h-[430px] rounded-full p-3 bg-gradient-to-tr from-primary-400/30 to-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-[0_30px_70px_rgba(0,0,0,0.28)] group-hover:shadow-[0_40px_90px_rgba(0,0,0,0.35)] transition-all duration-500 relative cursor-zoom-in overflow-hidden outline outline-0 group-hover:outline-[6px] outline-primary-500/35"
                                        >

                                            {/* Soft Green Glow Ring */}
                                            <div className="absolute inset-0 rounded-full border-[8px] border-primary-500/10 animate-pulse pointer-events-none"></div>
                                            <div className="absolute inset-2 rounded-full border border-primary-500/20 pointer-events-none"></div>

                                            <div className="w-full h-full rounded-full overflow-hidden border-4 border-white/30 relative shadow-inner">
                                                {/* Advanced Image Overlays */}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/10 z-10 pointer-events-none"></div>
                                                <div className="absolute inset-0 ring-inset ring-1 ring-white/20 z-10 rounded-full pointer-events-none"></div>

                                                <img
                                                    ref={heroImgRef}
                                                    src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=2500"
                                                    alt="Vibrant food spread"
                                                    className="w-full h-full object-cover transition-transform duration-200 ease-out will-change-transform"
                                                    loading="lazy"
                                                />
                                            </div>
                                        </div>

                                        {/* Floating Stats UI */}
                                        <motion.div
                                            animate={{ y: [0, 10, 0] }}
                                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                            className="absolute -top-4 -right-4 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white z-20 group-hover:-translate-y-2 transition-transform duration-500"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center">
                                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Smart Suggestions</p>
                                                    <p className="text-sm font-bold text-gray-900">100+ New Ideas</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </div>
                                </motion.div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            )}

            <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 ${!selectedMode && !hasSearched ? '-mt-24 relative z-30' : ''}`}>
                {/* Search Mode Selection Cards */}
                {!selectedMode && !hasSearched && (
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16"
                    >
                        {/* Option 1: Dish Search */}
                        <motion.button
                            whileHover={{
                                y: -10,
                                boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                                borderColor: "#22c55e"
                            }}
                            onClick={() => handleModeSelect('dish')}
                            className="card p-6 sm:p-10 bg-white/90 backdrop-blur-md border-2 border-transparent transition-all duration-300 text-left group shadow-lg rounded-3xl"
                        >
                            <div className="w-16 h-16 sm:w-20 sm:h-20 gradient-primary rounded-2xl flex items-center justify-center mb-6 sm:mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg shadow-primary-200">
                                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <h3 className="font-display font-bold text-2xl sm:text-3xl text-gray-900 mb-4">
                                I want to cook something
                            </h3>
                            <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-6 sm:mb-8">
                                Discover AI-generated recipes tailored to your taste and cravings.
                            </p>
                            <div className="flex items-center text-primary-600 font-bold text-base sm:text-lg group-hover:translate-x-2 transition-transform">
                                Get Started
                                <svg className="w-6 h-6 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </div>
                        </motion.button>

                        {/* Option 2: Ingredient Search */}
                        <motion.button
                            whileHover={{
                                y: -10,
                                boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                                borderColor: "#22c55e"
                            }}
                            onClick={() => handleModeSelect('ingredient')}
                            className="card p-6 sm:p-10 bg-white/90 backdrop-blur-md border-2 border-transparent transition-all duration-300 text-left group shadow-lg rounded-3xl"
                        >
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary-500 rounded-2xl flex items-center justify-center mb-6 sm:mb-8 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300 shadow-lg shadow-primary-200">
                                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </div>
                            <h3 className="font-display font-bold text-2xl sm:text-3xl text-gray-900 mb-4">
                                I already have ingredients
                            </h3>
                            <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-6 sm:mb-8">
                                Turn what’s in your fridge into a delicious meal in seconds.
                            </p>
                            <div className="flex items-center text-primary-600 font-bold text-base sm:text-lg group-hover:translate-x-2 transition-transform">
                                Get Started
                                <svg className="w-6 h-6 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </div>
                        </motion.button>
                    </motion.div>
                )}

                {/* Quick Categories */}
                {!selectedMode && !hasSearched && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1, duration: 1 }}
                        className="text-center mb-16"
                    >
                        <p className="text-gray-500 font-medium mb-6">Popular Categories</p>
                        <div className="flex flex-wrap justify-center gap-3">
                            {['🍛 Indian', '🥗 Healthy', '⚡ Quick Meals', '🥦 Vegetarian', '💪 High Protein'].map((cat) => (
                                <motion.button
                                    key={cat}
                                    whileHover={{ scale: 1.1, backgroundColor: '#dcfce7', color: '#16a34a' }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                        const queryText = cat.split(' ')[1];
                                        setSelectedMode('dish');
                                        setQuery(queryText);
                                        // Auto trigger search
                                        const pseudoEvent = { preventDefault: () => { } };
                                        setTimeout(() => handleSearch(pseudoEvent, queryText), 100);
                                    }}
                                    className="px-6 py-2 rounded-full border border-gray-200 text-gray-600 font-medium transition-colors bg-white shadow-sm"
                                >
                                    {cat}
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Search Input Section */}
                {selectedMode && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-3xl mx-auto mb-12"
                    >
                        <button
                            onClick={() => handleModeSelect(null)}
                            className="flex items-center text-gray-500 hover:text-primary-600 mb-8 transition-colors font-medium group"
                        >
                            <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back to choose mode
                        </button>

                        <div className="card p-10 shadow-2xl rounded-3xl border-0 overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-100/50 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                            <div className="max-w-2xl">
                                <h2 className="font-display font-bold text-2xl sm:text-3xl text-gray-900 mb-3 relative z-10">
                                    {selectedMode === 'dish' ? 'What do you feel like eating today?' : 'Ingredients in my kitchen'}
                                </h2>
                                <p className="text-gray-600 text-base sm:text-lg mb-8 relative z-10">
                                    {selectedMode === 'dish'
                                        ? 'Describe a dish, cuisine, or mood'
                                        : 'List ingredients separated by commas'}
                                </p>

                                <form onSubmit={(e) => handleSearch(e)} className="relative z-10">
                                    <div className="flex flex-col sm:block relative">
                                        <input
                                            type="text"
                                            value={query}
                                            onChange={(e) => setQuery(e.target.value)}
                                            placeholder={selectedMode === 'dish'
                                                ? 'e.g. Traditional Paneer Tikka...'
                                                : 'e.g. Chicken, Spinach, Cream...'}
                                            className="w-full pl-12 sm:pl-14 pr-4 sm:pr-32 py-4 sm:py-5 text-lg sm:text-xl bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-primary-500 focus:ring-0 transition-all outline-none"
                                            autoFocus
                                        />
                                        <div className="absolute left-4 sm:left-5 top-4 sm:top-1/2 sm:-translate-y-1/2">
                                            <svg className="w-6 h-6 sm:w-7 sm:h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={!query.trim() || loading}
                                            className="mt-4 sm:mt-0 sm:absolute sm:right-3 sm:top-1/2 sm:-translate-y-1/2 btn btn-primary w-full sm:w-auto px-8 py-3 rounded-xl disabled:opacity-50 text-base sm:text-lg font-bold"
                                        >
                                            Search
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Results Section */}
                <AnimatePresence>
                    {selectedMode && hasSearched && (
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 30 }}
                            className="max-w-7xl mx-auto mt-8"
                        >
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-20 space-y-6">
                                    <LoadingSpinner size="lg" />
                                    <p className="text-xl font-medium text-gray-600 animate-pulse">Designing your perfect recipes...</p>
                                </div>
                            ) : recipes.length > 0 ? (
                                <>
                                    <div className="flex items-center justify-between mb-10">
                                        <h3 className="font-display font-bold text-3xl text-gray-900">
                                            Hand-picked <span className="text-primary-600">{recipes.length}</span> recipes
                                        </h3>
                                    </div>
                                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                        {recipes.map((recipe, index) => (
                                            <motion.div
                                                key={recipe._id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                                onClick={() => handleRecipeClick(recipe)}
                                                className="cursor-pointer"
                                            >
                                                <RecipeCard recipe={recipe} />
                                            </motion.div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 max-w-2xl mx-auto">
                                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-3">No recipes found</h3>
                                    <p className="text-gray-500 text-lg mb-8">Try adjusting your search terms or adding more ingredients</p>
                                    <button
                                        onClick={() => {
                                            setQuery('');
                                            setHasSearched(false);
                                        }}
                                        className="btn btn-primary px-10 py-4 text-lg"
                                    >
                                        Try Another Search
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Home;
