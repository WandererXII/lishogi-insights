import { filter } from './util';
import { CounterObj, OutcomeResult, Game, Outcome, Status, WinRate, Filter } from '../types';

export function outcomes(games: Game[], flt: Filter): OutcomeResult {
  const winrate: WinRate = [0, 0, 0],
    winStatuses: CounterObj<Status> = {},
    lossStatuses: CounterObj<Status> = {};

  let cnt = 0;
  for (const game of games) {
    if (game.date < flt.since) break;
    if (!filter(game, flt)) continue;
    cnt++;
    winrate[game.outcome] += 1;
    if (game.outcome === Outcome.win) winStatuses[game.status] = (winStatuses[game.status] || 0) + 1;
    else if (game.outcome === Outcome.loss) lossStatuses[game.status] = (lossStatuses[game.status] || 0) + 1;
  }
  return {
    nbOfGames: cnt,
    winrate: winrate,
    winStatuses: winStatuses,
    lossStatuses: lossStatuses,
  };
}
