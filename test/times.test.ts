import { expect, test } from 'bun:test';

import { filterFromQuery } from '../src/util';
import { games } from './games';
import { times } from '../src/handlers/times';

const filter = filterFromQuery({});
const a = times(games, filter);

test('times', () => {
  expect(a).toEqual({
    nbOfGames: 3,
    totalTime: 14.99,
    avgTimePerMoveAndDrop: 1.3627272727272728,
    avgTimePerMove: 1.3627272727272728,
    avgTimePerDrop: 0,
    avgTimePerGame: 4.996666666666667,
    avgTimeByMoveRole: {
      gold: 0.56,
      pawn: 3.716666666666667,
      rook: 1.2,
      bishop: 1.52,
    },
    avgTimeByDropRole: {},
  });
});
