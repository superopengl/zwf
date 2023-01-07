import { getRepository } from 'typeorm';
import { SysLog } from '../entity/SysLog';
import { serializeError } from 'serialize-error';
import { String } from 'aws-sdk/clients/cloudsearchdomain';
import * as _ from 'lodash';


function serializeReq(req): string {
  const data = req ? _.pick(req, ['user', 'method', 'originalUrl', 'body', 'query', 'params', 'route', 'headers', 'headerSent']) : req;
  return JSON.stringify(data);
}

function serializeRes(res): String {
  const data = res ? _.pick(res, ['user', 'headers', 'headersSent', 'statusCode']) : res;
  return JSON.stringify(data);
}

export async function logError(err, req, res, ...args) {
  try {
    const data = {
      error: serializeError(err),
      args: args
    };

    const log: SysLog = {
      level: 'error',
      createdBy: req.user ? JSON.stringify(req.user) : undefined,
      req: serializeReq(req),
      data: JSON.stringify(data)
    };
    const repo = getRepository(SysLog);

    await repo.save(log);
  } catch (err) {
    console.error('sysLog error', err);
    // swallow error
  }
}