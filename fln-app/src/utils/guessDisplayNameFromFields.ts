import * as _ from 'lodash';

export function guessDisplayNameFromFields(fields) {
  const fieldMap = _.keyBy(fields || [], 'name');
  const [givenName, surname, company] = ['Given_Name', 'Surname', 'Company'].map(k => fieldMap[k]?.value || '');
  const fullname = `${givenName} ${surname}`.trim();
  return fullname || company || 'Unnamed';
}
