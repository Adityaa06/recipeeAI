import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [captchaToken, setCaptchaToken] = useState(null);
    const [loading, setLoading] = useState(false);
    const captchaRef = useRef(null);
    const { forgotPassword } = useAuth();
    const navigate = useNavigate();

    const onCaptchaChange = (token) => {
        setCaptchaToken(token);
    };

    const validateEmail = (email) => {
        return String(email)
            .toLowerCase()
            .match(/^\S+@\S+\.\S+$/);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateEmail(email)) {
            toast.error('Please enter a valid email address.');
            return;
        }

        if (import.meta.env.MODE !== 'development' && !captchaToken) {
            toast.error('Please verify that you are not a robot.');
            return;
        }

        setLoading(true);
        try {
            const result = await forgotPassword(email, captchaToken);
            if (result.success) {
                toast.success(result.message || 'OTP sent successfully! ✅');
                navigate('/reset-password', { state: { email } });
            } else {
                toast.error(result.error || result.message || 'Failed to send OTP');
                setCaptchaToken(null);
                if (captchaRef.current) captchaRef.current.reset();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Unable to send OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 py-8 sm:py-12 px-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-6 sm:mb-8">
                    <h2 className="font-display font-bold text-2xl sm:text-3xl text-gray-900 mb-2">
                        Reset Your Password
                    </h2>
                    <p className="text-gray-600 text-sm sm:text-base">
                        Enter your email to receive a reset code.
                    </p>
                </div>

                <div className="card p-4 sm:p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div className="flex justify-center">
                            <ReCAPTCHA
                                ref={captchaRef}
                                sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                                onChange={onCaptchaChange}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !captchaToken}
                            className={`btn btn-primary w-full flex items-center justify-center ${(!captchaToken || loading) ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Sending OTP...
                                </>
                            ) : 'Send OTP'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <Link to="/login" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
