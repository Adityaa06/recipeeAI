import { useState } from 'react';

const SearchBar = ({ onSearch, placeholder = "Search recipes...", showAIHint = true }) => {
    const [query, setQuery] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (query.trim()) {
            onSearch(query);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="relative">
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={placeholder}
                    className="input pl-10 sm:pl-12 pr-20 sm:pr-24 py-3 sm:py-4 text-sm sm:text-lg shadow-sm"
                />
                <div className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <button
                    type="submit"
                    className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 btn btn-primary px-3 sm:px-6 py-1.5 sm:py-2 text-xs sm:text-base"
                >
                    Search
                </button>
            </div>

            {showAIHint && (
                <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                    <svg className="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V5h2v4z" />
                    </svg>
                    <span>Try: "vegan dinner with chickpeas" or "quick breakfast under 20 minutes"</span>
                </div>
            )}
        </form>
    );
};

export default SearchBar;
