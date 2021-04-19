import * as redis from 'redis';

class RedisCache {
  private redisCache;
  constructor(redisUrl: string) {
    this.redisCache = redis.createClient(redisUrl);

  }

  async get(key) {
    return new Promise((res, rej) => {
      this.redisCache.get(key, (err, result) => {
        return err ? rej(err) : res(JSON.parse(result));
      });
    });
  }

  async del(key) {
    return new Promise((res, rej) => {
      this.redisCache.del(key, (err, result) => {
        return err ? rej(err) : res(result);
      });
    });
  }


  async set(key: string, value: any) {
    return new Promise((res, rej) => {
      this.redisCache.set(key, JSON.stringify(value), (err, result) => {
        return err ? rej(err) : res(result);
      });
    });
  }

  async setex(key: string, seconds: number, value: any) {
    return new Promise((res, rej) => {
      this.redisCache.setex(key, seconds, JSON.stringify(value), (err, result) => {
        return err ? rej(err) : res(result);
      });
    });
  }

  async incr(key: string) {
    return new Promise((res, rej) => {
      this.redisCache.incr(key, (err, result) => {
        return err ? rej(err) : res(result);
      });
    });
  }

  async decr(key: string) {
    return new Promise((res, rej) => {
      this.redisCache.decr(key, (err, result) => {
        return err ? rej(err) : res(result);
      });
    });
  }

  async flush() {
    return new Promise((res, rej) => {
      this.redisCache.flushall((err, reply) => {
        return err ? rej(err) : res(reply);
      });
    });
  }
}

export const redisCache = new RedisCache(process.env.REDIS_URL);