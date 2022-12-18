import { backendVersionMiddleware } from './middlewares/backendVersionMiddleware';
import * as express from 'express';
import * as compression from 'compression';
import * as listEndpoints from 'express-list-endpoints';
import * as cors from 'cors';
import * as path from 'path';
import * as fileUpload from 'express-fileupload';
import * as YAML from 'yamljs';
import { connector } from 'swagger-routes-express';
import * as api from './api';
import { authMiddleware } from './middlewares/authMiddleware';
import * as cookieParser from 'cookie-parser';
import { logError } from './utils/logger';
import { sseMiddleware } from 'express-sse-middleware';
import * as serveStatic from 'serve-static';
import { taskDirectLinkHanlder } from './api/taskDirectLinkHanlder';
import { clearJwtCookie } from './utils/jwt';


function errorHandler(err, req, res, next) {
  if (err && !/^4/.test(res.status)) {
    logError(err, req, res);
  }
  if (res.headersSent) {
    return next(err);
  }
  res.status(err.status || 500);
  res.json(err.message);
}

function connectSwaggerRoutes(app, ymlFile) {
  const apiDefinition = YAML.load(ymlFile);
  const connect = connector(api, apiDefinition, {
    security: {
      // authAnyRole,
      // authAdmin,
      // authGuest,
      // authLoggedInUser,
      // authAdminOrAgent,
      // authClient
    }
  });
  connect(app);

  return app;
}

const staticWwwDir = path.resolve(__dirname, '..', 'www');

// create and setup express app
export function createAppInstance() {
  const app = express();
  app.use(cors({
    origin: ['http://localhost:6003'],
    credentials: true,
    exposedHeaders: ['zwf-bff-version'], // To allow frontend to get it via xhr.getResponseHeader()
  }));
  app.use(cookieParser());
  // app.use(cookieSession({
  //   name: 'session',
  //   keys: ['zwf'],
  //   // Cookie Options
  //   maxAge: 24 * 60 * 60 * 1000, // 24 hours
  //   httpOnly: true
  // }));
  // app.use(jwt({
  //   secret: JwtSecret,
  //   algorithms: ['HS256'],
  //   requestProperty: 'user',
  //   getToken: req => {
  //     return req.cookies['jwt'] || null;
  //   }
  // }));
  app.use(sseMiddleware);

  app.use(express.json({ limit: '8mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));
  // app.use(expressSession({
  //   name: 'session',
  //   secret: 'zwf',
  //   cookie: {
  //     httpOnly: true
  //   },
  //   genid: () => uuidv4(),
  //   rolling: true,
  // }));

  app.use(fileUpload({
    createParentPath: true
  }));

  // // Redirect HTTP to HTTPS
  // app.all('*', (req, res, next) => {
  //   if (req.secure) {
  //     return next();
  //   }
  //   res.redirect(`https://${req.hostname}${httpsPort === 443 ? '' : `:${httpsPort}`}${req.url}`);
  // });
  // connectPassport(app);

  app.use(backendVersionMiddleware);
  app.use(authMiddleware);
  app.use((req, res, next) => {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    next();
  });
  // app.use(passport.initialize());
  // app.use(passport.session());

  app.use(compression({ filter: (req, res) => !req.headers['x-no-compression'] && compression.filter(req, res) }));
  // Connect to /api/v*/ with the swagger file
  connectSwaggerRoutes(app, `${__dirname}/_assets/api.yml`);


  app.get('/app/healthcheck', (req, res) => res.send('OK'));

  app.get('/app/r/:token', (req, res) => {
    const { token } = req.params;
    const r = req.query.r as string;
    const returnUrlParam = r ? `?r=${encodeURIComponent(r)}` : '';
    const url = `/api/v1/auth/r/${token}` + returnUrlParam;
    clearJwtCookie(res);
    res.redirect(url);
  });

  app.get('/app/t/:token', taskDirectLinkHanlder);

  // app.get('/env', (req, res) => res.json(process.env));
  // app.get('/routelist', (req, res) => res.json(listEndpoints(app)));
  app.use('/', serveStatic(staticWwwDir, {
    cacheControl: true,
    setHeaders: (res, path) => {
      res.setHeader('Cache-Control', 'public, max-age=36536000, immutable');
    }
  }));

  app.use(errorHandler);

  // Debounce to frontend routing
  app.get('*', (req, res) => res.sendFile(`${staticWwwDir}/index.html`));

  console.log(listEndpoints(app));

  return app;
}

