const baseClasses =
    'w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-800 placeholder-gray-400 bg-white focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500';

const SelectInput = ({ options, className = '', disabled = false, ...props }) => (
    <select className={`${baseClasses} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={disabled} {...props}>
        {options.map((opt) => {
            if (typeof opt === 'string') {
                return (
                    <option key={opt} value={opt}>
                        {opt}
                    </option>
                );
            }
            return (
                <option key={opt.value} value={opt.value}>
                    {opt.label}
                </option>
            );
        })}
    </select>
);

export default SelectInput;
