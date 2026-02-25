import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import { useAuth } from '../context/AuthContext';
import OTPVerification from '../components/auth/OTPVerification';

const Signup = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        dietaryRestrictions: [],
        allergies: [],
        cuisinePreferences: []
    });
    const [step, setStep] = useState(1); // 1: basic, 2: otp, 3: preferences
    const [otp, setOtp] = useState('');
    const [captchaToken, setCaptchaToken] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const captchaRef = useRef(null);

    const { signup, sendOTP, verifyOTP } = useAuth();
    const navigate = useNavigate();

    const dietaryOptions = [
        'vegan', 'vegetarian', 'gluten-free', 'dairy-free',
        'keto', 'paleo', 'low-carb', 'halal', 'kosher'
    ];

    const cuisineOptions = [
        'italian', 'chinese', 'indian', 'mexican', 'japanese',
        'thai', 'mediterranean', 'american', 'french', 'korean'
    ];

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

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

    const onCaptchaChange = (token) => {
        setCaptchaToken(token);
        if (token) setError('');
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setError('');

        if (step === 1) {
            if (!captchaToken) {
                setError('Please verify that you are not a robot.');
                return;
            }

            if (formData.password !== formData.confirmPassword) {
                setError('Passwords do not match');
                return;
            }

            if (formData.password.length < 6) {
                setError('Password must be at least 6 characters');
                return;
            }

            setLoading(true);
            const result = await sendOTP(formData.email, captchaToken);
            if (result.success) {
                setStep(2);
            } else {
                setError(result.error);
                // Reset captcha on failure
                setCaptchaToken(null);
                if (captchaRef.current) captchaRef.current.reset();
            }
            setLoading(false);
        } else if (step === 3) {
            setLoading(true);
            const { confirmPassword, ...signupData } = formData;
            const result = await signup({ ...signupData, otp });

            if (result.success) {
                navigate('/dashboard');
            } else {
                setError(result.error);
            }
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (otpValue) => {
        setLoading(true);
        setError('');
        const result = await verifyOTP(formData.email, otpValue);
        if (result.success) {
            setOtp(otpValue);
            setStep(3);
        } else {
            setError(result.error);
        }
        setLoading(false);
    };

    const handleResendOTP = async () => {
        setError('');
        // For resend, we might need a new captcha or we can trust the previous one
        // User requirements didn't specify resend captcha, but normally we reuse or bypass
        const result = await sendOTP(formData.email, captchaToken);
        if (!result.success) {
            setError(result.error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 sm:py-12 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-6 sm:mb-8">
                    <h2 className="font-display font-bold text-2xl sm:text-3xl text-gray-900 mb-2">
                        Create Your Account
                    </h2>
                    <p className="text-gray-600 text-sm sm:text-base">
                        Get started with personalized AI-powered meal planning
                    </p>
                </div>

                <div className="card p-4 sm:p-8">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                            {error}
                        </div>
                    )}

                    {step === 1 && (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Basic Info */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                                        Username
                                    </label>
                                    <input
                                        id="username"
                                        name="username"
                                        type="text"
                                        required
                                        value={formData.username}
                                        onChange={handleChange}
                                        className="input"
                                        placeholder="johndoe"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address
                                    </label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="input"
                                        placeholder="you@example.com"
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                        Password
                                    </label>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="input"
                                        placeholder="••••••••"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                        Confirm Password
                                    </label>
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        required
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="input"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            {/* reCAPTCHA */}
                            <div className="flex justify-start !mt-4 !mb-5">
                                <ReCAPTCHA
                                    ref={captchaRef}
                                    sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                                    onChange={onCaptchaChange}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !captchaToken}
                                className={`btn btn-primary w-full ${(!captchaToken || loading) ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {loading ? 'Sending OTP...' : 'Continue'}
                            </button>
                        </form>
                    )}

                    {step === 2 && (
                        <OTPVerification
                            email={formData.email}
                            onVerify={handleVerifyOTP}
                            onResend={handleResendOTP}
                            loading={loading}
                        />
                    )}

                    {step === 3 && (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Dietary Restrictions */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Dietary Restrictions (Optional)
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {dietaryOptions.map(option => (
                                        <label key={option} className="flex items-center space-x-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                value={option}
                                                checked={formData.dietaryRestrictions.includes(option)}
                                                onChange={(e) => handleCheckboxChange(e, 'dietaryRestrictions')}
                                                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                            />
                                            <span className="text-sm text-gray-700 capitalize">{option}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Allergies */}
                            <div>
                                <label htmlFor="allergies" className="block text-sm font-medium text-gray-700 mb-2">
                                    Allergies (Optional, comma-separated)
                                </label>
                                <input
                                    id="allergies"
                                    name="allergies"
                                    type="text"
                                    value={formData.allergies.join(', ')}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        allergies: e.target.value.split(',').map(a => a.trim()).filter(Boolean)
                                    })}
                                    className="input"
                                    placeholder="peanuts, shellfish"
                                />
                            </div>

                            {/* Cuisine Preferences */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Cuisine Preferences (Optional)
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {cuisineOptions.map(option => (
                                        <label key={option} className="flex items-center space-x-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                value={option}
                                                checked={formData.cuisinePreferences.includes(option)}
                                                onChange={(e) => handleCheckboxChange(e, 'cuisinePreferences')}
                                                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                            />
                                            <span className="text-sm text-gray-700 capitalize">{option}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn btn-primary w-full"
                            >
                                {loading ? 'Creating Account...' : 'Create Account'}
                            </button>
                        </form>
                    )}

                    <div className="mt-6 text-center">
                        <p className="text-gray-600">
                            Already have an account?{' '}
                            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                                Log in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
