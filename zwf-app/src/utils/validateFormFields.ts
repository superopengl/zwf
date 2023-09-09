import { assert } from './assert';
import _ from 'lodash';

export function validateFormFields(fields: any) {
  assert(fields?.length, 400, 'fields is empty.');
  assert(!fields.some(x => !x.name.trim()), 400, 'Some field name is empty.');

  const set = new Set();
  const dups = [];
  for (const field of fields) {
    const { name } = field;
    if (set.has(name)) {
      dups.push(name);
    } else {
      set.add(name);
    }
  }

  assert(!dups.length, 400, `Field name ${dups.map(x => `"${x}"`).join(',')} are not unique.`);
}
