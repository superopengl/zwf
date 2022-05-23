import { assert } from './assert';
import * as aws from 'aws-sdk';
import { awsConfig } from './awsConfig';

function getS3Service() {
  awsConfig();
  return new aws.S3();
}// Upload your image to S3


function getDefaultConfig(fileId, name) {
  const bucketName = process.env.ZWF_S3_BUCKET;
  const prefix = process.env.ZWF_FILE_PREFIX;
  const key = `${prefix}/${fileId}/${name}`;
  assert(prefix && fileId, 404, `file path cannot be composed '${bucketName}/${key}'`);
  return {
    Bucket: bucketName,
    Key: key,
  };
}

export async function uploadToS3(fileId, name, data): Promise<string> {
  const s3 = getS3Service();
  const defaultOpt = getDefaultConfig(fileId, name);

  const opt = {
    ...defaultOpt,
    Body: data
  };
  const resp = await s3.upload(opt).promise();

  // return the S3's path to the image
  return resp.Location;
}

export function getS3ObjectStream(id, name) {
  const s3 = getS3Service();
  const opt = getDefaultConfig(id, name);

  return s3.getObject(opt).createReadStream();
}