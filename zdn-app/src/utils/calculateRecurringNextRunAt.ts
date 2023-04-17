import { Recurring } from '../entity/Recurring';
import { CLIENT_TZ } from '../services/recurringService';
import * as moment from 'moment-timezone';


export function calculateRecurringNextRunAt(recurring: Recurring): Date {
  const { startFrom, every, period } = recurring;
  let startMoment = moment(startFrom);
  if (startMoment.isAfter()) {
    // If the first one hasn't happen
    return startFrom;
  }

  let nextRunMoment = startMoment.tz(CLIENT_TZ).add(every, period);
  while(nextRunMoment.isBefore()) {
    nextRunMoment.add(every, period);
  }
  return nextRunMoment.toDate();
}
