// Minimal, dependency-free ZIP writer using the STORE method (no compression).

// Precomputed CRC-32 (IEEE 802.3) lookup table.
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

const crc32 = (data: Uint8Array): number => {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc = CRC_TABLE[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
};

export interface ZipEntry {
  name: string;
  data: Uint8Array;
}

// Fixed DOS date/time stamp: 1980-01-01 00:00:00 (the ZIP/DOS epoch). The exact timestamp is
// irrelevant for these debug artifacts, so a constant keeps the output deterministic.
const DOS_DATE = 0x0021; // (year-1980)<<9 | month<<5 | day  =>  0<<9 | 1<<5 | 1
const DOS_TIME = 0x0000;

/**
 * Build an uncompressed ZIP archive from the given entries and return it as bytes.
 */
export const createZip = (entries: ZipEntry[]): Uint8Array => {
  const encoder = new TextEncoder();
  const parts: Uint8Array[] = []; // local headers + file data, in order
  const central: Uint8Array[] = []; // central directory headers
  let offset = 0; // running offset of the next local header

  for (const entry of entries) {
    const nameBytes = encoder.encode(entry.name);
    const crc = crc32(entry.data);
    const size = entry.data.length;

    // Local file header (30 bytes + filename), followed by the raw file data.
    const local = new Uint8Array(30 + nameBytes.length);
    const lv = new DataView(local.buffer);
    lv.setUint32(0, 0x04034b50, true); // local file header signature
    lv.setUint16(4, 20, true); // version needed to extract (2.0)
    lv.setUint16(6, 0, true); // general purpose bit flag
    lv.setUint16(8, 0, true); // compression method: 0 = store
    lv.setUint16(10, DOS_TIME, true);
    lv.setUint16(12, DOS_DATE, true);
    lv.setUint32(14, crc, true);
    lv.setUint32(18, size, true); // compressed size
    lv.setUint32(22, size, true); // uncompressed size
    lv.setUint16(26, nameBytes.length, true);
    lv.setUint16(28, 0, true); // extra field length
    local.set(nameBytes, 30);
    parts.push(local, entry.data);

    // Central directory header (46 bytes + filename).
    const cd = new Uint8Array(46 + nameBytes.length);
    const cv = new DataView(cd.buffer);
    cv.setUint32(0, 0x02014b50, true); // central file header signature
    cv.setUint16(4, 20, true); // version made by
    cv.setUint16(6, 20, true); // version needed to extract
    cv.setUint16(8, 0, true); // general purpose bit flag
    cv.setUint16(10, 0, true); // compression method
    cv.setUint16(12, DOS_TIME, true);
    cv.setUint16(14, DOS_DATE, true);
    cv.setUint32(16, crc, true);
    cv.setUint32(20, size, true); // compressed size
    cv.setUint32(24, size, true); // uncompressed size
    cv.setUint16(28, nameBytes.length, true);
    cv.setUint16(30, 0, true); // extra field length
    cv.setUint16(32, 0, true); // file comment length
    cv.setUint16(34, 0, true); // disk number start
    cv.setUint16(36, 0, true); // internal file attributes
    cv.setUint32(38, 0, true); // external file attributes
    cv.setUint32(42, offset, true); // relative offset of local header
    cd.set(nameBytes, 46);
    central.push(cd);

    offset += local.length + size;
  }

  const centralSize = central.reduce((sum, p) => sum + p.length, 0);
  const centralOffset = offset;

  // End of central directory record (22 bytes, no archive comment).
  const end = new Uint8Array(22);
  const ev = new DataView(end.buffer);
  ev.setUint32(0, 0x06054b50, true); // EOCD signature
  ev.setUint16(4, 0, true); // number of this disk
  ev.setUint16(6, 0, true); // disk where central directory starts
  ev.setUint16(8, entries.length, true); // central directory records on this disk
  ev.setUint16(10, entries.length, true); // total central directory records
  ev.setUint32(12, centralSize, true);
  ev.setUint32(16, centralOffset, true);
  ev.setUint16(20, 0, true); // comment length

  const total = offset + centralSize + end.length;
  const out = new Uint8Array(total);
  let pos = 0;
  for (const part of parts) {
    out.set(part, pos);
    pos += part.length;
  }
  for (const part of central) {
    out.set(part, pos);
    pos += part.length;
  }
  out.set(end, pos);
  return out;
};
