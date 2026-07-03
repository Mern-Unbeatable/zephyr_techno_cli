const SettingsCard = ({ title, onAdd, addLabel, children }) => (
    <div className="rounded-lg border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
            <h3 className="text-base font-semibold text-gray-900">{title}</h3>
            {onAdd && (
                <button
                    onClick={onAdd}
                    className="rounded-md bg-custom cursor-pointer px-3 py-1.5 text-sm font-medium text-white hover:bg-teal-600 transition"
                >
                    {addLabel}
                </button>
            )}
        </div>
        <div className="p-5">
            {children}
        </div>
    </div>
);

export default SettingsCard;
