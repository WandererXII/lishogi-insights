import { filter } from './util';
import { CounterObj, OpponentResult, Game, WinRate, Filter } from '../types';
import { getKeysWithLargestValues } from '../util';

export function opponents(games: Game[], flt: Filter): OpponentResult {
  const opponents: Record<string, WinRate> = {},
    opponentCounter: CounterObj<string> = {};
  let nbOfGames = 0,
    totalRating = 0,
    totalRatingDiff = 0,
    nbOfGamesWithRating = 0,
    nbOfGamesWithRatingDiff = 0;
  for (const game of games) {
    if (game.date < flt.since) break;
    if (filter(game, flt) && game.opponent) {
      nbOfGames++;
      totalRating += game.opponentRating || 0;
      nbOfGamesWithRating += game.opponentRating ? 1 : 0;
      totalRatingDiff += game.opponentRatingDiff || 0;
      nbOfGamesWithRatingDiff += game.opponentRatingDiff !== undefined ? 1 : 0;

      const opponentWinrate = opponents[game.opponent] || [0, 0, 0];
      opponentWinrate[game.outcome] += 1;
      opponents[game.opponent] = opponentWinrate;
      opponentCounter[game.opponent] = (opponentCounter[game.opponent] || 0) + 1;
    }
  }
  const keysWithHighestValue = getKeysWithLargestValues(opponentCounter, 10);
  const filteredOpponents = Object.fromEntries(
    Object.entries(opponents).filter(([key]) => keysWithHighestValue.includes(key)),
  );

  return {
    nbOfGames: nbOfGames,
    avgOpponentRating: nbOfGamesWithRating ? totalRating / nbOfGamesWithRating : 0,
    avgOpponentRatingDiff: nbOfGamesWithRatingDiff ? totalRatingDiff / nbOfGamesWithRatingDiff : 0,
    winrateByMostPlayedOpponent: filteredOpponents,
  };
}
