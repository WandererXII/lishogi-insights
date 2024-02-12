import express, { Request, Response } from 'express';
import { Md5 } from 'ts-md5';
import cors from 'cors';
import conf from '../config.json';
import { Proxy } from './proxy/proxy';
import { Type } from './types';
import { filterFromQuery } from './util';

const PORT = conf.port;
const app = express();
app.use(express.json());
app.use(cors());
app.set('query parser', 'simple');

const proxy = new Proxy();
await proxy.initialize();

app.get('/', (_req: Request, res: Response) => {
  res.status(403).end();
});

app.get('/:type(analysis|moves|opponents|outcomes|times|custom)', async (req: Request, res: Response) => {
  try {
    const type: Type = req.params.type as Type;

    const query = req.query,
      username = query.u,
      key = req.headers.authorization,
      filter = filterFromQuery(query);

    if (!username || typeof username !== 'string') {
      res.status(400).send('Missing username');
    } else if (!key || Md5.hashAsciiStr(conf.secret + username) !== key) {
      res.status(403).send('Invalid or no key');
    } else {
      const cached = await proxy.getResult(type, username, filter);
      res.json(cached);
    }
  } catch (err) {
    console.error('error', err);
    res.status(500).end();
  }
});

app.use(function (_req, res) {
  res.status(404).send('404: Nothing here...');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
