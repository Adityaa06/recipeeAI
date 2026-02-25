import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2">
                        <div className="bg-gradient-to-r from-primary-600 to-primary-400 text-white font-bold text-xl px-3 py-1 rounded-lg">
                            🍳
                        </div>
                        <span className="font-display font-bold text-xl text-gray-900">
                            Recipe<span className="text-gradient">AI</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        <NavLink
                            to="/recipes"
                            className={({ isActive }) =>
                                `font-medium transition ${isActive ? 'text-primary-600' : 'text-gray-700 hover:text-primary-600'}`
                            }
                        >
                            Recipes
                        </NavLink>

                        {isAuthenticated && (
                            <>
                                <NavLink
                                    to="/dashboard"
                                    className={({ isActive }) =>
                                        `font-medium transition ${isActive ? 'text-primary-600' : 'text-gray-700 hover:text-primary-600'}`
                                    }
                                >
                                    Dashboard
                                </NavLink>
                                <NavLink
                                    to="/meal-planner"
                                    className={({ isActive }) =>
                                        `font-medium transition ${isActive ? 'text-primary-600' : 'text-gray-700 hover:text-primary-600'}`
                                    }
                                >
                                    Meal Planner
                                </NavLink>
                                <NavLink
                                    to="/shopping-list"
                                    className={({ isActive }) =>
                                        `font-medium transition ${isActive ? 'text-primary-600' : 'text-gray-700 hover:text-primary-600'}`
                                    }
                                >
                                    Shopping List
                                </NavLink>
                            </>
                        )}
                    </div>

                    {/* Auth Buttons */}
                    <div className="hidden md:flex items-center space-x-4">
                        {isAuthenticated ? (
                            <>
                                <Link to="/profile" className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition">
                                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                                        <span className="text-primary-600 font-semibold text-sm">
                                            {user?.username?.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <span className="font-medium">{user?.username}</span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="btn btn-secondary text-sm"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="btn btn-secondary text-sm">
                                    Login
                                </Link>
                                <Link to="/signup" className="btn btn-primary text-sm">
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Slide-in Mobile Menu Drawer */}
                <div className={`md:hidden fixed inset-0 z-50 transition-opacity duration-300 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}></div>
                    <div className={`absolute right-0 top-0 h-full w-4/5 max-w-sm bg-white shadow-2xl transition-transform duration-300 transform ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                        <div className="flex flex-col h-full">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                <Link to="/" onClick={() => setIsMenuOpen(false)} className="flex items-center space-x-2">
                                    <div className="bg-primary-600 text-white font-bold px-2 py-1 rounded">🍳</div>
                                    <span className="font-bold text-gray-900">RecipeAI</span>
                                </Link>
                                <button onClick={() => setIsMenuOpen(false)} className="p-2 -mr-2 text-gray-500 hover:text-gray-900">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {isAuthenticated && (
                                    <div className="flex items-center space-x-3 p-4 bg-primary-50 rounded-xl mb-4">
                                        <div className="w-12 h-12 rounded-full bg-primary-200 flex items-center justify-center text-primary-700 text-xl font-bold">
                                            {user?.username?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900">{user?.username}</div>
                                            <div className="text-sm text-primary-600">Member</div>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Main Menu</p>
                                    <div className="flex flex-col space-y-2">
                                        <NavLink to="/recipes" className={({ isActive }) => `flex items-center space-x-3 p-3 rounded-lg font-medium transition ${isActive ? 'bg-primary-50 text-primary-600' : 'text-gray-700 hover:bg-gray-50'}`} onClick={() => setIsMenuOpen(false)}>
                                            <span>Recipes</span>
                                        </NavLink>
                                        {isAuthenticated && (
                                            <>
                                                <NavLink to="/dashboard" className={({ isActive }) => `flex items-center space-x-3 p-3 rounded-lg font-medium transition ${isActive ? 'bg-primary-50 text-primary-600' : 'text-gray-700 hover:bg-gray-50'}`} onClick={() => setIsMenuOpen(false)}>
                                                    <span>Dashboard</span>
                                                </NavLink>
                                                <NavLink to="/meal-planner" className={({ isActive }) => `flex items-center space-x-3 p-3 rounded-lg font-medium transition ${isActive ? 'bg-primary-50 text-primary-600' : 'text-gray-700 hover:bg-gray-50'}`} onClick={() => setIsMenuOpen(false)}>
                                                    <span>Meal Planner</span>
                                                </NavLink>
                                                <NavLink to="/shopping-list" className={({ isActive }) => `flex items-center space-x-3 p-3 rounded-lg font-medium transition ${isActive ? 'bg-primary-50 text-primary-600' : 'text-gray-700 hover:bg-gray-50'}`} onClick={() => setIsMenuOpen(false)}>
                                                    <span>Shopping List</span>
                                                </NavLink>
                                                <NavLink to="/profile" className={({ isActive }) => `flex items-center space-x-3 p-3 rounded-lg font-medium transition ${isActive ? 'bg-primary-50 text-primary-600' : 'text-gray-700 hover:bg-gray-50'}`} onClick={() => setIsMenuOpen(false)}>
                                                    <span>My Profile</span>
                                                </NavLink>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {!isAuthenticated && (
                                    <div className="grid grid-cols-2 gap-3 mt-auto pt-6 border-t border-gray-100">
                                        <Link to="/login" className="btn btn-secondary text-sm text-center" onClick={() => setIsMenuOpen(false)}>Login</Link>
                                        <Link to="/signup" className="btn btn-primary text-sm text-center" onClick={() => setIsMenuOpen(false)}>Join</Link>
                                    </div>
                                )}
                            </div>

                            {isAuthenticated && (
                                <div className="p-6 border-t border-gray-100 mb-6">
                                    <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="w-full flex items-center justify-center space-x-2 p-3 bg-red-50 text-red-600 rounded-lg font-bold hover:bg-red-100 transition">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        <span>Logout</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
