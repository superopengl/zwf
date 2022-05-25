import * as crypto from 'crypto';
import { assert } from './assert';

export function computeTaskFileSignedHash(fileMd5: string, userId: string, timestamp: Date): string {
  assert(fileMd5, 500, 'file md5 is missing');
  assert(userId, 500, 'userId is missing');
  assert(timestamp, 500, 'timestamp is missing');
  const timeString = timestamp.valueOf();
  const seed = `${fileMd5}.${userId}.${timeString}`;
  const hex = crypto.createHash('sha256').update(seed).digest('hex');
  return hex;
}