import { Game } from '../src/types';

export const game1: Game = {
  id: 'qZCIe1ON',
  color: 'sente',
  variant: 1,
  outcome: 0,
  status: 31,
  speed: 5,
  rated: false,
  date: new Date('2023-06-21T17:40:46.566Z'),
  computer: false,
  usis: ['4i5h', '8c8d', '7g7f'],
  clockConfig: {
    limit: 60000,
    byo: 1000,
    inc: 0,
    per: 1,
  },
  movetimes: [0, 668],
  nbOfMoves: 2,
  nbOfDrops: 0,
  nbOfCaptures: 0,
  nbOfPromotions: 0,
  nbOfMovesByRole: {
    '3': 1,
    '7': 1,
  },
  nbOfDropsByRole: {},
  nbOfCapturesByRole: {},
  initialLine: ['4i5h'],
  earlyBishopExchange: false,
  opponent: undefined,
  opponentRating: undefined,
  opponentRatingDiff: undefined,
  totalTimeOfMoves: 668,
  totalTimeOfDrops: 0,
  sumOfTimeByMoveRole: {
    '3': 0,
    '7': 668,
  },
  sumOfTimeByDropRole: {},
  accuracy: undefined,
  accuracies: [],
  sumOfAccuracyByMoveRole: {},
  sumOfAccuracyByDropRole: {},
};
export const game2: Game = {
  id: 'MOZ7ztWm',
  color: 'sente',
  variant: 1,
  outcome: 2,
  status: 30,
  speed: 1,
  rated: false,
  date: new Date('2023-03-21T18:54:04.043Z'),
  computer: false,
  usis: ['2h5h', '5c5d', '5g5f', '8b5b', '5f5e', '5d5e', '5h5e', '5b5e', '4i5h', 'R*5b', '6i7h', '5e5h+'],
  clockConfig: {
    limit: 3000,
    byo: 1000,
    inc: 0,
    per: 1,
  },
  movetimes: [0, 0, 264, 120, 112, 0],
  nbOfMoves: 6,
  nbOfDrops: 0,
  nbOfCaptures: 1,
  nbOfPromotions: 0,
  nbOfMovesByRole: {
    '3': 2,
    '6': 2,
    '7': 2,
  },
  nbOfDropsByRole: {},
  nbOfCapturesByRole: {
    '6': 1,
  },
  initialLine: ['2h5h'],
  earlyBishopExchange: false,
  opponent: 'testnew', // added
  opponentRating: 2000,
  opponentRatingDiff: -100,
  totalTimeOfMoves: 496,
  totalTimeOfDrops: 0,
  sumOfTimeByMoveRole: {
    '3': 112,
    '6': 120,
    '7': 264,
  },
  sumOfTimeByDropRole: {},
  accuracy: 68.99707352502747,
  accuracies: [
    85.02856987174783, 98.83011409325246, 77.43725456868071, 22.952174254200003, 79.06482970414292,
    50.669498658140874,
  ],
  sumOfAccuracyByMoveRole: {
    '3': 129.7343283622838,
    '6': 107.98074412594784,
    '7': 176.26736866193318,
  },
  sumOfAccuracyByDropRole: {},
};
export const game3: Game = {
  id: 'Q8fIdA0E',
  color: 'sente',
  variant: 1,
  outcome: 0,
  status: 31,
  speed: 1,
  rated: false,
  date: new Date('2023-03-22T02:03:24.801Z'),
  computer: false,
  usis: ['7g7f', '3c3d', '8h2b+', '3a2b', '5g5f'],
  clockConfig: {
    limit: 3000,
    byo: 1000,
    inc: 0,
    per: 1,
  },
  movetimes: [0, 152, 183],
  nbOfMoves: 3,
  nbOfDrops: 0,
  nbOfCaptures: 1,
  nbOfPromotions: 1,
  nbOfMovesByRole: {
    '5': 1,
    '7': 2,
  },
  nbOfDropsByRole: {
    '7': 2, // added
  },
  nbOfCapturesByRole: {
    '5': 1,
  },
  initialLine: ['7g7f'],
  earlyBishopExchange: true,
  opponent: 'testnew', // changed
  opponentRating: 1000,
  opponentRatingDiff: 100,
  totalTimeOfMoves: 335,
  totalTimeOfDrops: 0,
  sumOfTimeByMoveRole: {
    '5': 152,
    '7': 183,
  },
  sumOfTimeByDropRole: {},
  accuracy: 96.29136995838144,
  accuracies: [99.29490528258943, 97.28501749886522, 92.29418709368967],
  sumOfAccuracyByMoveRole: {
    '5': 97.28501749886522,
    '7': 191.5890923762791,
  },
  sumOfAccuracyByDropRole: {
    '7': 191.5890923762791, // added
  },
};

export const games = [game1, game2, game3];