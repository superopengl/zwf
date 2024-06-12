
import * as jwt from 'jsonwebtoken';
import { getUtcNow } from './getUtcNow';
import * as moment from 'moment';
import { assert } from './assert';
import { sanitizeUser } from './sanitizeUser';

const cookieName = 'jwt';
const isProd = process.env.NODE_ENV === 'prod';

export const COOKIE_OPTIONS = {
  httpOnly: true,
  signed: false,
  sameSite: isProd ? 'none' : undefined,
  secure: isProd ? true : undefined,
};

export function attachJwtCookie(user, res) {
  assert(user.id, 500, 'User has no id');
  const payload = sanitizeUser(user);
  payload.expires = moment(getUtcNow()).add(30, 'minutes').toDate();

  const token = jwt.sign(payload, JwtSecret);

  res.cookie(cookieName, token, {
    ...COOKIE_OPTIONS,
    maxAge: 1000 * 60 * 60 * 24, // 24 hours
    expires: moment(getUtcNow()).add(24, 'hours').toDate(),
  });
}

export const JwtSecret = 'zeeworkflow.com';

export function verifyJwtFromCookie(req) {
  const token = req.cookies[cookieName];
  let user = null;
  if (token) {
    user = jwt.verify(token, JwtSecret);
    // const { expires } = user;
    // assert(moment(expires).isAfter(), 401, 'Token expired');
  }

  return user;
}

export function clearJwtCookie(res) {
  res.clearCookie(cookieName, COOKIE_OPTIONS);
}