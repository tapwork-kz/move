// Lightweight QR Code Generator (Pure JavaScript, 0 dependencies)
// Generates SVG path / matrix for rendering QR codes on digital price tags

export function generateQRCodeSVG(text, size = 120) {
  const qr = createQRCode(text || 'https://mechta.kz');
  const moduleCount = qr.getModuleCount();
  const cellSize = size / moduleCount;

  let rects = [];
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (qr.isDark(row, col)) {
        const x = (col * cellSize).toFixed(2);
        const y = (row * cellSize).toFixed(2);
        const w = (cellSize + 0.05).toFixed(2);
        const h = (cellSize + 0.05).toFixed(2);
        rects.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#000000" />`);
      }
    }
  }

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" class="w-full h-full">
      <rect width="100%" height="100%" fill="#ffffff" rx="4" />
      ${rects.join('')}
    </svg>
  `;
}

function createQRCode(text) {
  const typeNumber = text.length > 50 ? 6 : (text.length > 25 ? 4 : 2);
  const rsBlockTable = {
    2: [1, 28, 16],
    4: [2, 40, 28],
    6: [4, 34, 18],
    8: [4, 48, 26]
  };

  const rsBlocks = rsBlockTable[typeNumber] || rsBlockTable[4];
  const dataCount = rsBlocks[0] * rsBlocks[2];

  const buffer = [];
  buffer.push(0x4);
  buffer.push(text.length);

  for (let i = 0; i < text.length; i++) {
    buffer.push(text.charCodeAt(i));
  }

  const bitBuffer = {
    buffer: [],
    length: 0,
    put: function(num, length) {
      for (let i = 0; i < length; i++) {
        this.putBit(((num >>> (length - i - 1)) & 1) === 1);
      }
    },
    putBit: function(bit) {
      const bufIndex = Math.floor(this.length / 8);
      if (this.buffer.length <= bufIndex) {
        this.buffer.push(0);
      }
      if (bit) {
        this.buffer[bufIndex] |= (0x80 >>> (this.length % 8));
      }
      this.length++;
    }
  };

  bitBuffer.put(0x4, 4);
  bitBuffer.put(text.length, typeNumber < 10 ? 8 : 16);
  for (let i = 0; i < text.length; i++) {
    bitBuffer.put(text.charCodeAt(i), 8);
  }

  if (bitBuffer.length + 4 <= dataCount * 8) {
    bitBuffer.put(0, 4);
  }

  while (bitBuffer.length % 8 !== 0) {
    bitBuffer.putBit(false);
  }

  const PAD0 = 0xec;
  const PAD1 = 0x11;
  while (bitBuffer.length < dataCount * 8) {
    bitBuffer.put(PAD0, 8);
    if (bitBuffer.length < dataCount * 8) {
      bitBuffer.put(PAD1, 8);
    }
  }

  const moduleCount = typeNumber * 4 + 17;
  const modules = Array.from({ length: moduleCount }, () => Array(moduleCount).fill(null));

  function setupPositionProbePattern(row, col) {
    for (let r = -1; r <= 7; r++) {
      if (row + r <= -1 || moduleCount <= row + r) continue;
      for (let c = -1; c <= 7; c++) {
        if (col + c <= -1 || moduleCount <= col + c) continue;
        if ((0 <= r && r <= 6 && (c === 0 || c === 6)) ||
            (0 <= c && c <= 6 && (r === 0 || r === 6)) ||
            (2 <= r && r <= 4 && 2 <= c && c <= 4)) {
          modules[row + r][col + c] = true;
        } else {
          modules[row + r][col + c] = false;
        }
      }
    }
  }

  setupPositionProbePattern(0, 0);
  setupPositionProbePattern(moduleCount - 7, 0);
  setupPositionProbePattern(0, moduleCount - 7);

  for (let r = 8; r < moduleCount - 8; r++) {
    if (modules[r][6] === null) modules[r][6] = (r % 2 === 0);
  }
  for (let c = 8; c < moduleCount - 8; c++) {
    if (modules[6][c] === null) modules[6][c] = (c % 2 === 0);
  }

  let bitIndex = 0;
  let dir = -1;
  let row = moduleCount - 1;
  let col = moduleCount - 1;

  while (col > 0) {
    if (col === 6) col--;
    while (true) {
      for (let c = 0; c < 2; c++) {
        if (modules[row][col - c] === null) {
          let dark = false;
          if (bitIndex < bitBuffer.length) {
            dark = ((bitBuffer.buffer[Math.floor(bitIndex / 8)] >>> (7 - (bitIndex % 8))) & 1) === 1;
          }
          const mask = ((row + (col - c)) % 2 === 0);
          modules[row][col - c] = dark ^ mask;
          bitIndex++;
        }
      }
      row += dir;
      if (row < 0 || moduleCount <= row) {
        row -= dir;
        dir = -dir;
        break;
      }
    }
    col -= 2;
  }

  return {
    getModuleCount: () => moduleCount,
    isDark: (r, c) => modules[r][c] === true
  };
}
