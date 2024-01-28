import { expect, test } from 'bun:test';

import { filterFromQuery } from '../src/util';
import { games } from './games';
import { outcomes } from '../src/handlers/outcomes';

const filter = filterFromQuery({});
const a = outcomes(games, filter);

test('outcomes', () => {
  expect(a).toEqual({
    nbOfGames: 3,
    winrate: [2, 0, 1],
    winStatuses: {
      '31': 2,
    },
    lossStatuses: {
      '30': 1,
    },
  });
});
