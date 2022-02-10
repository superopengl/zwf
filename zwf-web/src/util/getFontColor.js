
export function getFontColor(bgColorHex) {
  if (!bgColorHex) return null;

  // If a leading # is provided, remove it
  if (bgColorHex.slice(0, 1) === '#') {
    bgColorHex = bgColorHex.slice(1);
  }

  // If a three-character hexcode, make six-character
  if (bgColorHex.length === 3) {
    bgColorHex = bgColorHex.split('').map(hex => hex + hex).join('');
  }

  // Convert to RGB value
  const r = parseInt(bgColorHex.substr(0, 2), 16);
  const g = parseInt(bgColorHex.substr(2, 2), 16);
  const b = parseInt(bgColorHex.substr(4, 2), 16);

  // Get YIQ ratio
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;

  // Check contrast
  return (yiq >= 128) ? 'black' : 'white';
}
