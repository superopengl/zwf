import { Role } from './../types/Role';
import { Subject, Subscription, Observable } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
import * as redis from 'redis';
import * as _ from 'lodash';
import { Zevent } from '../types/Zevent';

const redisUrl = process.env.REDIS_URL;

class RedisPubService {
  private publisher = null;

  constructor(private channelName) {
    this.publisher = redis.createClient(redisUrl);
  }

  public publish(event: Zevent) {
    if (!event) return;
    const data = _.isString(event) ? event : JSON.stringify(event);
    // console.log('Event subscriber channel', 'with data:', data, event);
    this.publisher.publish(this.channelName, data);
  }
}

class RedisSubService {
  private subscriber = null;
  private eventSubject$ = new Subject<Zevent>();

  constructor(private channelName) {
    this.subscriber = redis.createClient(redisUrl);

    this.subscriber.on('message', (channel, rawData) => {
      // console.log('Event subscriber channel', channel, 'with data:', data);
      const event = JSON.parse(rawData);
      this.eventSubject$.next(event);
    });

    this.subscriber.subscribe(this.channelName);
  }

  public getObservable(): Observable<Zevent> {
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

export const publishEvent = (event: Zevent) => {
  globalPublisher.publish(event);
};

export const getEventChannel = (type: string): Observable<any> => {
  return golbalSubscriber.getObservable()
    .pipe(
      filter(x => x.type === type),
      map(x => x.payload)
    );
};

export const getEventSource$ = (filterFunc: (event: Zevent) => boolean): Observable<any> => {
  return golbalSubscriber.getObservable()
    .pipe(
      // tap(() => {
      //   console.log('for debugging');
      // }),
      filter(filterFunc),
    );
};

