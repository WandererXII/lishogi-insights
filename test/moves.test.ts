import { expect, test } from 'bun:test';

import { filterFromQuery } from '../src/util';
import { games } from './games';
import { moves } from '../src/handlers/moves';

const filter = filterFromQuery({});
const a = moves(games, filter);

test('moves', () => {
  expect(a).toEqual({
    nbOfGames: 3,
    nbOfMoves: 11,
    nbOfDrops: 0,
    nbOfCaptures: 2,
    nbOfPromotions: 1,
    nbOfMovesByRole: {
      gold: 3,
      pawn: 5,
      rook: 2,
      bishop: 1,
    },
    nbOfDropsByRole: {
      pawn: 2,
    },
    nbOfCapturesByRole: {
      rook: 1,
      bishop: 1,
    },
    winrateByFirstMove: {
      sente: {
        '4i5h': [1, 0, 0],
        '2h5h': [0, 0, 1],
        '7g7f': [1, 0, 0],
      },
      gote: {},
    },
  });
});
