import { Recurring } from '../entity/Recurring';
import { CLIENT_TZ } from '../services/recurringService';
import * as moment from 'moment-timezone';
import { Moment } from 'moment-timezone';
import { calculateRecurringNextRunAt } from './calculateRecurringNextRunAt';

function createRecurring(startFromSydneyYYYYMMDD: string, every: number, period: 'day' | 'week' | 'month' | 'year') {
  const recurring = new Recurring();
  recurring.firstRunOn = moment.tz(`${startFromSydneyYYYYMMDD} 5:00`, 'YYYY-MM-DD HH:mm', CLIENT_TZ).toDate();
  recurring.every = every;
  recurring.period = period;
  return recurring;
}

function createSydneyDate(dateString: string): Date {
  return moment.tz(dateString, 'YYYY-MM-DD HH:mm', CLIENT_TZ).toDate();
}

describe('calculateRecurringNextRunAt', () => {
  let nowMoment: Moment;

  beforeAll(() => {
    Date.now = jest.fn().mockReturnValue(createSydneyDate('2021-01-31 13:00'));
    nowMoment = moment();
  });

  afterAll(() => {
    (Date.now as any).mockRestore();
  });
  describe('firstRunOn is past day', () => {

    it('nextRunAt should be future day with 1 week recurring', () => {
      const recurring = createRecurring('2021-01-15', 1, 'week');
      const nextRunAt = calculateRecurringNextRunAt(recurring);
      const expected = createSydneyDate('2021-02-05 5:00');
      expect(nextRunAt).toEqual(expected);
    });

    it('nextRunAt should be future day with 2 week recurring', () => {
      const now = moment().toDate();
      const recurring = createRecurring('2021-01-15', 2, 'week');
      const nextRunAt = calculateRecurringNextRunAt(recurring);
      const expected = createSydneyDate('2021-02-12 5:00');
      expect(nextRunAt).toEqual(expected);
    });

    it('nextRunAt should be future day with 1 month recurring', () => {
      const recurring = createRecurring('2021-01-15', 1, 'month');
      const nextRunAt = calculateRecurringNextRunAt(recurring);
      const expected = createSydneyDate('2021-02-15 5:00');
      expect(nextRunAt).toEqual(expected);
    });

    it('nextRunAt should be future day with 3 month recurring', () => {
      const recurring = createRecurring('2021-01-15', 3, 'month');
      const nextRunAt = calculateRecurringNextRunAt(recurring);
      const expected = createSydneyDate('2021-04-15 5:00');
      expect(nextRunAt).toEqual(expected);
    });

    it('nextRunAt should be future day with yearly recurring', () => {
      const recurring = createRecurring('2021-01-15', 1, 'year');
      const nextRunAt = calculateRecurringNextRunAt(recurring);
      const expected = createSydneyDate('2022-01-15 5:00');
      expect(nextRunAt).toEqual(expected);
    });
  });

  describe('firstRunOn is past last day of month', () => {
    it('nextRunAt should be future last day of month with 1 month recurring', () => {
      const recurring = createRecurring('2021-01-31', 1, 'month');
      const nextRunAt = calculateRecurringNextRunAt(recurring);
      const expected = createSydneyDate('2021-02-28 5:00');
      expect(nextRunAt).toEqual(expected);
    });


    it('nextRunAt should be future last day of month with 3 month recurring', () => {
      const recurring = createRecurring('2021-01-31', 3, 'month');
      const nextRunAt = calculateRecurringNextRunAt(recurring);
      const expected = createSydneyDate('2021-04-30 5:00');
      expect(nextRunAt).toEqual(expected);
    });
  });

  describe('firstRunOn is future day', () => {
    it('nextRunAt should be firstRunOn day', () => {
      const recurring = createRecurring('2021-02-01', 3, 'month');
      const nextRunAt = calculateRecurringNextRunAt(recurring);
      const expected = createSydneyDate('2021-02-01 5:00');
      expect(nextRunAt).toEqual(expected);
    });
  });
});