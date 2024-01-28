export class LinearEstimator {
  static dest: number[];

  public static decode(dest: number[], startTime: number): number[] {
    const maxIdx: number = dest.length - 1;
    this.dest = dest;
    LinearEstimator.decodeRecursive(-1, startTime, maxIdx, this.dest[maxIdx]);
    return dest;
  }

  private static decodeRecursive(startIdx: number, start: number, endIdx: number, end: number): void {
    const midIdx: number = (startIdx + endIdx) >> 1;
    if (startIdx === midIdx) return;

    this.dest[midIdx] += (start + end) >> 1;

    const mid: number = this.dest[midIdx];

    LinearEstimator.decodeRecursive(startIdx, start, midIdx, mid);
    LinearEstimator.decodeRecursive(midIdx, mid, endIdx, end);
  }
}
