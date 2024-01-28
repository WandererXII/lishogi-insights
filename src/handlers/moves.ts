import { ROLES, Role } from 'shogiops/types';
import { filter } from './util';
import { CounterObj, MovesResult, Game, WinRate, Filter } from '../types';
import { getKeysWithLargestValues } from '../util';

export function moves(games: Game[], flt: Filter): MovesResult {
  const nbOfMovesByRole: CounterObj<Role> = {},
    nbOfDropsByRole: CounterObj<Role> = {},
    nbOfCapturesByRole: CounterObj<Role> = {},
    winrateByInitialLineSente: Record<string, WinRate> = {},
    winrateByInitialLineGote: Record<string, WinRate> = {},
    initialLineCounterSente: CounterObj<string> = {},
    initialLineCounterGote: CounterObj<string> = {};
  let nbOfMoves = 0,
    nbOfDrops = 0,
    nbOfCaptures = 0,
    nbOfPromotions = 0,
    nbOfGames = 0;

  for (const game of games) {
    if (game.date < flt.since) break;
    if (!filter(game, flt)) continue;
    nbOfGames += 1;

    nbOfMoves += game.nbOfMoves;
    nbOfDrops += game.nbOfDrops;
    nbOfCaptures += game.nbOfCaptures;
    nbOfPromotions += game.nbOfPromotions;

    for (const role in game.nbOfMovesByRole) {
      nbOfMovesByRole[ROLES[role]] = (nbOfMovesByRole[ROLES[role]] || 0) + game.nbOfMovesByRole[role]!;
    }
    for (const role in game.nbOfDropsByRole) {
      nbOfDropsByRole[ROLES[role]] = (nbOfDropsByRole[ROLES[role]] || 0) + game.nbOfDropsByRole[role]!;
    }
    for (const role in game.nbOfCapturesByRole) {
      nbOfCapturesByRole[ROLES[role]] =
        (nbOfCapturesByRole[ROLES[role]] || 0) + game.nbOfCapturesByRole[role]!;
    }
    if (game.initialLine) {
      const initialLine = game.initialLine.join(' ');
      if (game.color === 'sente') {
        initialLineCounterSente[initialLine] = (initialLineCounterSente[initialLine] || 0) + 1;
        const winrate = winrateByInitialLineSente[initialLine] || [0, 0, 0];
        winrate[game.outcome] += 1;
        winrateByInitialLineSente[initialLine] = winrate;
      } else {
        initialLineCounterGote[initialLine] = (initialLineCounterGote[initialLine] || 0) + 1;
        const winrate = winrateByInitialLineGote[initialLine] || [0, 0, 0];
        winrate[game.outcome] += 1;
        winrateByInitialLineGote[initialLine] = winrate;
      }
    }
  }
  const keysWithHighestValueSente = getKeysWithLargestValues(initialLineCounterSente, 5);
  const keysWithHighestValueGote = getKeysWithLargestValues(initialLineCounterGote, 5);

  const filteredwinrateByInitialLineSente = keysWithHighestValueSente.reduce(
    (acc: Record<string, WinRate>, cur) => {
      acc[cur] = winrateByInitialLineSente[cur];
      return acc;
    },
    {},
  );
  const filteredwinrateByInitialLineGote = keysWithHighestValueGote.reduce(
    (acc: Record<string, WinRate>, cur) => {
      acc[cur] = winrateByInitialLineGote[cur];
      return acc;
    },
    {},
  );

  return {
    nbOfGames: nbOfGames,
    nbOfMoves,
    nbOfDrops,
    nbOfCaptures,
    nbOfPromotions,
    nbOfMovesByRole: nbOfMovesByRole,
    nbOfDropsByRole: nbOfDropsByRole,
    nbOfCapturesByRole: nbOfCapturesByRole,
    winrateByFirstMove: {
      sente: filteredwinrateByInitialLineSente,
      gote: filteredwinrateByInitialLineGote,
    },
  };
}
