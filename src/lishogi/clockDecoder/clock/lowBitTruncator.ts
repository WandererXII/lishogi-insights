import { BitReader } from '../bitReader';

export class LowBitTruncator {
  // Truncate 3 bits from centisecs, but preserve precision for low values.
  // CENTI_CUTOFF must be a multiple of 8 (the truncation divisor)
  private static readonly CENTI_CUTOFF: number = 1000;

  public static truncate(centi: number): number {
    return centi >> 3;
  }

  public static decode(trunced: number[], reader: BitReader): number[] {
    const maxIdx: number = trunced.length - 1;

    for (let i = 0; i <= maxIdx; i++) {
      const rounded: number = trunced[i] << 3;
      if (rounded < LowBitTruncator.CENTI_CUTOFF || i === maxIdx) {
        trunced[i] = rounded | reader.readBits(3);
      } else {
        // Truncation cuts off 3.5 on average.
        trunced[i] = rounded | 3;
      }
    }
    return trunced;
  }
}
