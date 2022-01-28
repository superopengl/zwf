import * as uniqolor from 'uniqolor';

export function generateRandomAvatarColorHex(): string {
  const { color } = uniqolor.random({
    format: 'hex',
    lightness: [0, 49],
    differencePoint: 160
  });
  return color;
}
