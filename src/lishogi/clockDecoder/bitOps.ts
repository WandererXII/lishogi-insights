export function getBitMasks(): number[] {
  const mask: number[] = new Array(32).fill(0);
  for (let i = 0; i < 32; i++) {
    mask[i] = (1 << i) - 1;
  }
  return mask;
}
