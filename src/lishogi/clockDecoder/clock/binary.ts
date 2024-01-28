import { BitReader } from '../bitReader';
import { VarIntEncoder } from '../varIntEncoder';
import { LowBitTruncator } from './lowBitTruncator';
import { EndTimeEstimator } from './endTimeEstimator';
import { LinearEstimator } from './linearEstimator';
import { Centis } from '../../../types';

export function decode(bytes: Uint8Array, startTime: number): Centis[] {
  if (bytes.length === 0) return [];

  const reader: BitReader = new BitReader(bytes);
  const truncatedStart: number = LowBitTruncator.truncate(startTime);

  const numMoves: number = VarIntEncoder.readUnsigned(reader) + 1;
  let decoded: number[] = VarIntEncoder.readSigned(reader, numMoves);

  decoded = EndTimeEstimator.decode(decoded, truncatedStart);
  decoded = LinearEstimator.decode(decoded, truncatedStart);
  decoded = LowBitTruncator.decode(decoded, reader);

  return decoded;
}
