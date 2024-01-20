import * as uniqolor from 'uniqolor';

export function generateRandomColorHex(): string {
  const { color } = uniqolor.random({
    format: 'hex',
    saturation: [50, 100],
    lightness: [60, 90],
    differencePoint: 160
  });
  return color;
}
