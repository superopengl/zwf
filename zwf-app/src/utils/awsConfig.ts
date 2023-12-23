import * as aws from 'aws-sdk';
import { assert } from './assert';

export function awsConfig() {
  const { AWS_DEFAULT_REGION, ZWF_AWS_ACCESS_KEY_ID, ZWF_AWS_SECRET_ACCESS_KEY } = process.env;

  assert(AWS_DEFAULT_REGION, 500, 'AWS_DEFAULT_REGION is not specified');

  aws.config.update({ region: AWS_DEFAULT_REGION });

  if (ZWF_AWS_ACCESS_KEY_ID && ZWF_AWS_SECRET_ACCESS_KEY) {
    aws.config.update({
      accessKeyId: ZWF_AWS_ACCESS_KEY_ID,
      secretAccessKey: ZWF_AWS_SECRET_ACCESS_KEY,
    });
  } else {
    console.log('AWS default config');
  }
}