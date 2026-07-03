const baseClasses =
    'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 resize-none';

const Textarea = ({ className = '', ...props }) => (
    <textarea className={`${baseClasses} ${className}`} {...props} />
);

export default Textarea;
