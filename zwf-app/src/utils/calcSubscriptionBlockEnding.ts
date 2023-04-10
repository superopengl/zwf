import * as moment from 'moment';

export function calcSubscriptionBlockEnding(startedAt: moment.Moment | Date) {
  return moment(startedAt).add(30, 'days').add(-1, 'day').endOf('day').toDate();
}
