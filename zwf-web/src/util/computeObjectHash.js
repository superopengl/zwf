import * as hash from 'object-hash';

export function computeObjectHash(variables) {
  return hash(variables, { unorderedObjects: true });
}

