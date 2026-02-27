import { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is already logged in
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
            setUser(currentUser);
        }
        setLoading(false);
    }, []);

    const signup = async (userData) => {
        try {
            const response = await authService.signup(userData);
            setUser(response.user);
            return { success: true, user: response.user };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Signup failed'
            };
        }
    };

    const login = async (credentials) => {
        try {
            const response = await authService.login(credentials);
            setUser(response.user);
            return { success: true, user: response.user };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Login failed'
            };
        }
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    const updateUser = async (userData) => {
        try {
            const response = await authService.updateProfile(userData);
            setUser(response.user);
            return { success: true, user: response.user };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Update failed'
            };
        }
    };

    const sendOTP = async (email, captchaToken) => {
        try {
            const response = await authService.sendOTP(email, captchaToken);
            return { success: true, message: response.message };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to send OTP'
            };
        }
    };

    const verifyOTP = async (email, otp) => {
        try {
            const response = await authService.verifyOTP(email, otp);
            return { success: true, message: response.message };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Verification failed'
            };
        }
    };

    const forgotPassword = async (email, captchaToken) => {
        try {
            const response = await authService.forgotPassword(email, captchaToken);
            return { success: true, message: response.message };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to process request'
            };
        }
    };

    const verifyResetOTP = async (email, otp) => {
        try {
            const response = await authService.verifyResetOTP(email, otp);
            return { success: true, message: response.message };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Verification failed'
            };
        }
    };

    const resetPassword = async (email, otp, password) => {
        try {
            const response = await authService.resetPassword(email, otp, password);
            return { success: true, message: response.message };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Password reset failed'
            };
        }
    };

    const value = {
        user,
        loading,
        signup,
        login,
        logout,
        updateUser,
        sendOTP,
        verifyOTP,
        forgotPassword,
        verifyResetOTP,
        resetPassword,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
