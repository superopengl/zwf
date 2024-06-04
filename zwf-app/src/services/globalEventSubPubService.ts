import { Role } from './../types/Role';
import { Subject, Subscription, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import * as redis from 'redis';
import * as _ from 'lodash';

const redisUrl = process.env.REDIS_URL;

type Event = {
  type: string,
  payload: any
};

class RedisPubService {
  private publisher = null;

  constructor(private channelName) {
    this.publisher = redis.createClient(redisUrl);
  }

  public publish(event: Event) {
    if (!event) return;
    const data = _.isString(event) ? event : JSON.stringify(event);
    // console.log('Event subscriber channel', 'with data:', data, event);
    this.publisher.publish(this.channelName, data);
  }
}

class RedisSubService {
  private subscriber = null;
  private eventSubject$ = new Subject<Event>();

  constructor(private channelName) {
    this.subscriber = redis.createClient(redisUrl);

    this.subscriber.on('message', (channel, rawData) => {
      // console.log('Event subscriber channel', channel, 'with data:', data);
      const event = JSON.parse(rawData);
      this.eventSubject$.next(event);
    });

    this.subscriber.subscribe(this.channelName);
  }

  public getObservable(): Observable<Event> {
    return this.eventSubject$;
  }
}

const REDIS_CHANNEL_NAME = 'zwf-server-event-subpub';

class RedisRealtimePricePubService extends RedisPubService {
  constructor() {
    super(REDIS_CHANNEL_NAME);
  }
}

class RedisRealtimePriceSubService extends RedisSubService {
  constructor() {
    super(REDIS_CHANNEL_NAME);
  }
}

const globalPublisher = new RedisRealtimePricePubService();
const golbalSubscriber = new RedisRealtimePriceSubService();

export const publishEvent = (type: string, payload: any) => {
  globalPublisher.publish({
    type,
    payload,
  });
};

export const getEventChannel = (type: string): Observable<any> => {
  return golbalSubscriber.getObservable()
    .pipe(
      filter(x => x.type === type),
      map(x => x.payload)
    );
};

