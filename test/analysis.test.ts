import { expect, test } from 'bun:test';

import { filterFromQuery } from '../src/util';
import { games } from './games';
import { analysis } from '../src/handlers/analysis';

const filter = filterFromQuery({});
const a = analysis(games, filter);

test('analysis', () => {
  expect(a).toEqual({
    nbOfGames: 2,
    accuracy: 82.64422174170446,
    accuracyByOutcome: [96.29136995838144, 0, 68.99707352502747],
    accuracyByOutcomeCount: [1, 0, 1],
    accuracyByMoveNumber: {
      '0': 92.16173757716862,
      '1': 98.05756579605884,
      '2': 84.8657208311852,
      '3': 22.952174254200003,
      '4': 79.06482970414292,
      '5': 50.669498658140874,
    },
    accuracyByMoveNumberCount: {
      '0': 2,
      '1': 2,
      '2': 2,
      '3': 1,
      '4': 1,
      '5': 1,
    },
    accuracyByMoveRole: {
      gold: 64.8671641811419,
      rook: 53.99037206297392,
      pawn: 91.96411525955307,
      bishop: 97.28501749886522,
    },
    accuracyByMoveRoleCount: {
      gold: 2,
      rook: 2,
      pawn: 4,
      bishop: 1,
    },
    accuracyByDropRole: {
      pawn: 95.79454618813955,
    },
    accuracyByDropRoleCount: {
      pawn: 2,
    },
    accuracyByRole: {
      gold: 64.8671641811419,
      rook: 53.99037206297392,
      pawn: 93.24092556908188,
      bishop: 97.28501749886522,
    },
    accuracyByRoleCount: {
      gold: 2,
      rook: 2,
      pawn: 6,
      bishop: 1,
    },
  });
});
