import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const baseClasses =
    'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500';

const TextInput = ({ type = 'text', className = '', ...props }) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPasswordField = type === 'password';

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    if (isPasswordField) {
        return (
            <div className="relative">
                <input
                    type={showPassword ? 'text' : 'password'}
                    className={`${baseClasses} ${className} pr-10`}
                    {...props}
                />
                <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                    tabIndex={-1}
                >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>
        );
    }

    return <input type={type} className={`${baseClasses} ${className}`} {...props} />;
};

export default TextInput;
