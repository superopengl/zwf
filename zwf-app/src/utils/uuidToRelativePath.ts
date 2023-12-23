import { validate } from 'uuid';

export const uuidToRelativePath = (uuid) => {
  if (!validate(uuid)) {
    throw new Error(`${uuid} is not a valid UUID`);
  }

  const str = uuid.replace(/-/g, '');
  const dir = [];
  let start = 0;
  Array.from(str).forEach((c, i) => {
    if (i % 4 === 3) {
      dir.push(str.substr(start, 4));
      start = i + 1;
    }
  });

  return dir.join('/');
};