const SegmentedControl = ({ options, value, onChange }) => (
    <div className="flex gap-3">
        {options.map((option) => {
            const active = value === option.value;

            return (
                <button
                    key={option.value}
                    type="button"
                    onClick={() => onChange(option.value)}
                    className={`flex-1 rounded-lg border-2 py-2.5 text-center text-sm font-medium transition ${
                        active
                            ? 'border-cyan-500 bg-white text-cyan-500'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                    }`}
                >
                    {option.label}
                </button>
            );
        })}
    </div>
);

export default SegmentedControl;
