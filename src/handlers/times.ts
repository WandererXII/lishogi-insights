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

  const sumOfTimeByMoveRole: PartialRecord<Role, Centis> = {},
    timeByMoveRoleCount: CounterObj<Role> = {};

  const sumOfTimeByDropRole: PartialRecord<Role, Centis> = {},
    timeByDropRoleCount: CounterObj<Role> = {};

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
      for (const role in game.sumOfTimeByMoveRole) {
        sumOfTimeByMoveRole[ROLES[role]] =
          (sumOfTimeByMoveRole[ROLES[role]] || 0) + game.sumOfTimeByMoveRole[role]! / 100;
        timeByMoveRoleCount[ROLES[role]] = (timeByMoveRoleCount[ROLES[role]] || 0) + 1;
      }
      for (const role in game.sumOfTimeByDropRole) {
        sumOfTimeByDropRole[ROLES[role]] =
          (sumOfTimeByDropRole[ROLES[role]] || 0) + game.sumOfTimeByDropRole[role]! / 100;
        timeByDropRoleCount[ROLES[role]] = (timeByDropRoleCount[ROLES[role]] || 0) + 1;
      }
    }
  }
  const avgTimeByMoveRole: PartialRecord<Role, Centis> = {};
  for (const role in sumOfTimeByMoveRole) {
    const r = role as Role,
      count = timeByMoveRoleCount[r];
    if (count) avgTimeByMoveRole[r] = sumOfTimeByMoveRole[r]! / count;
  }

  const avgTimeByDropRole: PartialRecord<Role, Centis> = {};
  for (const role in sumOfTimeByDropRole) {
    const r = role as Role,
      count = timeByDropRoleCount[r];
    if (count) avgTimeByDropRole[r] = sumOfTimeByDropRole[r]! / count;
  }

  const sumOfMovesAndDrops = sumOfMoves + sumOfDrops;

  return {
    nbOfGames: nbOfGames,
    totalTime: totalTime,
    avgTimePerMoveAndDrop: sumOfMovesAndDrops ? totalTime / sumOfMovesAndDrops : 0,
    avgTimePerMove: sumOfMoves ? sumOfTimesPerMove / sumOfMoves : 0,
    avgTimePerDrop: sumOfDrops ? sumOfTimesPerDrop / sumOfDrops : 0,
    avgTimePerGame: nbOfGames ? totalTime / nbOfGames : 0,
    avgTimeByMoveRole: avgTimeByMoveRole,
    avgTimeByDropRole: avgTimeByDropRole,
  };
}
