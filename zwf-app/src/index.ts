import * as path from 'path';
import * as http from 'http';
import * as dotenv from 'dotenv';
loadEnv();
import { createAppInstance } from './app';
import { connectDatabase } from './db';
import { getEmailTemplate } from './services/mjmlService';
import { EmailTemplateType } from './types/EmailTemplateType';

function validateEnvVars() {
  const requiredEnvVars = [
    'ZWF_WEB_DOMAIN_NAME',
    'ZWF_S3_BUCKET',
    'AWS_DEFAULT_REGION',
    'ZWF_FILE_PREFIX',
    'GIT_HASH',
    'ZWF_GOOGLE_SSO_CLIENT_SECRET',
  ];

  const missingVars = requiredEnvVars.map(v => process.env[v]).filter(x => !x);

  if (missingVars.length) {
    throw new Error(`Env vars missing: ${missingVars.join(', ')}`);
  }
}

function loadEnv() {
  const env = (process.env.NODE_ENV || 'dev').toLowerCase();
  const isNonProd = env !== 'prod' && env !== 'production';
  if (isNonProd) {
    // non prod
    const envPath = path.resolve(process.cwd(), `.env.${env}`);
    console.log('Overriding env vars with', envPath);
    dotenv.config({ path: envPath });
  }

  dotenv.config();
  console.log('Environment variables');
  console.log(JSON.stringify(process.env, undefined, 2));

  validateEnvVars();
}

async function launchApp() {

  getEmailTemplate(EmailTemplateType.WelcomeOrg);

  console.log('Connecting database');
  await connectDatabase(false);

  const app = createAppInstance();

  const httpPort = +process.env.ZWF_HTTP_PORT || 80;
  const server = http.createServer(app);

  // const httpsPort = +process.env.ZWF_HTTPS_PORT || 443;
  // // start https server
  // const sslOptions = {
  //   key: fs.readFileSync(`${__dirname}/_assets/keys/localhost.key`, 'utf8'),
  //   cert: fs.readFileSync(`${__dirname}/_assets/keys/localhost.crt`, 'utf8')
  // };

  // https.createServer(sslOptions, app).listen(httpsPort);

  // const wss = new WebSocket.Server({server});
  // createWebsocketServer(wss);

  server.listen(httpPort);

  console.log(`Started on ${httpPort}`);
}

try {
  launchApp();
} catch (e) {
  console.error('Fatal error', e);
}