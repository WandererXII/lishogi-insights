import { Filter, Game } from '../types';

export function filter(game: Game, filter: Filter): boolean {
  return (
    game.variant === filter.variant &&
    (filter.color === 'both' || game.color === filter.color) &&
    (filter.speeds.length === 0 || filter.speeds.includes(game.speed)) &&
    (filter.rated === 'both' || (filter.rated === 'yes') === game.rated) &&
    (filter.computer === 'both' || (filter.computer === 'yes') === game.computer)
  );
}
