import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { mealPlanService } from '../services/mealPlanService';
import { shoppingListService } from '../services/shoppingListService';
import { recipeService } from '../services/recipeService';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        mealPlans: 0,
        shoppingLists: 0,
        recentRecipes: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const [mealPlansData, shoppingListsData, recipesData] = await Promise.all([
                mealPlanService.getMealPlans(),
                shoppingListService.getShoppingLists(),
                recipeService.getRecipes({ limit: 6 })
            ]);

            setStats({
                mealPlans: mealPlansData.count || 0,
                shoppingLists: shoppingListsData.count || 0,
                recentRecipes: recipesData.recipes || []
            });
        } catch (error) {
            console.error('Error loading dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
                <LoadingSpinner size="lg" text="Loading dashboard..." />
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-64px)] bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Welcome Section */}
                <div className="mb-6 sm:mb-8">
                    <h1 className="font-display font-bold text-2xl sm:text-3xl text-gray-900 mb-2">
                        Welcome back, {user?.username}! 👋
                    </h1>
                    <p className="text-gray-600 text-sm sm:text-base">
                        Your personalized cooking dashboard
                    </p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
                    <div className="card p-4 sm:p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-xs sm:text-sm mb-1">Active Meal Plans</p>
                                <p className="font-bold text-2xl sm:text-3xl text-gray-900">{stats.mealPlans}</p>
                            </div>
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="card p-4 sm:p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-xs sm:text-sm mb-1">Shopping Lists</p>
                                <p className="font-bold text-2xl sm:text-3xl text-gray-900">{stats.shoppingLists}</p>
                            </div>
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-secondary-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="card p-4 sm:p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-xs sm:text-sm mb-1">Dietary Preferences</p>
                                <p className="font-bold text-2xl sm:text-3xl text-gray-900">
                                    {user?.dietaryRestrictions?.length || 0}
                                </p>
                            </div>
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="card p-4 sm:p-6 mb-8">
                    <h2 className="font-semibold text-lg sm:text-xl mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                        <Link to="/recipes" className="btn btn-outline flex items-center justify-center gap-2 text-xs sm:text-sm py-2.5">
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            Find Recipes
                        </Link>

                        <Link to="/meal-planner" className="btn btn-outline flex items-center justify-center gap-2 text-xs sm:text-sm py-2.5">
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Plan Meals
                        </Link>

                        <Link to="/shopping-list" className="btn btn-outline flex items-center justify-center gap-2 text-xs sm:text-sm py-2.5">
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            Shopping List
                        </Link>

                        <Link to="/profile" className="btn btn-outline flex items-center justify-center gap-2 text-xs sm:text-sm py-2.5">
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            My Profile
                        </Link>
                    </div>
                </div>

                {/* Recent Recipes */}
                {stats.recentRecipes.length > 0 && (
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-semibold text-xl">Explore Recipes</h2>
                            <Link to="/recipes" className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                                View All →
                            </Link>
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {stats.recentRecipes.map(recipe => (
                                <Link key={recipe._id} to={`/recipes/${recipe._id}`} className="card-hover">
                                    <div className="h-48 overflow-hidden">
                                        <img
                                            src={recipe.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop'}
                                            alt={recipe.title}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop';
                                            }}
                                        />
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-semibold text-gray-900 mb-2">{recipe.title}</h3>
                                        <p className="text-gray-600 text-sm line-clamp-2">{recipe.description}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
