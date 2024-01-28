import { createClient } from 'redis';
import conf from '../../config.json';

export class Cache {
  private client: ReturnType<typeof createClient>;

  constructor(
    readonly url: string,
    readonly port: number,
  ) {}

  connect = async (): Promise<void> => {
    this.client = await createClient({
      socket: {
        port: this.port,
        host: this.url,
      },
    })
      .on('connect', () => console.log('Redis Client Connected'))
      .on('error', (err: string) => console.log('Redis Client Error', err))
      .connect();
  };

  set = async (key: string, data: object, hrs: number): Promise<void> => {
    if (conf.noCache) {
      await this.client.del(key);
    } else {
      const jsonString = JSON.stringify(data);
      await this.client.set(key, jsonString, { EX: 60 * 60 * hrs });
    }
  };

  get = async <T extends object>(key: string): Promise<T | undefined> => {
    const cached = await this.client.get(key);
    return cached ? JSON.parse(cached) : undefined;
  };
}
