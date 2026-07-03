const baseClasses =
    'w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-custom bg-white';

const TextInput = ({ className = '', ...props }) => (
    <input type="text" className={`${baseClasses} ${className}`} {...props} />
);

export default TextInput;
