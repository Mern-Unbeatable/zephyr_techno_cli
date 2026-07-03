import colornames from 'colornames';
import ntc from 'ntcjs';

function hashNameToHex(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  const saturation = 55 + (Math.abs(hash >> 8) % 25);
  const lightness = 42 + (Math.abs(hash >> 16) % 18);
  return hslToHex(hue, saturation, lightness);
}

function hslToHex(h, s, l) {
  const sat = s / 100;
  const light = l / 100;
  const c = (1 - Math.abs(2 * light - 1)) * sat;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = light - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;

  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];

  const toHex = (v) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, '0');

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function lookupCssColorName(name) {
  const direct = colornames(name);
  if (direct) return direct;

  const words = name.split(/[\s-_]+/).filter(Boolean);
  for (let size = words.length; size >= 1; size -= 1) {
    for (let i = 0; i <= words.length - size; i += 1) {
      const phrase = words.slice(i, i + size).join(' ');
      const hex = colornames(phrase);
      if (hex) return hex;
    }
  }

  return null;
}

function lookupNtcColorName(name) {
  const entries = ntc.names || [];
  const key = name.toLowerCase().trim();
  const words = key.split(/[\s-_]+/).filter((w) => w.length > 1);

  for (const entry of entries) {
    const hex = `#${entry[0]}`;
    const label = entry[1].toLowerCase();
    if (label === key) return hex;
  }

  for (const entry of entries) {
    const hex = `#${entry[0]}`;
    const label = entry[1].toLowerCase();
    if (key.includes(label) || label.includes(key)) return hex;
  }

  let bestHex = null;
  let bestScore = 0;

  for (const entry of entries) {
    const hex = `#${entry[0]}`;
    const label = entry[1].toLowerCase();
    let score = 0;

    for (const word of words) {
      if (label.includes(word)) score += word.length;
    }

    if (words.length > 1 && words.every((word) => label.includes(word))) {
      score += 20;
    }

    if (score > bestScore) {
      bestScore = score;
      bestHex = hex;
    }
  }

  return bestScore > 0 ? bestHex : null;
}

function hexLuminance(hex) {
  const normalized = hex.replace('#', '');
  const r = parseInt(normalized.slice(0, 2), 16) / 255;
  const g = parseInt(normalized.slice(2, 4), 16) / 255;
  const b = parseInt(normalized.slice(4, 6), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Resolve swatch color from API hexCode, CSS/NTC name databases, or a stable hash.
 */
export function getColorHex(colorName, hexCode) {
  if (hexCode && /^#[0-9A-Fa-f]{6}$/.test(hexCode)) return hexCode;

  const key = colorName?.toLowerCase().trim() || '';
  if (!key) return '#9ca3af';

  return (
    lookupCssColorName(key) ||
    lookupNtcColorName(key) ||
    hashNameToHex(key)
  );
}

export function isLightColor(hex) {
  if (!hex || !/^#[0-9A-Fa-f]{6}$/.test(hex)) return false;
  return hexLuminance(hex) > 0.72;
}
