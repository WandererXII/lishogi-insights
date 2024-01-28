import { filter } from '../util';
import { CustomResult, Filter, Game, Outcome, Speed, Status } from '../../types';

export function group(games: Game[], flt: Filter): CustomResult {
  const res: Record<string, Record<string, number>> = {},
    custom = flt.custom;

  let nbOfGames = 0;

  if (!isDomain(custom.x))
    return {
      nbOfGames: nbOfGames,
      error: `Invalid x key: ${custom.x}`,
    };
  else if (!isMapping(custom.y))
    return {
      nbOfGames: nbOfGames,
      error: `Invalid y key: ${custom.y}`,
    };

  const fx = domainFromKey(custom.x, custom.tmz);
  const fy = mappingFromKey(custom.y);

  for (const game of games) {
    if (game.date < flt.since) break;
    if (!filter(game, flt)) continue;
    const x = fx(game);
    if (x) {
      nbOfGames++;
      fy(game, res, x);
    }
  }
  const ls = labels(custom.x);

  if (['accuracy', 'opponentRating', 'opponentRatingDiff'].includes(custom.y)) {
    for (const key in res) {
      for (const l of ls) {
        if (res[key][l] !== undefined) {
          res.average = {};
          for (const x in res.total) {
            res.average[x] = res.total[x] / res.count[x];
          }
        }
      }
    }
    delete res.total;
  }

  return {
    nbOfGames: nbOfGames,
    data: {
      labels: ls,
      dataset: res,
    },
  };
}

// game -> single value
// properties obtainable from game directly
const domains = [
  'color',
  'outcomes',
  'status',
  'speed',
  'rated',
  'weekday',
  'timeOfDay', // morning, afternoon, evening, night
  'accuracy',
  'earlyBishopExchange',
] as const;

type Domain = (typeof domains)[number];

function isDomain(key: string): key is Domain {
  return domains.includes(key as any);
}

function labels(domain: Domain): string[] {
  switch (domain) {
    case 'color':
      return ['sente', 'gote'];
    case 'outcomes':
      return Object.keys(Outcome)
        .filter(key => isNaN(parseInt(key)))
        .map(key => key.toLowerCase());
    case 'status':
      return Object.keys(Status)
        .filter(key => isNaN(parseInt(key)))
        .map(key => key.toLowerCase());
    case 'speed':
      return Object.keys(Speed)
        .filter(key => isNaN(parseInt(key)))
        .map(key => key.toLowerCase());
    case 'weekday':
      return ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    case 'timeOfDay':
      return ['morning', 'afternoon', 'evening', 'night'];
    case 'accuracy':
      return ['0-10', '10-20', '20-30', '30-40', '40-50', '50-60', '60-70', '70-80', '80-90', '90-100'];
    case 'rated':
    case 'earlyBishopExchange':
      return ['yes', 'no'];
  }
}

function domainFromKey(key: Domain, tmz: string = 'UTC'): (game: Game) => string | undefined {
  switch (key) {
    case 'color':
      return game => game[key];
    case 'outcomes':
      return game => {
        const value = game['outcome'];
        if (value !== undefined) return Outcome[value].toLowerCase();
      };
    case 'status':
      return game => {
        const value = game[key];
        if (value !== undefined) return Status[value].toLowerCase();
      };
    case 'speed':
      return game => {
        const value = game[key];
        if (value !== undefined) return Speed[value].toLowerCase();
      };
    case 'rated':
    case 'earlyBishopExchange':
      return game => (game[key] ? 'yes' : 'no');
    case 'weekday':
      return game => game.date.toLocaleDateString('en-US', { weekday: 'long', timeZone: tmz }).toLowerCase();
    case 'timeOfDay':
      return game => {
        const tmzDate = new Date(game.date.toLocaleString('en-US', { timeZone: tmz }));
        const hour = tmzDate.getHours();
        if (hour < 6) return 'night';
        else if (hour < 12) return 'morning';
        else if (hour < 18) return 'afternoon';
        else return 'evening';
      };
    case 'accuracy':
      return game => {
        const accuracy = game.accuracy;
        if (accuracy === undefined) return undefined;
        const top = Math.ceil(accuracy / 10) * 10;
        return `${top - 10}-${top}`;
      };
    default:
      return () => undefined;
  }
}

// single value obtainable from game
const mappings = [
  'accuracy',
  'nbOfMovesAndDrops',
  'nbOfCaptures',
  'nbOfPromotions',
  'opponentRating',
  'opponentRatingDiff',
  'totalTimeOfMovesAndDrops',
  'nbOfGames',
  'outcomes',
] as const;

type Mapping = (typeof mappings)[number];

function isMapping(key: string): key is Mapping {
  return mappings.includes(key as any);
}

// updates object in place
function mappingFromKey(
  key: Mapping,
): (game: Game, res: Record<string, Record<string, number>>, x: string) => void {
  switch (key) {
    case 'accuracy':
    case 'opponentRating':
    case 'opponentRatingDiff':
    case 'nbOfCaptures':
    case 'nbOfPromotions':
      return (game, res, x) => {
        const value = game[key];
        if (value === undefined) return;
        res.total = res.total || {};
        res.count = res.count || {};

        res.total[x] = (res.total[x] || 0) + value;
        res.count[x] = (res.count[x] || 0) + 1;
      };
    case 'outcomes':
      return (game, res, x) => {
        const value = game['outcome'];
        if (value === undefined) return;
        if (value === Outcome.Win) {
          res.win = res.win || {};
          res.win[x] = (res.win[x] || 0) + 1;
        } else if (value === Outcome.Draw) {
          res.draw = res.draw || {};
          res.draw[x] = (res.draw[x] || 0) + 1;
        } else if (value === Outcome.Loss) {
          res.loss = res.loss || {};
          res.loss[x] = (res.loss[x] || 0) + 1;
        }
      };
    case 'nbOfMovesAndDrops':
    case 'totalTimeOfMovesAndDrops':
      return (game, res, x) => {
        const gameKey = key === 'nbOfMovesAndDrops' ? 'nbOf' : 'totalTimeOf';
        let movesValue = game[(gameKey + 'Moves') as keyof Game] as number;
        let dropsValue = game[(gameKey + 'Drops') as keyof Game] as number;

        if (key === 'totalTimeOfMovesAndDrops') {
          movesValue /= 100;
          dropsValue /= 100;
        }
        if (key === 'totalTimeOfMovesAndDrops' && movesValue + dropsValue === 0) return;

        res['moves'] = res['moves'] || {};
        res['drops'] = res['drops'] || {};
        res['moves-count'] = res['moves-count'] || {};
        res['drops-count'] = res['drops-count'] || {};
        res['total'] = res['total'] || {};
        res['count'] = res['count'] || {};

        res['moves'][x] = (res['moves'][x] || 0) + movesValue;
        res['drops'][x] = (res['drops'][x] || 0) + dropsValue;
        res['moves-count'][x] = (res['moves-count'][x] || 0) + game.nbOfMoves;
        res['drops-count'][x] = (res['drops-count'][x] || 0) + game.nbOfDrops;
        res['total'][x] = (res['total'][x] || 0) + movesValue + dropsValue;
        res['count'][x] = (res['count'][x] || 0) + game.nbOfMoves + game.nbOfDrops;
      };
    case 'nbOfGames':
      return (_, res, x) => {
        res.total = res.total || {};
        res.total[x] = (res.total[x] || 0) + 1;
      };
  }
}
