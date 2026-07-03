import { isLightColor } from '../../../../utils/color';

const normalizeHex = (value) => {
  if (!value) return '#9CA3AF';
  const trimmed = value.trim().toUpperCase();
  if (/^#[0-9A-F]{6}$/.test(trimmed)) return trimmed;
  if (/^[0-9A-F]{6}$/.test(trimmed)) return `#${trimmed}`;
  return '#9CA3AF';
};

const ColorHexInput = ({ name, value, onChange }) => {
  const hex = normalizeHex(value);

  const emitChange = (nextHex) => {
    onChange({
      target: {
        name,
        value: normalizeHex(nextHex),
      },
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={hex}
          onChange={(e) => emitChange(e.target.value)}
          className="h-11 w-14 cursor-pointer rounded border border-gray-200 bg-white p-1"
          aria-label="Pick color"
        />
        <input
          type="text"
          value={hex}
          onChange={(e) => emitChange(e.target.value)}
          placeholder="#FF0000"
          className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-custom focus:outline-none"
        />
        <div
          className={`h-11 w-11 shrink-0 rounded-full border ${isLightColor(hex) ? 'border-gray-300' : 'border-transparent'}`}
          style={{
            backgroundColor: hex,
            boxShadow: isLightColor(hex) ? 'inset 0 0 0 1px #e5e7eb' : 'none',
          }}
          title={hex}
        />
      </div>
      <p className="text-xs text-gray-400">
        Auto-filled from the color name. Adjust with the picker if needed.
      </p>
    </div>
  );
};

export default ColorHexInput;
