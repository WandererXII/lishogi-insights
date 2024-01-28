import { Board } from 'shogiops/board';
import { Color, Rules, isDrop, isNormal } from 'shogiops/types';
import { opposite, parseUsi } from 'shogiops/util';
import { allRoles } from 'shogiops/variant/util';
import { defaultPosition } from 'shogiops/variant/variant';
import { CustomResult, Filter, Game } from '../../types';
import { filter } from '../util';
import { variant } from '../../util';

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

  const fx = domainFromKey(custom.x);
  const fy = mappingFromKey(custom.y);

  for (const game of games) {
    if (game.date < flt.since) break;
    if (!filter(game, flt)) continue;

    nbOfGames++;

    const board = defaultPosition(variant(game.variant)).board;
    let turn: Color = 'gote';
    for (let index = 0; index < game.usis.length; index++) {
      turn = opposite(turn);
      if (turn === game.color) {
        const x = fx({ game, index, board });
        if (x) {
          fy({ game, index, board }, res, x);
        }
      }
      const usiStr = game.usis[index],
        usi = usiStr ? parseUsi(usiStr) : undefined;
      if (usi === undefined) continue;
      else if (isNormal(usi)) {
        const old = board.take(usi.from);
        if (old) board.set(usi.to, old);
      } else {
        board.set(usi.to, {
          role: usi.role,
          color: turn,
        });
      }
    }
  }

  const rules = variant(flt.variant);
  const ls = labels(custom.x, rules || 'standard');

  if (['accuracy'].includes(custom.y)) {
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

// game.usis -> grouped value, so we can just get all the labels
// properties obtainable from individual game.usis
const domains = ['roles', 'times', 'accuracy', 'capture', 'promotion', 'movesAndDrops'] as const;

type Domain = (typeof domains)[number];

function isDomain(key: string): key is Domain {
  return domains.includes(key as any);
}

function labels(domain: Domain, rules: Rules): string[] {
  switch (domain) {
    case 'roles':
      return allRoles(rules);
    case 'times':
      return ['< 1s', '< 3s', '< 5s', '< 10s', '< 20s', '< 30s', '< 60s', '> 60s'];
    case 'accuracy':
      return ['0-10', '10-20', '20-30', '30-40', '40-50', '50-60', '60-70', '70-80', '80-90', '90-100'];
    case 'capture':
    case 'promotion':
      return ['yes', 'no'];
    case 'movesAndDrops':
      return ['move', 'drop'];
  }
}

interface UsiWrap {
  game: Game;
  index: number;
  board?: Board;
}

function domainFromKey(key: Domain): (uw: UsiWrap) => string | undefined {
  switch (key) {
    case 'roles':
      return uw => {
        const usi = uw.game.usis[uw.index];
        const move = parseUsi(usi);
        if (move === undefined) return undefined;
        else if (isDrop(move)) return move.role;
        else return uw.board?.get(move.from)?.role;
      };
    case 'times':
      return uw => {
        const time = uw.game.movetimes ? uw.game.movetimes[Math.floor(uw.index / 2)] : undefined;
        if (!time) return undefined;
        else if (time < 100) return '< 1s';
        else if (time < 300) return '< 3s';
        else if (time < 500) return '< 5s';
        else if (time < 1000) return '< 10s';
        else if (time < 2000) return '< 20s';
        else if (time < 3000) return '< 30s';
        else if (time < 6000) return '< 60s';
        else return '> 60s';
      };
    case 'accuracy':
      return uw => {
        const accuracy = uw.game.accuracies ? uw.game.accuracies[uw.index] : undefined;
        if (accuracy === undefined) return undefined;
        const top = Math.ceil(accuracy / 10) * 10;
        return `${top - 10}-${top}`;
      };
    case 'capture':
      return uw => {
        const usi = uw.game.usis[uw.index];
        const move = parseUsi(usi);
        if (move === undefined || isDrop(move)) return 'no';
        else return uw.board?.has(move.to) ? 'yes' : 'no';
      };
    case 'promotion':
      return uw => {
        const usi = uw.game.usis[uw.index];
        return usi.endsWith('+') ? 'yes' : 'no';
      };
    case 'movesAndDrops':
      return uw => {
        const usi = uw.game.usis[uw.index];
        return usi.includes('*') ? 'drop' : 'move';
      };
    default:
      return () => undefined;
  }
}

// grouped value obtainable from game.usis
const mappings = [
  'totalTimeOfMovesAndDrops',
  'accuracy',
  'nbOfCaptures',
  'nbOfPromotions',
  'nbOfMovesAndDrops',
] as const;

type Mapping = (typeof mappings)[number];

function isMapping(key: string): key is Mapping {
  return mappings.includes(key as any);
}

function mappingFromKey(
  key: Mapping,
): (uw: UsiWrap, res: Record<string, Record<string, number>>, x: string) => void {
  switch (key) {
    case 'totalTimeOfMovesAndDrops':
      return (uw, res, x) => {
        const usi = uw.game.usis[uw.index];
        const time = (uw.game.movetimes && uw.game.movetimes[Math.floor(uw.index / 2)]) || 0;
        res['moves'] = res['moves'] || {};
        res['moves-count'] = res['moves-count'] || {};
        res['drops'] = res['drops'] || {};
        res['drops-count'] = res['drops-count'] || {};
        res['total'] = res['total'] || {};
        res['count'] = res['count'] || {};

        if (usi.includes('*')) {
          res['drops'][x] = (res['drops'][x] || 0) + time / 100;
          res['drops-count'][x] = (res['drops-count'][x] || 0) + 1;
        } else {
          res['moves'][x] = (res['moves'][x] || 0) + time / 100;
          res['moves-count'][x] = (res['moves-count'][x] || 0) + 1;
        }
        res['total'][x] = (res['total'][x] || 0) + time / 100;
        res['count'][x] = (res['count'][x] || 0) + 1;
      };
    case 'accuracy':
      return (uw, res, x) => {
        const accuracy = uw.game.accuracies ? uw.game.accuracies[uw.index] : undefined;
        if (accuracy === undefined) return;
        res.total = res.total || {};
        res.count = res.count || {};
        res.total[x] = (res.total[x] || 0) + accuracy;
        res.count[x] = (res.count[x] || 0) + 1;
      };
    case 'nbOfCaptures':
      return (uw, res, x) => {
        const usi = uw.game.usis[uw.index];
        const move = parseUsi(usi);
        if (move === undefined || isDrop(move)) return;

        if (uw.board?.has(move.to)) {
          res.total = res.total || {};
          res.total[x] = (res.total[x] || 0) + 1;
        }
      };
    case 'nbOfPromotions':
      return (uw, res, x) => {
        const usi = uw.game.usis[uw.index];
        if (usi.endsWith('+')) {
          res.total = res.total || {};
          res.total[x] = (res.total[x] || 0) + 1;
        }
      };
    case 'nbOfMovesAndDrops':
      return (uw, res, x) => {
        const usi = uw.game.usis[uw.index];
        res.moves = res.moves || {};
        res.drops = res.drops || {};

        if (usi.includes('*')) res.drops[x] = (res.drops[x] || 0) + 1;
        else res.moves[x] = (res.moves[x] || 0) + 1;
      };
  }
}
