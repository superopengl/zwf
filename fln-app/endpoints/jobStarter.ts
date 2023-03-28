import { Connection } from 'typeorm';
import errorToJson from 'error-to-json';
import { connectDatabase } from '../src/db';
import 'colors';
import * as dotenv from 'dotenv';
import { logDataEvent } from '../src/services/dataLogService';
import { v4 as uuidv4 } from 'uuid';

export const start = async (jobName: string, jobFunc: () => Promise<any>, options?: { syncSchema?: boolean, daemon?: boolean }) => {
  let connection: Connection = null;
  const eventId = uuidv4();
  const shouldSyncSchema = !!options?.syncSchema;
  const oneTimeRun = !options?.daemon;
  let error;
  try {
    dotenv.config();
    connection = await connectDatabase(shouldSyncSchema);
    console.log('Task', jobName, 'started');
    await logDataEvent({ eventId, eventType: jobName, status: 'started', by: 'task' })
    await jobFunc();
    if (oneTimeRun) {
      console.log('Task', jobName, 'done');
      await logDataEvent({ eventId, eventType: jobName, status: 'done', by: 'task' })
    }
  } catch (e) {
    const jsonError = errorToJson(e);
    console.error('Task', jobName, 'failed', jsonError);
    await logDataEvent({ eventId, eventType: jobName, status: 'error', by: 'task', data: jsonError });
    error = e;
  } finally {
    if (error || oneTimeRun) {
      try {
        await connection?.close();
      } catch {
      }
      process.exit();
    }
  }
};
