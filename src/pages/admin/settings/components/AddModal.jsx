import { FormField, TextInput, SelectInput, Modal } from '../../../../components/shared/form';
import ColorHexInput from './ColorHexInput';

const AddModal = ({ title, isOpen, fields, values, onChange, onSubmit, onClose }) => (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
        <form
            onSubmit={(e) => {
                e.preventDefault();
                onSubmit();
            }}
            className="space-y-4"
        >
            {fields.map((field) => (
                <FormField key={field.name} label={field.label}>
                    {field.type === 'select' ? (
                        <SelectInput
                            name={field.name}
                            value={values[field.name] || ''}
                            onChange={onChange}
                            options={field.options || []}
                            placeholder={field.placeholder || 'Select...'}
                        />
                    ) : field.type === 'colorHex' ? (
                        <ColorHexInput
                            name={field.name}
                            value={values[field.name] || '#9CA3AF'}
                            onChange={onChange}
                        />
                    ) : field.type === 'file' ? (
                        <TextInput
                            name={field.name}
                            type={field.type}
                            placeholder={field.placeholder}
                            accept={field.accept}
                            onChange={onChange}
                        />
                    ) : (
                        <TextInput
                            name={field.name}
                            type={field.type || 'text'}
                            placeholder={field.placeholder}
                            value={values[field.name] || ''}
                            onChange={onChange}
                        />
                    )}
                </FormField>
            ))}
            <button
                type="submit"
                className="w-full rounded-lg bg-custom cursor-pointer px-4 py-2 text-sm font-medium text-white hover:bg-teal-600 transition"
            >
                Save
            </button>
        </form>
    </Modal>
);

export default AddModal;
