import { Eval } from '../../types';

export function decode(data: string, invert: boolean): Eval[] {
  const spl = data.split(';');
  const res: Eval[] = [];
  for (const n of spl) {
    const [cpStr, mateStr] = n.split(',');
    const cp = (invert ? -1 : 1) * parseInt(cpStr);
    const mate = (invert ? -1 : 1) * parseInt(mateStr);
    if (!isNaN(cp) || !isNaN(mate))
      res.push([!isNaN(cp) ? cp : undefined, !isNaN(mate) ? mate : undefined] as Eval);
    else res.push(undefined);
  }
  return res;
}
