import { useState, useEffect, useRef } from 'react';

const OTPVerification = ({ email, onVerify, onResend, loading }) => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [timer, setTimer] = useState(30);
    const [error, setError] = useState('');
    const [shaking, setShaking] = useState(false);
    const inputRefs = useRef([]);

    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    useEffect(() => {
        // Auto-focus first input
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    // Auto-verify when 6 digits are entered
    useEffect(() => {
        if (otp.join('').length === 6 && !loading) {
            handleVerify();
        }
    }, [otp]);

    const handleChange = (index, value) => {
        if (isNaN(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);

        // Focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
        if (e.key === 'Enter' && otp.join('').length < 6) {
            triggerShake();
        }
    };

    const triggerShake = () => {
        setShaking(true);
        setTimeout(() => setShaking(false), 500);
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData('text').slice(0, 6).split('');
        if (pasteData.some(char => isNaN(char))) return;

        const newOtp = [...otp];
        pasteData.forEach((char, i) => {
            if (i < 6) newOtp[i] = char;
        });
        setOtp(newOtp);

        // Focus last filled or next empty
        const nextIndex = Math.min(pasteData.length, 5);
        inputRefs.current[nextIndex].focus();
    };

    const handleVerify = () => {
        const otpValue = otp.join('');
        if (otpValue.length < 6) {
            setError('Please enter all 6 digits');
            triggerShake();
            return;
        }
        setError('');
        onVerify(otpValue);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        handleVerify();
    };

    const handleResend = () => {
        if (timer > 0) return;
        setTimer(30);
        onResend();
    };

    return (
        <form onSubmit={handleFormSubmit} className={`space-y-6 ${shaking ? 'animate-shake' : ''}`}>
            <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Verify Your Email</h3>
                <p className="text-sm text-gray-600">
                    We sent a 6-digit code to <span className="font-medium text-gray-900">{email}</span>
                </p>
            </div>

            <div className="flex justify-center space-x-1.5 sm:space-x-2">
                {otp.map((digit, index) => (
                    <input
                        key={index}
                        ref={el => inputRefs.current[index] = el}
                        type="text"
                        maxLength="1"
                        value={digit}
                        onChange={e => handleChange(index, e.target.value)}
                        onKeyDown={e => handleKeyDown(index, e)}
                        onPaste={handlePaste}
                        className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold border-2 rounded-lg focus:border-primary-500 focus:ring-primary-500 border-gray-200 outline-none transition-all"
                        disabled={loading}
                    />
                ))}
            </div>

            {error && (
                <p className="text-center text-red-600 text-sm">{error}</p>
            )}

            <div className="space-y-4">
                <button
                    type="submit"
                    disabled={loading || otp.join('').length < 6}
                    className="btn btn-primary w-full h-12 flex items-center justify-center"
                >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        'Verify OTP'
                    )}
                </button>

                <div className="text-center">
                    <button
                        type="button"
                        onClick={handleResend}
                        disabled={timer > 0 || loading}
                        className={`text-sm font-medium ${timer > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-primary-600 hover:text-primary-700'}`}
                    >
                        {timer > 0 ? `Resend Code in ${timer}s` : 'Resend Code'}
                    </button>
                </div>
            </div>
        </form>
    );
};

export default OTPVerification;
