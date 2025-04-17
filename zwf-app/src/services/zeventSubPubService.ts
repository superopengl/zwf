import { Role } from '../types/Role';
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

  public async publish(event: Zevent) {
    if (!event) return;
    const data = _.isString(event) ? event : JSON.stringify(event);
    // console.log('Event subscriber channel', 'with data:', data, event);
    await this.publisher.publish(this.channelName, data);
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

const globalPublisher = new RedisPubService(REDIS_CHANNEL_NAME);
const golbalSubscriber = new RedisSubService(REDIS_CHANNEL_NAME);

export const publishZevent = async (event: Zevent) => {
  await globalPublisher.publish(event);
};

export const getZeventSource$ = (): Observable<Zevent> => {
  return golbalSubscriber.getObservable();
};

