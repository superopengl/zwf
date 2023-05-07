
import dayjs from 'dayjs';

export function compareDates(a, b) {
  const momentA = dayjs(a);
  const momentB = dayjs(b);
  if (momentA > momentB)
    return 1;
  if (momentA < momentB)
    return -1;
  return 0;
}
