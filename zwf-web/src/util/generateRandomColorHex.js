import uniqolor from 'uniqolor';

export function generateRandomColorHex() {
  const { color } = uniqolor.random({
    format: 'hex',
    saturation: [50,100],
    lightness: [60,90],
  });
  return color;
}
