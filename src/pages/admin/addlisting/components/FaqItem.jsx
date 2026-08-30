import TextInput from './TextInput';
import Textarea from './Textarea';

const FaqItem = ({
  index,
  faq,
  total = 1,
  onQuestionChange,
  onAnswerChange,
  onRemove,
  onMoveUp,
  onMoveDown,
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3 pb-3 border-b border-gray-200">
    <div>
      <div className="mb-1 flex items-center justify-between gap-2">
        <label className="block text-sm font-medium text-gray-700">
          Question {index + 1}
        </label>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={index === 0}
            className="rounded border border-gray-200 px-2 py-0.5 text-xs text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Move question up"
          >
            ↑
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={index >= total - 1}
            className="rounded border border-gray-200 px-2 py-0.5 text-xs text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Move question down"
          >
            ↓
          </button>
        </div>
      </div>
      <TextInput
        placeholder="Write question"
        value={faq.question}
        onChange={(e) => onQuestionChange(index, e.target.value)}
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Answer</label>
      <div className="flex gap-2 items-start">
        <Textarea
          placeholder="Write answer"
          value={faq.answer}
          onChange={(e) => onAnswerChange(index, e.target.value)}
          rows={3}
          className="resize-y"
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

export default FaqItem;
