import { Connection } from 'typeorm';
import errorToJson from 'error-to-json';
import { connectDatabase } from '../src/db';
import 'colors';
import * as dotenv from 'dotenv';

export const start = async (jobName: string, jobFunc: () => Promise<any>, options?: { syncSchema?: boolean, daemon?: boolean }) => {
  let connection: Connection = null;
  const shouldSyncSchema = !!options?.syncSchema;
  const oneTimeRun = !options?.daemon;
  let error;
  try {
    dotenv.config();
    connection = await connectDatabase(shouldSyncSchema);
    console.log('Task', jobName, 'started');
    await jobFunc();
    if (oneTimeRun) {
      console.log('Task', jobName, 'done');
    }
  } catch (e) {
    const jsonError = errorToJson(e);
    console.error('Task', jobName, 'failed', jsonError);
    error = e;
  } finally {
    if (error || oneTimeRun) {
      try {
        await connection?.close();
      } catch {
      }
      process.exit(error ? 1 : 0);
    }
  }
};
