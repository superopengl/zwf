
import * as moment from 'moment';

export function compareDates(a, b) {
  const momentA = moment(a);
  const momentB = moment(b);
  if (momentA > momentB)
    return 1;
  if (momentA < momentB)
    return -1;
  return 0;
}
