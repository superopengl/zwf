
import * as jwt from 'jsonwebtoken';
import { getNow } from './getNow';
import * as moment from 'moment';
import { UserRole } from 'aws-sdk/clients/workmail';
import { assert } from './assert';
import { User } from '../entity/User';

const cookieName = 'jwt';
const isProd = process.env.NODE_ENV === 'prod';

export function attachJwtCookie(user: User, res) {
  assert(user.id, 500, `User has no id`);
  const payload = {
    id: user.id,
    email: user.email,
    givenName: user.givenName,
    surname: user.surname,
    role: user.role,
    loginType: user.loginType,
    org: {
      name: user.org.name,
      id: user.org.id,
    },
    expires: moment(getNow()).add(24, 'hours').toDate()
  };
  const token = jwt.sign(payload, JwtSecret);

  res.cookie(cookieName, token, {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24, // 24 hours
    expires: moment(getNow()).add(24, 'hours').toDate(),
    signed: false,
    sameSite: isProd ? 'strict' : undefined,
    secure: isProd ? true : undefined,
  });
}

export const JwtSecret = 'techseeding.fln';

export function verifyJwtFromCookie(req): { id: string, email: string, role: UserRole } {
  const token = req.cookies[cookieName];
  let user = null;
  if (token) {
    user = jwt.verify(token, JwtSecret);
    const { expires } = user;
    assert(moment(expires).isAfter(), 401, 'Token expired');
  }

  return user;
}

export function clearJwtCookie(res) {
  res.clearCookie(cookieName);
}