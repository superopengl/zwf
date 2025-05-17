import { resolveSoa } from 'dns';
import { File } from '../entity/File';
import { assert } from './assert';
import { logError } from './logger';
import { getS3ObjectStream } from './uploadToS3';


export function streamFileToResponse(file: File, res) {
  assert(file, 404);

  const { id, fileName, mime } = file;

  const stream = getS3ObjectStream(id, fileName);
  res.setHeader('Content-type', mime);
  res.setHeader('Content-disposition', `attachment; filename="${fileName}"`);
  res.setHeader('Cache-Control', `public, max-age=36536000, immutable`);

  stream.pipe(res);

  stream.on('error', e => {
    res.status(500);
    logError(e, null, null, { file });
  });
}
