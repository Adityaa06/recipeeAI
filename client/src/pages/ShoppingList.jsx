import { useState, useEffect } from 'react';
import { shoppingListService } from '../services/shoppingListService';
import LoadingSpinner from '../components/LoadingSpinner';

const ShoppingList = () => {
    const [shoppingLists, setShoppingLists] = useState([]);
    const [selectedList, setSelectedList] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadShoppingLists();
    }, []);

    const loadShoppingLists = async () => {
        try {
            const data = await shoppingListService.getShoppingLists();
            setShoppingLists(data.shoppingLists || []);
            if (data.shoppingLists && data.shoppingLists.length > 0) {
                setSelectedList(data.shoppingLists[0]);
            }
        } catch (error) {
            console.error('Error loading shopping lists:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleItem = async (itemIndex) => {
        if (!selectedList) return;

        const updatedItems = [...selectedList.items];
        updatedItems[itemIndex].checked = !updatedItems[itemIndex].checked;

        try {
            await shoppingListService.updateShoppingList(selectedList._id, {
                items: updatedItems
            });

            setSelectedList({ ...selectedList, items: updatedItems });
            setShoppingLists(prev =>
                prev.map(list =>
                    list._id === selectedList._id ? { ...list, items: updatedItems } : list
                )
            );
        } catch (error) {
            console.error('Error updating item:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
                <LoadingSpinner size="lg" text="Loading shopping lists..." />
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-64px)] bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-6 sm:mb-8">
                    <h1 className="font-display font-bold text-2xl sm:text-3xl text-gray-900 mb-2">
                        Shopping Lists
                    </h1>
                    <p className="text-gray-600 text-sm sm:text-base">
                        Manage your shopping lists and check off items as you shop
                    </p>
                </div>

                {shoppingLists.length === 0 ? (
                    <div className="card p-12 text-center">
                        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No shopping lists yet</h3>
                        <p className="text-gray-600 mb-4">
                            Create a meal plan and generate a shopping list automatically
                        </p>
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-4 gap-6">
                        {/* Lists Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="card p-4 space-y-2">
                                <h3 className="font-semibold text-sm text-gray-700 mb-2">Your Lists</h3>
                                {shoppingLists.map(list => (
                                    <button
                                        key={list._id}
                                        onClick={() => setSelectedList(list)}
                                        className={`w-full text-left p-3 rounded-lg transition ${selectedList?._id === list._id
                                            ? 'bg-primary-50 border-2 border-primary-600'
                                            : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                                            }`}
                                    >
                                        <div className="font-medium text-sm mb-1">{list.title}</div>
                                        <div className="text-xs text-gray-600">
                                            {list.items.filter(i => i.checked).length} / {list.items.length} items
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Selected List */}
                        <div className="lg:col-span-3">
                            {selectedList && (
                                <div className="card p-4 sm:p-6">
                                    <div className="mb-6">
                                        <h2 className="font-semibold text-2xl mb-2">{selectedList.title}</h2>
                                        <div className="flex items-center gap-4 text-sm text-gray-600">
                                            <span>
                                                {selectedList.items.filter(i => i.checked).length} of {selectedList.items.length} items checked
                                            </span>
                                            {selectedList.mealPlanId && (
                                                <span className="px-2 py-1 bg-primary-50 text-primary-700 rounded">
                                                    From meal plan
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="mb-6">
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-primary-600 h-2 rounded-full transition-all"
                                                style={{
                                                    width: `${(selectedList.items.filter(i => i.checked).length / selectedList.items.length) * 100}%`
                                                }}
                                            ></div>
                                        </div>
                                    </div>

                                    {/* Items */}
                                    <div className="space-y-2">
                                        {selectedList.items.map((item, index) => (
                                            <div
                                                key={index}
                                                className={`flex items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border-2 transition cursor-pointer ${item.checked
                                                    ? 'bg-gray-50 border-gray-200'
                                                    : 'bg-white border-gray-200 hover:border-primary-300'
                                                    }`}
                                                onClick={() => toggleItem(index)}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={item.checked}
                                                    onChange={() => { }}
                                                    className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                                                />
                                                <div className="flex-1">
                                                    <span className={`font-medium ${item.checked ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                                        {item.ingredient}
                                                    </span>
                                                    <span className={`ml-2 text-sm ${item.checked ? 'text-gray-400' : 'text-gray-600'}`}>
                                                        {item.quantity} {item.unit}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShoppingList;
