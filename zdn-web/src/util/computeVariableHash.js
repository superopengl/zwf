import * as hash from 'object-hash';

export function computeVariablesHash(variables) {
  return hash(variables, { unorderedObjects: true });
}

