import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { mealPlanService } from '../services/mealPlanService';
import { shoppingListService } from '../services/shoppingListService';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const MealPlanner = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [mealPlans, setMealPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [activeTab, setActiveTab] = useState('ai'); // 'ai' or 'personal'
    const [personalPlan, setPersonalPlan] = useState(null);
    const [loadingPersonal, setLoadingPersonal] = useState(false);

    useEffect(() => {
        loadMealPlans();
        loadPersonalPlan();
    }, []);

    const loadPersonalPlan = async () => {
        setLoadingPersonal(true);
        try {
            const data = await mealPlanService.getPersonalMealPlan();
            setPersonalPlan(data.mealPlan);
        } catch (error) {
            console.error('Error loading personal plan:', error);
        } finally {
            setLoadingPersonal(false);
        }
    };

    const loadMealPlans = async () => {
        try {
            const data = await mealPlanService.getMealPlans();
            // Filter only AI generated plans for the AI tab
            const aiPlans = (data.mealPlans || []).filter(plan => plan.generatedByAI === true);
            setMealPlans(aiPlans);

            if (aiPlans.length > 0) {
                setSelectedPlan(aiPlans[0]);
            } else {
                setSelectedPlan(null);
            }
        } catch (error) {
            console.error('Error loading meal plans:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateAIMealPlan = async () => {
        setGenerating(true);
        try {
            const data = await mealPlanService.generateMealPlan({ days: 7 });
            await loadMealPlans();
            setActiveTab('ai'); // Auto switch to AI tab
            // The first plan will be auto-selected by loadMealPlans
            alert('AI meal plan generated successfully!');
        } catch (error) {
            console.error('Error generating meal plan:', error);
            alert('Error generating meal plan. Please try again.');
        } finally {
            setGenerating(false);
        }
    };

    const generateShoppingList = async (mealPlanId) => {
        try {
            await shoppingListService.generateShoppingList(mealPlanId, 'Weekly Shopping List');
            navigate('/shopping-list');
        } catch (error) {
            console.error('Error generating shopping list:', error);
            alert('Error generating shopping list. Please try again.');
        }
    };

    if (loading) {
        return (
            <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
                <LoadingSpinner size="lg" text="Loading meal plans..." />
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-64px)] bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
                    <div>
                        <h1 className="font-display font-bold text-3xl text-gray-900 mb-2">
                            Meal Planner
                        </h1>
                        <p className="text-gray-600 text-sm sm:text-base">
                            Manage your weekly meals and AI-generated plans
                        </p>
                    </div>

                    <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-200 overflow-x-auto no-scrollbar">
                        <button
                            onClick={() => setActiveTab('ai')}
                            className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-lg font-semibold transition whitespace-nowrap text-sm sm:text-base ${activeTab === 'ai'
                                ? 'bg-primary-600 text-white shadow-md'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            AI Generated Plans
                        </button>
                        <button
                            onClick={() => setActiveTab('personal')}
                            className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-lg font-semibold transition whitespace-nowrap text-sm sm:text-base ${activeTab === 'personal'
                                ? 'bg-primary-600 text-white shadow-md'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            My Meal Plan
                        </button>
                    </div>
                </div>

                {activeTab === 'ai' ? (
                    <>
                        <div className="flex justify-end mb-6">
                            <button
                                onClick={generateAIMealPlan}
                                disabled={generating}
                                className="btn btn-primary flex items-center gap-2"
                            >
                                {generating ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                        Generate New AI Plan ✨
                                    </>
                                )}
                            </button>
                        </div>

                        {mealPlans.length === 0 ? (
                            <div className="card p-12 text-center">
                                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">No AI meal plans yet</h3>
                                <p className="text-gray-600 mb-4">
                                    Generate your first AI plan to get started
                                </p>
                                <button onClick={generateAIMealPlan} className="btn btn-primary">
                                    Generate First Plan ✨
                                </button>
                            </div>
                        ) : (
                            <div className="grid lg:grid-cols-4 gap-6">
                                {/* Meal Plans List */}
                                <div className="lg:col-span-1">
                                    <div className="card p-4 space-y-2">
                                        <h3 className="font-semibold text-sm text-gray-700 mb-2">Your Plans</h3>
                                        {mealPlans.map(plan => (
                                            <button
                                                key={plan._id}
                                                onClick={() => setSelectedPlan(plan)}
                                                className={`w-full text-left p-3 rounded-lg transition ${selectedPlan?._id === plan._id
                                                    ? 'bg-primary-50 border-2 border-primary-600'
                                                    : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                                                    }`}
                                            >
                                                <div className="font-medium text-sm mb-1">{plan.title}</div>
                                                <div className="text-xs text-gray-600">
                                                    {new Date(plan.startDate).toLocaleDateString()} - {new Date(plan.endDate).toLocaleDateString()}
                                                </div>
                                                <div className="text-xs text-primary-600 mt-1">✨ AI Generated</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Selected Meal Plan */}
                                <div className="lg:col-span-3">
                                    {selectedPlan && (
                                        <>
                                            <div className="card p-4 sm:p-6 mb-4">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                                                    <h2 className="font-semibold text-xl sm:text-2xl">{selectedPlan.title}</h2>
                                                    <button
                                                        onClick={() => generateShoppingList(selectedPlan._id)}
                                                        className="btn btn-outline text-xs sm:text-sm w-full sm:w-auto"
                                                    >
                                                        Generate Shopping List
                                                    </button>
                                                </div>

                                                <div className="text-xs sm:text-sm text-gray-600 mb-6">
                                                    {new Date(selectedPlan.startDate).toLocaleDateString()} - {new Date(selectedPlan.endDate).toLocaleDateString()}
                                                </div>

                                                <div className="space-y-6">
                                                    {selectedPlan.meals.map((meal, index) => (
                                                        <div key={index} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
                                                            <h3 className="font-semibold text-lg mb-4">{meal.day}</h3>

                                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                                                {/* Breakfast */}
                                                                <div className="bg-yellow-50 rounded-lg p-4">
                                                                    <div className="font-medium text-xs text-yellow-900 mb-2 uppercase tracking-wider">Breakfast</div>
                                                                    {meal.breakfast ? (
                                                                        <Link
                                                                            to={`/recipes/${meal.breakfast._id}`}
                                                                            className="text-sm text-yellow-800 hover:text-yellow-900 hover:underline font-medium block"
                                                                        >
                                                                            {meal.breakfast.title}
                                                                        </Link>
                                                                    ) : (
                                                                        <div className="text-sm text-yellow-600 italic">Not planned</div>
                                                                    )}
                                                                </div>

                                                                {/* Lunch */}
                                                                <div className="bg-green-50 rounded-lg p-4">
                                                                    <div className="font-medium text-xs text-green-900 mb-2 uppercase tracking-wider">Lunch</div>
                                                                    {meal.lunch ? (
                                                                        <Link
                                                                            to={`/recipes/${meal.lunch._id}`}
                                                                            className="text-sm text-green-800 hover:text-green-900 hover:underline font-medium block"
                                                                        >
                                                                            {meal.lunch.title}
                                                                        </Link>
                                                                    ) : (
                                                                        <div className="text-sm text-green-600 italic">Not planned</div>
                                                                    )}
                                                                </div>

                                                                {/* Dinner */}
                                                                <div className="bg-blue-50 rounded-lg p-4">
                                                                    <div className="font-medium text-xs text-blue-900 mb-2 uppercase tracking-wider">Dinner</div>
                                                                    {meal.dinner ? (
                                                                        <Link
                                                                            to={`/recipes/${meal.dinner._id}`}
                                                                            className="text-sm text-blue-800 hover:text-blue-900 hover:underline font-medium block"
                                                                        >
                                                                            {meal.dinner.title}
                                                                        </Link>
                                                                    ) : (
                                                                        <div className="text-sm text-blue-600 italic">Not planned</div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="space-y-6">
                        {loadingPersonal ? (
                            <div className="card p-12 flex justify-center">
                                <LoadingSpinner size="md" text="Loading your plan..." />
                            </div>
                        ) : !personalPlan ? (
                            <div className="card p-12 text-center">
                                <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">No personal plan found</h3>
                                <p className="text-gray-600 mb-6">
                                    Start adding recipes to your meal plan from any recipe page!
                                </p>
                                <Link to="/recipes" className="btn btn-primary">
                                    Browse Recipes
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
                                {personalPlan.meals.map((dayPlan, idx) => (
                                    <div key={idx} className="flex flex-col gap-4">
                                        <div className="bg-gray-200 py-2 px-3 rounded-lg text-center font-bold text-gray-700 text-sm uppercase tracking-wider">
                                            {dayPlan.day}
                                        </div>

                                        {['breakfast', 'lunch', 'dinner'].map(type => (
                                            <div key={type} className={`card p-3 flex flex-col items-center text-center gap-2 group relative overflow-hidden h-40 ${type === 'breakfast' ? 'bg-yellow-50/50' :
                                                type === 'lunch' ? 'bg-green-50/50' : 'bg-blue-50/50'
                                                }`}>
                                                <div className={`text-[10px] font-bold uppercase ${type === 'breakfast' ? 'text-yellow-700' :
                                                    type === 'lunch' ? 'text-green-700' : 'text-blue-700'
                                                    }`}>
                                                    {type}
                                                </div>

                                                {dayPlan[type] ? (
                                                    <Link to={`/recipes/${dayPlan[type]._id}`} className="group-hover:opacity-80 transition flex flex-col items-center">
                                                        <img
                                                            src={dayPlan[type].imageUrl || 'https://via.placeholder.com/100'}
                                                            alt={dayPlan[type].title}
                                                            className="w-16 h-16 rounded-full object-cover mb-2 border-2 border-white shadow-sm"
                                                        />
                                                        <span className="text-xs font-semibold text-gray-900 line-clamp-2 leading-tight">
                                                            {dayPlan[type].title}
                                                        </span>
                                                    </Link>
                                                ) : (
                                                    <div className="flex-1 flex flex-col items-center justify-center gap-1 opacity-40">
                                                        <div className="w-10 h-10 rounded-full border-2 border-dashed border-gray-400 flex items-center justify-center">
                                                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                            </svg>
                                                        </div>
                                                        <span className="text-[10px] text-gray-500 font-medium italic">Empty</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MealPlanner;
