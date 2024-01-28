import { Role, ROLES } from 'shogiops/types';
import { filter } from './util';
import { Accuracy, AnalysisResult, CounterObj, PartialRecord, Game, Outcome, Filter } from '../types';

export function analysis(games: Game[], flt: Filter): AnalysisResult {
  let nbOfAnalysedGames = 0,
    sumOfAvgAccuracies = 0;

  const winRateAccuracies: [number, number, number] = [0, 0, 0],
    winRateAccuraciesCount: [number, number, number] = [0, 0, 0];

  const sumOfAccuracyByMoveNumber: CounterObj<number> = {},
    accuracyByMoveNumberCount: CounterObj<number> = {};

  const sumOfAccuracyByMoveRole: CounterObj<Role> = {},
    accuracyByMoveRoleCount: CounterObj<Role> = {};

  const sumOfAccuracyByDropRole: CounterObj<Role> = {},
    accuracyByDropRoleCount: CounterObj<Role> = {};

  const accuracyByRoleCount: CounterObj<Role> = {};

  for (const game of games) {
    if (game.date < flt.since) break;
    if (filter(game, flt) && game.accuracies.length > 0 && game.accuracy !== undefined) {
      nbOfAnalysedGames += 1;
      sumOfAvgAccuracies += game.accuracy;
      winRateAccuracies[game.outcome] += game.accuracy;
      winRateAccuraciesCount[game.outcome] += 1;
      for (let i = 0; i < game.accuracies.length; i++) {
        const accuracy = game.accuracies[i];
        if (accuracy !== undefined) {
          sumOfAccuracyByMoveNumber[i] = (sumOfAccuracyByMoveNumber[i] || 0) + game.accuracies[i];
          accuracyByMoveNumberCount[i] = (accuracyByMoveNumberCount[i] || 0) + 1;
        }
      }
      for (const role in game.sumOfAccuracyByMoveRole) {
        sumOfAccuracyByMoveRole[ROLES[role]] =
          (sumOfAccuracyByMoveRole[ROLES[role]] || 0) + game.sumOfAccuracyByMoveRole[role]!;
        accuracyByMoveRoleCount[ROLES[role]] =
          (accuracyByMoveRoleCount[ROLES[role]] || 0) + (game.nbOfMovesByRole[role] || 0);
      }
      for (const role in game.sumOfAccuracyByDropRole) {
        sumOfAccuracyByDropRole[ROLES[role]] =
          (sumOfAccuracyByDropRole[ROLES[role]] || 0) + game.sumOfAccuracyByDropRole[role]!;
        accuracyByDropRoleCount[ROLES[role]] =
          (accuracyByDropRoleCount[ROLES[role]] || 0) + (game.nbOfDropsByRole[role] || 0);
      }
    }
  }

  const accuracyByOutcome: [Accuracy, Accuracy, Accuracy] = [
    winRateAccuraciesCount[Outcome.Win]
      ? winRateAccuracies[Outcome.Win] / winRateAccuraciesCount[Outcome.Win]
      : 0,
    winRateAccuraciesCount[Outcome.Draw]
      ? winRateAccuracies[Outcome.Draw] / winRateAccuraciesCount[Outcome.Draw]
      : 0,
    winRateAccuraciesCount[Outcome.Loss]
      ? winRateAccuracies[Outcome.Loss] / winRateAccuraciesCount[Outcome.Loss]
      : 0,
  ];

  const accuracyByMoveNumber: Record<number, Accuracy> = {};
  for (const moveNumber in sumOfAccuracyByMoveNumber) {
    const count = accuracyByMoveNumberCount[moveNumber];
    if (count) accuracyByMoveNumber[moveNumber] = sumOfAccuracyByMoveNumber[moveNumber]! / count;
  }

  const accuracyByMoveRole: PartialRecord<Role, Accuracy> = {};
  for (const role in sumOfAccuracyByMoveRole) {
    const r = role as Role,
      count = accuracyByMoveRoleCount[r];
    if (count) accuracyByMoveRole[r] = sumOfAccuracyByMoveRole[r]! / count;
  }

  const accuracyByDropRole: PartialRecord<Role, Accuracy> = {};
  for (const role in sumOfAccuracyByDropRole) {
    const r = role as Role,
      count = accuracyByDropRoleCount[r];
    if (count) accuracyByDropRole[r] = sumOfAccuracyByDropRole[r]! / count;
  }

  const weightedTotalAverageByRole: PartialRecord<Role, Accuracy> = {};
  const allRolesSet = new Set([
    ...Object.keys(accuracyByMoveRole),
    ...Object.keys(accuracyByDropRole),
  ]) as Set<Role>;
  for (const role of allRolesSet) {
    const moveRoleAccuracy = accuracyByMoveRole[role] || 0,
      dropRoleAccuracy = accuracyByDropRole[role] || 0,
      moveRoleCount = accuracyByMoveRoleCount[role] || 0,
      dropRoleCount = accuracyByDropRoleCount[role] || 0,
      totalCount = moveRoleCount + dropRoleCount;

    accuracyByRoleCount[role] = totalCount;
    weightedTotalAverageByRole[role] = totalCount
      ? (moveRoleAccuracy * moveRoleCount + dropRoleAccuracy * dropRoleCount) / totalCount
      : 0;
  }

  return {
    nbOfGames: nbOfAnalysedGames,
    accuracy: nbOfAnalysedGames ? sumOfAvgAccuracies / nbOfAnalysedGames : 0,
    accuracyByOutcome: accuracyByOutcome,
    accuracyByOutcomeCount: winRateAccuraciesCount,
    accuracyByMoveNumber: accuracyByMoveNumber,
    accuracyByMoveNumberCount: accuracyByMoveNumberCount,
    accuracyByMoveRole: accuracyByMoveRole,
    accuracyByMoveRoleCount: accuracyByMoveRoleCount,
    accuracyByDropRole: accuracyByDropRole,
    accuracyByDropRoleCount: accuracyByDropRoleCount,
    accuracyByRole: weightedTotalAverageByRole,
    accuracyByRoleCount: accuracyByRoleCount,
  };
}
