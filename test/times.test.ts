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
    nbOfDropsByRole: {},
    nbOfMovesByRole: {
      bishop: 1,
      gold: 3,
      pawn: 5,
      rook: 2,
    },
    sumOfTimesByDropRole: {},
    sumOfTimesByMoveRole: {
      bishop: 1.52,
      gold: 1.12,
      pawn: 11.15,
      rook: 1.2,
    },
  });
});
