import { Color } from 'shogiops/types';
import { Centis, ClockConfig } from '../../types';

export function calculate(
  color: Color,
  config: ClockConfig,
  times: number[],
  periodsBytes: Uint8Array | undefined,
  playedPlies: number,
  turnColor: Color,
  outOfTime: boolean,
): Centis[] {
  const periods = periodsBytes ? readPeriods(periodsBytes) : [];
  const noLastInc = times.length <= playedPlies === (color !== turnColor);
  const byoyomiStart = periods[0];
  const byoyomiTimeout = byoyomiStart !== undefined && outOfTime && color === turnColor;

  const res: Centis[] = [];
  if (times.length > 0) res.push(0); // first move is always 0
  for (let i = 0; i < times.length - 1; i++) {
    const turn = i + 2;
    const afterByoyomi = byoyomiStart !== undefined && byoyomiStart <= turn;
    const first = times[i];
    const second = times[i + 1];
    const mt = afterByoyomi ? second : first - second;
    const cInc = !afterByoyomi && (i !== times.length - 1 || !noLastInc) ? config.inc : 0;
    if (i === times.length - 1 && byoyomiTimeout) {
      const prevTurnByoyomi = byoyomiStart !== undefined && byoyomiStart < turn;
      res.push(prevTurnByoyomi ? config.byo : first + config.byo * periods.filter(p => p === turn).length);
    } else {
      res.push(Math.max(mt + cInc, 0));
    }
  }
  return res;
}

function readPeriods(ba: Uint8Array): number[] {
  function backToInt(b: Uint8Array): number {
    const [b1, b2] = b;
    return (b1 << 8) + b2;
  }

  const pairs: Uint8Array[] = [];
  for (let i = 0; i < ba.length; i += 2) {
    pairs.push(ba.slice(i, i + 2));
  }

  return pairs.map(backToInt);
}
