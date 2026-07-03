import TextInput from './TextInput';
import Textarea from './Textarea';

const FaqItem = ({ index, faq, onQuestionChange, onAnswerChange, onRemove }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3 pb-3 border-b border-gray-200">
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
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
