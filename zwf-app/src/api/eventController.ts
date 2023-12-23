
import { assertRole } from "../utils/assertRole";
import { handlerWrapper } from '../utils/asyncHandler';
import { publishEvent, subscribeEvent } from '../services/globalEventSubPubService';
import { getOrgIdFromReq } from "../utils/getOrgIdFromReq";
import { getUserIdFromReq } from "../utils/getUserIdFromReq";

const isProd = process.env.NODE_ENV === 'prod';
const subscriber = new RedisRealtimePriceSubService();
const publisher = new RedisRealtimePricePubService();

export const subscribeEvent = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent', 'client');
  const orgId = getOrgIdFromReq(req);
  const userId = getUserIdFromReq(req);

  // const { user: { id: userId } } = req as any;
  const symbolSet = new Set((req.query.symbols as string || '').split(',').map(s => s.trim().toUpperCase()).filter(x => !!x));
  if (!isProd) {
    res.setHeader('Access-Control-Allow-Origin', process.env.ZWF_WEB_DOMAIN_NAME);
  }
  res.sse();
  // res.setHeader('Content-Type', 'text/event-stream');
  // res.setHeader('Cache-Control', 'no-cache');
  // res.flushHeaders();

  // res.writeHead(200, {
  //   // Connection: 'keep-alive',
  //   // 'Content-Type': 'text/event-stream',
  //   // 'Cache-Control': 'no-cache',
  //   'Access-Control-Allow-Origin': 'http://localhost:6007'
  // });
  // res.flushHeaders();

  const channel$ = subscriber.subscribe((event, rawData) => {
      if (!event) {
        return;
      }
      const { type, data } = event;
      if (type !== 'price' || !symbolSet.size || symbolSet.has(data?.symbol)) {
        res.write(`data: ${rawData}\n\n`);
        (res as any).flush();
      }
    });

  res.on('close', () => {
    channel$.unsubscribe();
    res.end();
  });
});

export const publishEvent = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const event = req.body;

  publisher.publish(event);

  res.json();
});