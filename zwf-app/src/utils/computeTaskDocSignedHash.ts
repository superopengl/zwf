import * as crypto from 'crypto';
import * as moment from 'moment';
import { assert } from './assert';

export function computeTaskDocSignedHash(fileMd5: string, userId: string, timestamp: Date): string {
  assert(fileMd5, 500, 'file md5 is missing');
  assert(userId, 500, 'userId is missing');
  assert(timestamp, 500, 'timestamp is missing');
  const timeString = moment(timestamp).utc().format('YYYYMMDD HHmmss.SSS Z');
  const seed = `${fileMd5}.${userId}.${timeString}`;
  const hex = crypto.createHash('sha256').update(seed).digest('hex');
  return hex;
}