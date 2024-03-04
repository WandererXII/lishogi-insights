import { MongoClient, MongoClientOptions, Db, Collection } from 'mongodb';
import { processGameDocument } from './bdocHandler';
import { Game, Latest } from '../types';
import { getDateNDaysAgo } from '../util';

export class Database {
  private client: MongoClient;
  private db: Db;
  private collection: Collection;

  constructor(
    readonly mongoURL: string,
    readonly dbName: string,
    readonly collectionName: string,
    readonly analysisCollectionName: string,
  ) {}

  connect = async (): Promise<void> => {
    try {
      const dbOptions: MongoClientOptions = {};
      this.client = await MongoClient.connect(this.mongoURL, dbOptions);
      this.db = this.client.db(this.dbName);
      this.collection = this.db.collection(this.collectionName);
      await this.db.command({ ping: 1 });
      console.log('MongoDB connected and pinged');
    } catch (error) {
      console.error('MongoDB connection error:', error);
      process.exit(1);
    }
  };

  get = async (by: string): Promise<Game[]> => {
    const query: { [key: string]: any } = {
      // _id: {$in: [],},
      if: { $exists: false },
      us: by,
      s: { $gte: 30 },
      ua: { $gte: getDateNDaysAgo(365) },
    };

    const cursor = this.collection.aggregate<GameDocument>(
      [
        {
          $match: query,
        },
        {
          $lookup: {
            from: this.analysisCollectionName,
            localField: '_id',
            foreignField: '_id',
            as: 'analysisData',
          },
        },
        {
          $project: {
            analysisData: { $arrayElemAt: ['$analysisData.data', 0] },
            us: 1,
            p0: 1,
            p1: 1,
            s: 1,
            um: 1,
            c: 1,
            cw: 1,
            cb: 1,
            pw: 1,
            pb: 1,
            wid: 1,
            v: 1,
            ua: 1,
          },
        },
        {
          $sort: {
            ua: -1,
          },
        },
        {
          $limit: 10000,
        },
      ],
      {
        allowDiskUse: true,
      },
    );

    const ts: Game[] = [];
    for await (const doc of cursor) {
      ts.push(processGameDocument(doc, by));
    }

    cursor.close();

    return ts;
  };

  latest = async (): Promise<Latest | undefined> => {
    return this.collection
      .findOne<GameDocument>(
        {},
        {
          sort: { ua: -1 },
          projection: { _id: 0, ua: 1 },
        },
      )
      .then(doc => {
        const l = doc?.ua?.toString();
        return l ? { latest: l } : undefined;
      });
  };
}

export interface GameDocument {
  _id: string;
  us: [string, string]; // usernames
  p0?: {
    ai?: number; // ai level
    e?: number; // elo
  };
  p1?: {
    ai?: number; // ai level
    e?: number; // elo
  };
  s: number; // status
  ua: Date; // last updated at - end of the game
  um: Buffer; // usi moves
  c?: Buffer; // binary clock config
  cw?: Buffer; // binary sente move times
  cb?: Buffer; // binary gote move times
  pw?: Buffer; // binary sente period entries
  pb?: Buffer; // binary gote period entries
  wid?: string; // winner username
  v?: number; // variant
  ra?: boolean; // rated
  analysisData?: string;
}
