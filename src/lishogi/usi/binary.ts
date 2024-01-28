export function decode(binary: Uint8Array, numberOfFiles: number): string[] {
  if (numberOfFiles === 12) return chushogiDecode(binary);
  const res = [];
  for (let i = 0; i < binary.length; i += 2) {
    const a = binary[i];
    const b = binary[i + 1];

    const usi = bitAt(a, 7) ? decodeDrop(a, b, numberOfFiles) : decodeMove(a, b, numberOfFiles);
    res.push(usi);
  }
  return res;
}

function decodeMove(i1: number, i2: number, numberOfFiles: number): string {
  return pos(right(i1, 7), numberOfFiles) + pos(right(i2, 7), numberOfFiles) + (bitAt(i2, 7) ? '+' : '');
}

function decodeDrop(i1: number, i2: number, numberOfFiles: number): string {
  return intToRole[right(i1, 7)] + '*' + pos(right(i2, 7), numberOfFiles);
}

export function chushogiDecode(binary: Uint8Array): string[] {
  const res = [];
  for (let i = 0; i < binary.length; ) {
    const a = binary[i];
    const b = binary[i + 1];
    const c = binary[i + 2];

    if (lionMoveType(a)) {
      i += 3;
      res.push(decodeLionMove(b, c));
    } else {
      i += 2;
      res.push(iguiMoveType(b) ? decodeIguiMove(a, b) : decodeChuMove(a, b));
    }
  }
  return res;
}

function decodeLionMove(i1: number, i2: number): string {
  const orig = pos(i1, 12);
  const midStep = posDirection(orig, directions[i2 >> 3]);
  return orig + midStep + posDirection(midStep, directions[right(i2, 3)]);
}

function decodeIguiMove(i1: number, i2: number): string {
  const origDest = pos(i1, 12);
  return origDest + posDirection(origDest, directions[normalizeDirection(i2)]) + origDest;
}

function decodeChuMove(i1: number, i2: number): string {
  return (
    pos(normalizePromotionPos(i1), 12) + pos(normalizePromotionPos(i2), 12) + (isPromotion(i1, i2) ? '+' : '')
  );
}

function pos(i: number, files: number): string {
  const file = i % files;
  const rank = Math.floor(i / files);

  return posToString(file + 1, rank + 1);
}
function posToString(file: number, rank: number): string {
  const ranks = 'abcdefghijkl';

  if (file < 1 || file > 12 || rank < 1 || rank > 12) {
    console.error('Invalid position:', file, rank);
    return '-';
  }

  return file + ranks[rank - 1];
}
function bitAt(i: number, p: number): boolean {
  return (i & (1 << p)) !== 0;
}
function right(i: number, x: number): number {
  return i & ((1 << x) - 1);
}
const intToRole: { [key: number]: string } = {
  0: 'T',
  1: 'P',
  2: 'L',
  3: 'N',
  4: 'S',
  5: 'G',
  6: 'B',
  7: 'R',
};

function lionMoveType(i: number): boolean {
  return i === 255;
}

function iguiMoveType(i: number): boolean {
  return i >= 240 && i <= 247;
}

function normalizePromotionPos(i: number): number {
  return (i % 144) + Math.floor(i / 192) * 48;
}

function normalizeDirection(i: number): number {
  return i - 240;
}

function isPromotion(i1: number, i2: number): boolean {
  return i1 > 143 || i2 > 143;
}

const directions: ['right', 'upLeft', 'up', 'upRight', 'downLeft', 'down', 'downRight', 'left'] = [
  'right',
  'upLeft',
  'up',
  'upRight',
  'downLeft',
  'down',
  'downRight',
  'left',
];

function posDirection(
  squareName: string,
  direction: 'up' | 'upRight' | 'right' | 'downRight' | 'down' | 'downLeft' | 'left' | 'upLeft',
): string {
  if (squareName.length !== 2 && squareName.length !== 3) {
    console.error('Invalid square name:', squareName);
    return '-';
  }

  const fileIndex = parseInt(squareName.slice(0, -1)),
    rankIndex = squareName.slice(-1).charCodeAt(0) - 'a'.charCodeAt(0) + 1;

  const directions = {
    up: { file: 0, rank: -1 },
    upRight: { file: -1, rank: -1 },
    right: { file: -1, rank: 0 },
    downRight: { file: -1, rank: 1 },
    down: { file: 0, rank: 1 },
    downLeft: { file: 1, rank: 1 },
    left: { file: 1, rank: 0 },
    upLeft: { file: 1, rank: -1 },
  };

  const directionChange = directions[direction];
  if (!directionChange) {
    console.error('Invalid direction:', direction);
    return '-'; // Invalid direction
  }

  const newFileIndex = fileIndex + directionChange.file;
  const newRankIndex = rankIndex + directionChange.rank;

  if (newFileIndex < 0 || newFileIndex > 12 || newRankIndex < 0 || newRankIndex > 12) {
    console.error('Out of bounds:', squareName, direction);

    return '-'; // Out of bounds
  }

  const ranks = 'abcdefghijkl';
  const newSquareName = newFileIndex + ranks[newRankIndex - 1];
  return newSquareName;
}
