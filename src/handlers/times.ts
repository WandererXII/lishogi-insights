import { Role, ROLES } from 'shogiops/types';
import { filter } from './util';
import { Centis, CounterObj, PartialRecord, Game, TimesResult, Filter } from '../types';

export function times(games: Game[], flt: Filter): TimesResult {
  let totalTime = 0,
    nbOfGames = 0;

  let sumOfTimesPerMove = 0,
    sumOfTimesPerDrop = 0,
    sumOfMoves = 0,
    sumOfDrops = 0;

  const sumOfTimesByMoveRole: PartialRecord<Role, Centis> = {},
    nbOfMovesByRole: CounterObj<Role> = {};

  const sumOfTimesByDropRole: PartialRecord<Role, Centis> = {},
    nbOfDropsByRole: CounterObj<Role> = {};

  for (const game of games) {
    if (game.date < flt.since) break;
    const timeOfMD = (game.totalTimeOfMoves + game.totalTimeOfDrops) / 100;
    if (timeOfMD && filter(game, flt)) {
      nbOfGames += 1;
      totalTime += timeOfMD;
      sumOfTimesPerMove += game.totalTimeOfMoves / 100;
      sumOfTimesPerDrop += game.totalTimeOfDrops / 100;
      sumOfMoves += game.nbOfMoves;
      sumOfDrops += game.nbOfDrops;
      for (const role in game.sumOfTimesByMoveRole) {
        sumOfTimesByMoveRole[ROLES[role]] =
          (sumOfTimesByMoveRole[ROLES[role]] || 0) + game.sumOfTimesByMoveRole[role]! / 100;
        nbOfMovesByRole[ROLES[role]] =
          (nbOfMovesByRole[ROLES[role]] || 0) + (game.nbOfMovesByRole[role] || 0);
      }
      for (const role in game.sumOfTimesByDropRole) {
        sumOfTimesByDropRole[ROLES[role]] =
          (sumOfTimesByDropRole[ROLES[role]] || 0) + game.sumOfTimesByDropRole[role]! / 100;
        nbOfDropsByRole[ROLES[role]] =
          (nbOfDropsByRole[ROLES[role]] || 0) + (game.nbOfDropsByRole[role] || 0);
      }
    }
  }

  const sumOfMovesAndDrops = sumOfMoves + sumOfDrops;

  return {
    nbOfGames: nbOfGames,
    totalTime: totalTime,
    avgTimePerMoveAndDrop: sumOfMovesAndDrops ? totalTime / sumOfMovesAndDrops : 0,
    avgTimePerMove: sumOfMoves ? sumOfTimesPerMove / sumOfMoves : 0,
    avgTimePerDrop: sumOfDrops ? sumOfTimesPerDrop / sumOfDrops : 0,
    avgTimePerGame: nbOfGames ? totalTime / nbOfGames : 0,
    sumOfTimesByMoveRole: sumOfTimesByMoveRole,
    sumOfTimesByDropRole: sumOfTimesByDropRole,
    nbOfMovesByRole: nbOfMovesByRole,
    nbOfDropsByRole: nbOfDropsByRole,
  };
}
