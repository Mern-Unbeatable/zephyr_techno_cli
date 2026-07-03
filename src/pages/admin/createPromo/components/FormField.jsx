const FormField = ({ label, action, children }) => (
    <div>
        <div className="mb-1.5 flex items-center justify-between">
            <label className="text-sm text-gray-700">{label}</label>
            {action}
        </div>
        {children}
    </div>
);

export default FormField;
