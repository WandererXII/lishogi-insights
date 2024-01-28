export class BitReader {
  private bytes: Uint8Array;
  private bitOffset: number;
  private byteOffset: number;

  constructor(bytes: Uint8Array) {
    this.bytes = bytes;
    this.bitOffset = 0;
    this.byteOffset = 0;
  }

  readBits(bitsToRead: number): number {
    let result = 0;
    for (let i = 0; i < bitsToRead; i++) {
      if (this.byteOffset >= this.bytes.length) {
        result = result << 1;
      } else {
        const bit = (this.bytes[this.byteOffset] >>> (7 - this.bitOffset)) & 1;
        result = (result << 1) | bit;
      }
      this.bitOffset++;
      if (this.bitOffset === 8) {
        this.bitOffset = 0;
        this.byteOffset++;
      }
    }
    return result >>> 0;
  }
}
