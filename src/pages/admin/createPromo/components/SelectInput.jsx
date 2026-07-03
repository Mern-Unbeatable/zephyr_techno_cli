const ChevronIcon = () => (
    <svg
        className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
    >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
);

const SelectInput = ({ options, placeholder, ...props }) => (
    <div className="relative">
        <select
            className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-10 text-sm text-gray-900 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            {...props}
        >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((opt) =>
                typeof opt === 'string'
                    ? <option key={opt} value={opt}>{opt}</option>
                    : <option key={opt.value} value={opt.value}>{opt.label}</option>
            )}
        </select>
        <ChevronIcon />
    </div>
);

export default SelectInput;
