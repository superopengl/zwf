import { start } from './jobStarter';

const JOB_NAME = 'sync-db-schema';

start(JOB_NAME, async () => {  /* Does nothing */ }, { syncSchema: true });
