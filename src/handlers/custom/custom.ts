import { CustomResult, Filter, Game } from '../../types';
import { group as groupByGame } from './game';
import { group as groupByMoves } from './moves';

export function custom(games: Game[], flt: Filter): CustomResult {
  const custom = flt.custom;
  if (!custom.x || !custom.y)
    return {
      nbOfGames: 0,
      error: 'Missing x or y key',
    };

  if (custom.type === 'game') return groupByGame(games, flt);
  else return groupByMoves(games, flt);
}
