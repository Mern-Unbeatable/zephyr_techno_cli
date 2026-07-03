import TextInput from './TextInput';

const IncludedItem = ({ index, item, onLabelChange, onRemove }) => (
  <div className="flex gap-2 mb-3 pb-3 border-b border-gray-200">
    <div className="flex-1">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Item {index + 1}
      </label>
      <TextInput
        placeholder="e.g. USB-C Charging Cable"
        value={item.label || ''}
        onChange={(e) => onLabelChange(index, e.target.value)}
      />
    </div>
    {index > 0 && (
      <button
        type="button"
        onClick={() => onRemove(index)}
        className="self-end px-3 py-2 text-teal-600 hover:text-teal-700 font-medium text-sm cursor-pointer"
      >
        Remove
      </button>
    )}
  </div>
);

export default IncludedItem;
