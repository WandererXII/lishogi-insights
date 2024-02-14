import { COLORS, ROLES, Role, Rules } from 'shogiops/types';
import { Centis, CounterObj, Eval, Filter, RoleIndex, Speed, Variant } from './types';

export function getDateNDaysAgo(n: number): Date {
  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() - n);
  return currentDate;
}

export function roleToIndex(role: Role): RoleIndex {
  return ROLES.indexOf(role);
}

export function variant(id: number | undefined): Rules {
  switch (id) {
    case 6:
      return 'checkshogi';
    case 5:
      return 'kyotoshogi';
    case 4:
      return 'annanshogi';
    case 3:
      return 'chushogi';
    case 2:
      return 'minishogi';
    default:
      return 'standard';
  }
}

export function speedByTotalTime(
  limit: Centis,
  increment: Centis,
  periodsTotal: number,
  byoyomi: Centis,
): Speed {
  const totalTime = limit / 100 + 60 * (increment / 100) + 25 * periodsTotal * (byoyomi / 100);
  if (totalTime < 59) return Speed.UltraBullet;
  else if (totalTime < 299) return Speed.Bullet;
  else if (totalTime < 599) return Speed.Blitz;
  else if (totalTime < 1499) return Speed.Rapid;
  else if (totalTime < 21599) return Speed.Classical;
  else return Speed.Correspondence;
}

export function numberOfFiles(v: number | undefined): number {
  if (v === 3) return 12;
  else if (v === 5 || v === 2) return 5;
  else return 9;
}

export function evalToWin(evaluation: Eval): number | undefined {
  if (!evaluation) return undefined;
  else if (evaluation[0] !== undefined) return cpToWin(evaluation[0]);
  else return mateToWin(evaluation[1]);
}

function cpToWin(cp: number): number {
  return 50 + 50 * (2 / (1 + Math.exp(-0.0007 * cp)) - 1);
}
function mateToWin(mate: number): number {
  return cpToWin(Math.sign(mate) * 5500);
}

export function winsToAccuracy(beforeCp: number, afterCp: number): number | undefined {
  const offset = 0.1, // larger tilts curve down
    coefficient = 0.075; // larger means steeper curve
  if (afterCp === 31111) return undefined; // 31111 was used by yane for repeating positions
  return (100 + offset) * Math.exp(-coefficient * (beforeCp - afterCp)) - (offset + 0.0001);
}

export function getKeysWithLargestValues(obj: CounterObj<string>, n: number): string[] {
  const sortedKeys = Object.keys(obj).sort((a, b) => obj[b]! - obj[a]!);
  return sortedKeys.slice(0, n);
}

/* eslint-disable  @typescript-eslint/no-explicit-any */
export function filterFromQuery(query: Record<string, any>): Filter {
  const since = parseInt(query.since) || 365,
    variant = parseInt(query.variant) || Variant.Standard,
    color = COLORS.includes(query.color) ? query.color : 'both',
    speeds: Speed[] =
      typeof query.speeds === 'string'
        ? query.speeds
            .split('')
            .map((n: string) => parseInt(n))
            .filter((n: number) => !isNaN(n))
        : [],
    rated = ['yes', 'no', 'both'].includes(query.rated) ? query.rated : 'both',
    computer = ['yes', 'no', 'both'].includes(query.computer) ? query.computer : 'no',
    custom = {
      type: query.customType || 'game',
      x: query.xKey,
      y: query.yKey,
      tmz: query.tmz,
    };

  return {
    since: getDateNDaysAgo(since).getTime(),
    variant: variant,
    color: color,
    speeds: speeds,
    rated: rated,
    computer: computer,
    custom: custom,
  };
}

export function filterToKey(flt: Filter): string {
  const xy = flt.custom ? `${flt.custom.x}-${flt.custom.y}` : '';
  return `${flt.variant}-${flt.color[0]}-${flt.speeds.join(',')}-${flt.rated[0]}-${flt.computer[0]};${xy}`;
}
