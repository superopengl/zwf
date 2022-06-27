import { Recurring } from '../entity/Recurring';
import { CLIENT_TZ } from '../services/recurringService';
import * as moment from 'moment-timezone';


export function calculateRecurringNextRunAt(recurring: Recurring): Date {
  const { firstRunOn, every, period } = recurring;
  const startMoment = moment(firstRunOn);
  if (startMoment.isAfter()) {
    // If the first one hasn't happen
    return firstRunOn;
  }

  const nextRunMoment = startMoment.tz(CLIENT_TZ).add(every, period);
  while (nextRunMoment.isBefore()) {
    nextRunMoment.add(every, period);
  }
  return nextRunMoment.toDate();
}
