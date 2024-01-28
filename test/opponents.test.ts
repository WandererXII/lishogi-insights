import { expect, test } from 'bun:test';

import { filterFromQuery } from '../src/util';
import { games } from './games';
import { opponents } from '../src/handlers/opponents';

const filter = filterFromQuery({});
const a = opponents(games, filter);

test('opponents', () => {
  expect(a).toEqual({
    nbOfGames: 2,
    avgOpponentRating: 1500,
    avgOpponentRatingDiff: 0,
    winrateByMostPlayedOpponent: {
      testnew: [1, 0, 1],
    },
  });
});
