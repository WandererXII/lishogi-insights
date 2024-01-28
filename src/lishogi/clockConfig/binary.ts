import { ClockConfig } from '../../types';

export function decode(bytes: Uint8Array): ClockConfig {
  const limitByte = bytes[0] || 0;
  const limit = limitByte < 181 ? limitByte * 60 : (limitByte - 180) * 15;

  const inc = bytes[1];

  const byo = bytes.length == 14 ? bytes[12] : bytes.length == 10 ? bytes[8] : 0;

  const per = bytes.length == 14 ? bytes[13] : bytes.length == 10 ? bytes[9] : 1;

  return {
    limit: limit * 100,
    byo: byo * 100,
    inc: inc * 100,
    per: per,
  };
}
