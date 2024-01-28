export class EndTimeEstimator {
  public static decode(vals: number[], startTime: number): number[] {
    const maxIdx: number = vals.length - 1;
    if (maxIdx < 32) {
      vals[maxIdx] += startTime - ((startTime * maxIdx) >>> 5);
    }
    return vals;
  }
}
