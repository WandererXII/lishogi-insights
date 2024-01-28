import { Database } from './database';
import { Cache } from './cache';
import conf from '../../config.json';
import { lock } from './mutex';
import { Filter, Game, Result, Type } from '../types';
import { moves } from '../handlers/moves';
import { opponents } from '../handlers/opponents';
import { times } from '../handlers/times';
import { outcomes } from '../handlers/outcomes';
import { analysis } from '../handlers/analysis';
import { filterToKey } from '../util';
import { custom } from '../handlers/custom/custom';

export class Proxy {
  private db: Database;
  private cache: Cache;
  private gameLock;
  private resultLock;

  constructor() {
    this.db = new Database(conf.mongo.url, conf.mongo.db, conf.mongo.coll);
    this.cache = new Cache(conf.redis.host, conf.redis.port);
    this.gameLock = lock<Game[]>();
    this.resultLock = lock<Result>();
  }

  async initialize() {
    return Promise.all([this.db.connect(), this.cache.connect()]);
  }

  async getResult(type: Type, username: string, flt: Filter): Promise<Result> {
    const key = `${username}:${type}-${filterToKey(flt)}`;

    let cached: Result | undefined = await this.cache.get<Result>(key);

    if (conf.logging) {
      if (cached) console.debug('res - cache hit');
      else console.debug('res - cache miss');
    }

    if (!cached) {
      cached = await this.resultLock.acquire(key);
      try {
        if (!cached) {
          const games = await this.getGames(username);
          cached = this.createResult(type, games, flt);

          await this.cache.set(key, cached, 2);
        }
      } finally {
        this.resultLock.release(key, cached!);
      }
    }

    return cached;
  }

  private createResult(type: Type, games: Game[], flt: Filter): Result {
    switch (type) {
      case 'analysis':
        return analysis(games, flt);
      case 'moves':
        return moves(games, flt);
      case 'opponents':
        return opponents(games, flt);
      case 'times':
        return times(games, flt);
      case 'custom':
        return custom(games, flt);
      default:
        return outcomes(games, flt);
    }
  }

  async getGames(username: string): Promise<Game[]> {
    let cached: Game[] | undefined = await this.cache.get<Game[]>(username);

    if (conf.logging) {
      if (cached) console.debug('game - cache hit');
      else console.debug('game - cache miss');
    }

    if (!cached) {
      cached = await this.gameLock.acquire(username);
      try {
        if (!cached) {
          cached = await this.db.get(username);
          await this.cache.set(username, cached, 4);
        }
      } finally {
        this.gameLock.release(username, cached!);
      }
    }

    return cached;
  }
}
