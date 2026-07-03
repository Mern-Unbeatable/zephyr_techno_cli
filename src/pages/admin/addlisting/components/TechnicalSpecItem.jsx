import TextInput from './TextInput';

const TechnicalSpecItem = ({ index, spec, onSpecificationChange, onValueChange, onRemove }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3 pb-3 border-b border-gray-200">
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Specification</label>
            <TextInput
                placeholder="Write specification"
                value={spec.name || spec.specification || ''}
                onChange={(e) => onSpecificationChange(index, e.target.value)}
            />
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
            <div className="flex gap-2">
                <TextInput
                    placeholder="Write value"
                    value={spec.value || ''}
                    onChange={(e) => onValueChange(index, e.target.value)}
                />
                {index > 0 && (
                    <button
                        type="button"
                        onClick={() => onRemove(index)}
                        className="px-3 text-teal-600 hover:text-teal-700 font-medium text-sm cursor-pointer"
                    >
                        Remove
                    </button>
                )}
            </div>
        </div>
    </div>
);

export default TechnicalSpecItem;