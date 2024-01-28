import { BitReader } from './bitReader';

export class VarIntEncoder {
  public static readUnsigned(reader: BitReader): number {
    let n: number = reader.readBits(6);
    if (n > 0x1f) {
      n &= 0x1f;
      let curShift: number = 5;
      let curVal: number;
      while ((curVal = reader.readBits(4)) > 0x07) {
        n |= (curVal & 0x07) << curShift;
        curShift += 3;
      }
      n |= curVal << curShift;
    }
    return n;
  }

  public static readSigned(reader: BitReader, numMoves: number): number[] {
    const values: number[] = new Array(numMoves);

    for (let i = 0; i < numMoves; i++) {
      const n: number = VarIntEncoder.readUnsigned(reader);
      values[i] = (n >>> 1) ^ -(n & 1); // zigzag decode
    }

    return values;
  }
}
