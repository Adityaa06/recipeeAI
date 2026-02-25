import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AddToMealPlanModal = ({ isOpen, onClose, onAdd, recipeTitle }) => {
    const [day, setDay] = useState('');
    const [mealType, setMealType] = useState('');
    const [loading, setLoading] = useState(false);

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const mealTypes = ['Breakfast', 'Lunch', 'Dinner'];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!day || !mealType) return;

        setLoading(true);
        try {
            await onAdd(day, mealType);
            onClose();
        } catch (error) {
            console.error('Error adding to meal plan:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900">Add to Meal Plan</h2>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-gray-100 rounded-full transition"
                                >
                                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <p className="text-sm text-gray-600 mb-6">
                                Select a day and meal slot for <span className="font-semibold text-primary-600">"{recipeTitle}"</span>
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Select Day
                                    </label>
                                    <select
                                        value={day}
                                        onChange={(e) => setDay(e.target.value)}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
                                        required
                                    >
                                        <option value="">Select Day ▼</option>
                                        {days.map(d => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Select Meal Type
                                    </label>
                                    <select
                                        value={mealType}
                                        onChange={(e) => setMealType(e.target.value)}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
                                        required
                                    >
                                        <option value="">Select Meal Type ▼</option>
                                        {mealTypes.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!day || !mealType || loading}
                                        className="flex-1 bg-primary-600 text-white font-semibold py-2 px-4 rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            'Add to Plan'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default AddToMealPlanModal;
