import * as uniqolor from 'uniqolor';

export function generateRandomColorHex(): string {
  const { color } = uniqolor.random({
    format: 'hex',
    lightness: [0, 49],
    differencePoint: 160
  });
  return color;
}