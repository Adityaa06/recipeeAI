import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({
        username: user?.username || '',
        dietaryRestrictions: user?.dietaryRestrictions || [],
        allergies: user?.allergies || [],
        cuisinePreferences: user?.cuisinePreferences || []
    });
    const [message, setMessage] = useState({ type: '', text: '' });

    const dietaryOptions = [
        'vegan', 'vegetarian', 'gluten-free', 'dairy-free',
        'keto', 'paleo', 'low-carb', 'halal', 'kosher'
    ];

    const cuisineOptions = [
        'italian', 'chinese', 'indian', 'mexican', 'japanese',
        'thai', 'mediterranean', 'american', 'french', 'korean'
    ];

    const handleCheckboxChange = (e, field) => {
        const value = e.target.value;
        const isChecked = e.target.checked;

        setFormData(prev => ({
            ...prev,
            [field]: isChecked
                ? [...prev[field], value]
                : prev[field].filter(item => item !== value)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await updateUser(formData);

        if (result.success) {
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            setEditing(false);
        } else {
            setMessage({ type: 'error', text: result.error });
        }

        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };

    const handleCancel = () => {
        setFormData({
            username: user?.username || '',
            dietaryRestrictions: user?.dietaryRestrictions || [],
            allergies: user?.allergies || [],
            cuisinePreferences: user?.cuisinePreferences || []
        });
        setEditing(false);
        setMessage({ type: '', text: '' });
    };

    return (
        <div className="min-h-[calc(100vh-64px)] bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-6 sm:mb-8">
                    <h1 className="font-display font-bold text-2xl sm:text-3xl text-gray-900 mb-2">
                        My Profile
                    </h1>
                    <p className="text-gray-600 text-sm sm:text-base">
                        Manage your account settings and dietary preferences
                    </p>
                </div>

                <div className="card p-4 sm:p-8">
                    {message.text && (
                        <div className={`mb-6 p-4 rounded-lg ${message.type === 'success'
                            ? 'bg-green-50 border border-green-200 text-green-700'
                            : 'bg-red-50 border border-red-200 text-red-700'
                            }`}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Account Info */}
                        <div className="border-b border-gray-200 pb-6 mb-6">
                            <h3 className="font-semibold text-lg mb-4">Account Information</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                    <input
                                        type="email"
                                        value={user?.email || ''}
                                        disabled
                                        className="input bg-gray-100 cursor-not-allowed"
                                    />
                                    <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                                    <input
                                        type="text"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        disabled={!editing}
                                        className={`input ${!editing ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Dietary Restrictions */}
                        <div className="border-b border-gray-200 pb-6 mb-6">
                            <h3 className="font-semibold text-lg mb-4">Dietary Restrictions</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {dietaryOptions.map(option => (
                                    <label key={option} className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            value={option}
                                            checked={formData.dietaryRestrictions.includes(option)}
                                            onChange={(e) => handleCheckboxChange(e, 'dietaryRestrictions')}
                                            disabled={!editing}
                                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 disabled:opacity-50"
                                        />
                                        <span className="text-sm text-gray-700 capitalize">{option}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Allergies */}
                        <div className="border-b border-gray-200 pb-6 mb-6">
                            <h3 className="font-semibold text-lg mb-4">Allergies</h3>
                            <input
                                type="text"
                                value={formData.allergies.join(', ')}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    allergies: e.target.value.split(',').map(a => a.trim()).filter(Boolean)
                                })}
                                disabled={!editing}
                                placeholder="e.g., peanuts, shellfish"
                                className={`input ${!editing ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                            />
                        </div>

                        {/* Cuisine Preferences */}
                        <div className="pb-6 mb-6">
                            <h3 className="font-semibold text-lg mb-4">Cuisine Preferences</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {cuisineOptions.map(option => (
                                    <label key={option} className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            value={option}
                                            checked={formData.cuisinePreferences.includes(option)}
                                            onChange={(e) => handleCheckboxChange(e, 'cuisinePreferences')}
                                            disabled={!editing}
                                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 disabled:opacity-50"
                                        />
                                        <span className="text-sm text-gray-700 capitalize">{option}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            {editing ? (
                                <>
                                    <button type="submit" className="btn btn-primary w-full sm:w-auto">
                                        Save Changes
                                    </button>
                                    <button type="button" onClick={handleCancel} className="btn btn-secondary w-full sm:w-auto">
                                        Cancel
                                    </button>
                                </>
                            ) : (
                                <button type="button" onClick={() => setEditing(true)} className="btn btn-primary w-full sm:w-auto">
                                    Edit Profile
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;
