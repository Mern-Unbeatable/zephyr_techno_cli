const baseClasses =
    'w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 disabled:bg-gray-100 disabled:text-gray-400';

const TextInput = ({ className = '', ...props }) => (
    <input type="text" className={`${baseClasses} ${className} bg-white`} {...props} />
);

export default TextInput;
