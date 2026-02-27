import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        dietaryRestrictions: [],
        allergies: '',
        cuisinePreferences: []
    });
    const [saving, setSaving] = useState(false);

    // Sync form data with user object when not in edit mode
    useEffect(() => {
        if (user && !isEditing) {
            console.log("DEBUG: Syncing data from user object", user);
            setFormData({
                username: user.username || '',
                dietaryRestrictions: user.dietaryRestrictions || [],
                allergies: user.allergies?.join(', ') || '',
                cuisinePreferences: user.cuisinePreferences || []
            });
        }
    }, [user, isEditing]);

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

    const handleEditClick = (e) => {
        // Explicitly prevent default to avoid any form submission
        e.preventDefault();
        console.log("DEBUG: Edit Profile button clicked - Enabling edit mode");
        setIsEditing(true);
    };

    const handleCancelClick = (e) => {
        e.preventDefault();
        console.log("DEBUG: Cancel button clicked - Reverting changes");
        if (user) {
            setFormData({
                username: user.username || '',
                dietaryRestrictions: user.dietaryRestrictions || [],
                allergies: user.allergies?.join(', ') || '',
                cuisinePreferences: user.cuisinePreferences || []
            });
        }
        setIsEditing(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("DEBUG: Form submit triggered");

        // CRITICAL: Double-check that we are actually in editing mode before calling API
        if (!isEditing) {
            console.log("DEBUG: API call blocked - Form submitted while NOT in edit mode");
            return;
        }

        console.log("DEBUG: API call started - Save Changes clicked");
        setSaving(true);
        try {
            const result = await updateUser(formData);
            console.log("DEBUG: API call finished", result);

            if (result.success) {
                toast.success('Profile updated successfully ✅');
                setIsEditing(false);
            } else {
                toast.error(result.error || 'Failed to update profile');
            }
        } catch (error) {
            console.error("DEBUG: Update error", error);
            toast.error('An unexpected error occurred');
        } finally {
            setSaving(false);
        }
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
                    <form onSubmit={handleSubmit} id="profile-form">
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
                                        disabled={!isEditing}
                                        className={`input ${!isEditing ? 'bg-gray-100 cursor-not-allowed' : ''}`}
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
                                            disabled={!isEditing}
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
                                value={formData.allergies}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    allergies: e.target.value
                                })}
                                disabled={!isEditing}
                                placeholder="e.g., peanuts, shellfish"
                                className={`input ${!isEditing ? 'bg-gray-100 cursor-not-allowed' : ''}`}
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
                                            disabled={!isEditing}
                                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 disabled:opacity-50"
                                        />
                                        <span className="text-sm text-gray-700 capitalize">{option}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            {isEditing ? (
                                <>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="btn btn-primary bg-green-600 hover:bg-green-700 border-green-600 w-full sm:w-auto flex items-center justify-center gap-2"
                                    >
                                        {saving ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        ) : '✅'}
                                        <span>Save Changes</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCancelClick}
                                        disabled={saving}
                                        className="btn btn-secondary w-full sm:w-auto"
                                    >
                                        Cancel
                                    </button>
                                </>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleEditClick}
                                    className="btn btn-primary w-full sm:w-auto"
                                >
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
