import { Trash2 } from 'lucide-react';
import { getColorHex, isLightColor } from '../../../../utils/color';

const Tag = ({ label, hexCode, showColorSwatch = false, onDelete }) => {
    const swatch = showColorSwatch ? getColorHex(label, hexCode) : null;

    return (
    <span className="inline-flex items-center gap-2 rounded-md bg-blue-50 border border-blue-100 px-3 py-1.5 text-sm text-gray-700">
        {showColorSwatch && swatch && (
            <span
                className={`h-4 w-4 shrink-0 rounded-full border ${isLightColor(swatch) ? 'border-gray-300' : 'border-transparent'}`}
                style={{
                    backgroundColor: swatch,
                    boxShadow: isLightColor(swatch) ? 'inset 0 0 0 1px #e5e7eb' : 'none',
                }}
                title={swatch}
            />
        )}
        {label}        {onDelete && (
            <button
                type="button"
                onClick={onDelete}
                className="text-custom hover:text-teal-700"
                aria-label={`Delete ${label}`}
            >
                <Trash2 size={14} />
            </button>
        )}
    </span>
    );
};

export default Tag;
