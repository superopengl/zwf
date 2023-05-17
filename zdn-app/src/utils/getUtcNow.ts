import * as moment from 'moment';

export const getUtcNow = (): Date => {
  return moment().utc().toDate();
};

