
const LoadingSpinner = ({ size = 'md', text = '' }) => {
    const sizes = {
        sm: 'h-6 w-6',
        md: 'h-12 w-12',
        lg: 'h-16 w-16'
    };

    return (
        <div className="flex flex-col items-center justify-center gap-3">
            <div className={`animate-spin rounded-full border-b-2 border-primary-600 ${sizes[size]}`}></div>
            {text && <p className="text-gray-600 text-sm">{text}</p>}
        </div>
    );
};

export default LoadingSpinner;
