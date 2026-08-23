// Intelligent specification and inventory matching parser for retail

export function normalizeNameForMatching(str = '') {
  if (!str) return '';
  return String(str)
    .toLowerCase()
    // Homoglyphs replacement (cyrillic to latin)
    .replace(/а/g, 'a')
    .replace(/в/g, 'b')
    .replace(/е/g, 'e')
    .replace(/к/g, 'k')
    .replace(/м/g, 'm')
    .replace(/н/g, 'h')
    .replace(/о/g, 'o')
    .replace(/р/g, 'p')
    .replace(/с/g, 'c')
    .replace(/т/g, 't')
    .replace(/у/g, 'y')
    .replace(/х/g, 'x')
    // Remove leading SKU / article / brackets
    .replace(/^\[\d+\]\s*/, '')
    .replace(/^\d{4,9}\s+/, '')
    // Remove punctuation & extra whitespace
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

// Robust multi-tier inventory matching for a branch
export function findMatchingInventoryStock(docItem, inventoryList = []) {
  if (!docItem || !inventoryList || inventoryList.length === 0) {
    return { wh: 0, sc: 0, inStock: false };
  }

  const rawDoc = String(docItem.raw_name || '').trim().toLowerCase();
  const normDoc = String(docItem.normalized_name || '').trim().toLowerCase();
  const cleanDocKey = normalizeNameForMatching(docItem.raw_name || docItem.normalized_name);

  // 1. Direct match by raw_name or normalized_name
  for (const inv of inventoryList) {
    const invRaw = String(inv.raw_name || '').trim().toLowerCase();
    const invNorm = String(inv.normalized_name || '').trim().toLowerCase();

    if ((rawDoc && (invRaw === rawDoc || invNorm === rawDoc)) || 
        (normDoc && (invNorm === normDoc || invRaw === normDoc))) {
      const wh = inv.stock_warehouse ?? 0;
      const sc = inv.stock_showcase ?? 0;
      return { wh, sc, inStock: (wh + sc) > 0, matchedItem: inv };
    }
  }

  // 2. Cleaned homoglyph & punctuation match
  if (cleanDocKey.length >= 4) {
    for (const inv of inventoryList) {
      const cleanInvKey = normalizeNameForMatching(inv.raw_name || inv.normalized_name);
      if (cleanInvKey && (cleanInvKey === cleanDocKey || cleanInvKey.includes(cleanDocKey) || cleanDocKey.includes(cleanInvKey))) {
        const wh = inv.stock_warehouse ?? 0;
        const sc = inv.stock_showcase ?? 0;
        return { wh, sc, inStock: (wh + sc) > 0, matchedItem: inv };
      }
    }
  }

  // 3. Fallback: Check if item is flagged in document
  const isDocStock = docItem.is_in_stock === true;
  return { wh: 0, sc: 0, inStock: isDocStock };
}

export function isValidPrice(price) {
  if (!price) return false;
  const s = String(price).toLowerCase().trim();
  if (s === '' || s === '—' || s === '-' || s === 'null' || s === 'undefined' || s === '0' || s === '0 ₸' || s === '0₸' || s === '0 тг' || s === '0тг') {
    return false;
  }
  if (s.includes('подарок') || s.includes('бонус') || s.includes('скидк') || s.includes('комплект') || s.includes('gift')) {
    return false;
  }
  const cleanNum = s.replace(/[₸тг\s]/gi, '').trim();
  if (isNaN(cleanNum) || Number(cleanNum) <= 0) {
    return false;
  }
  return true;
}

export function calculateInstallment(priceVal, months = 24) {
  if (!priceVal) return '0 ₸';
  const clean = String(priceVal).replace(/[₸тг\s]/gi, '').trim();
  const num = Number(clean);
  if (isNaN(num) || num <= 0) return '0 ₸';
  const perMonth = Math.round(num / months);
  return `${perMonth.toLocaleString('ru-RU')} ₸`;
}

// Intelligent specification and inventory matching parser for retail

function smartSplitSlashes(str = '') {
  const parts = [];
  let current = [];
  let inParens = 0;
  for (const char of String(str)) {
    if (char === '(' || char === '[') {
      inParens++;
      current.push(char);
    } else if (char === ')' || char === ']') {
      if (inParens > 0) inParens--;
      current.push(char);
    } else if (char === '/' && inParens === 0) {
      parts.push(current.join('').trim());
      current = [];
    } else {
      current.push(char);
    }
  }
  if (current.length > 0) {
    parts.push(current.join('').trim());
  }
  return parts.filter(Boolean);
}

function formatRam(val) {
  if (!val) return '16 GB';
  const s = String(val).trim();
  if (/^\d+$/.test(s)) return `${s} GB`;
  if (!/(?:gb|гб)/i.test(s)) return `${s} GB`;
  return s;
}

function formatStorage(val) {
  if (!val) return '512 GB SSD';
  const s = String(val).trim();
  const m = s.match(/^(?:SSD)?\s*(\d+)\s*(TB|GB|ТБ|ГБ)?$/i);
  if (m) {
    const num = m[1];
    let unit = m[2];
    if (!unit) {
      unit = (num === '1' || num === '2') ? 'TB SSD' : 'GB SSD';
    } else {
      unit = `${unit.toUpperCase().replace('ТБ', 'TB').replace('ГБ', 'GB')} SSD`;
    }
    return `${num} ${unit}`;
  }
  if (!/SSD/i.test(s) && !/HDD/i.test(s) && !/eMMC/i.test(s)) {
    return `${s} SSD`;
  }
  return s;
}

function formatGpu(gpuName = '', vram = '') {
  if (!gpuName) return 'Intel® Iris® Xe Graphics';
  const g = String(gpuName).trim();
  const vramStr = (vram && /^\d+$/.test(String(vram).trim())) ? ` ${vram} GB` : (vram ? ` ${vram}` : '');

  if (/^RTX\s*\d{4}/i.test(g)) {
    return `NVIDIA GeForce ${g.toUpperCase()}${vramStr}`;
  }
  if (/^GTX\s*\d{4}/i.test(g)) {
    return `NVIDIA GeForce ${g.toUpperCase()}${vramStr}`;
  }
  if (/^(?:Radeon|RX)/i.test(g)) {
    return `AMD ${g}${vramStr}`;
  }
  if (vramStr) {
    return `${g}${vramStr}`;
  }
  return g;
}

function formatOs(val) {
  if (!val) return 'FreeDOS / Без ОС';
  const v = String(val).trim().toLowerCase();
  if (v.includes('dos') || v.includes('freedos') || v.includes('noos') || v.includes('no_os') || v.includes('без')) {
    return 'FreeDOS / Без ОС';
  }
  if (v.includes('win11') || v.includes('windows 11') || v.includes('w11')) {
    return 'Microsoft Windows 11';
  }
  if (v.includes('win10') || v.includes('windows 10') || v.includes('w10')) {
    return 'Microsoft Windows 10';
  }
  if (v.includes('mac')) {
    return 'macOS';
  }
  return String(val).trim();
}

export function parseSpecsFromRawName(rawName = '') {
  if (!rawName) {
    return getDefaultLaptopSpecs();
  }

  const name = String(rawName).trim();
  const lower = name.toLowerCase();

  // Extract Article/SKU if present (digits at the start or in brackets)
  let sku = '';
  const skuMatch = name.match(/^(?:\[(\d+)\]|(\d{6,14}))/);
  if (skuMatch) {
    sku = skuMatch[1] || skuMatch[2] || '';
  }

  // Detect category
  let category = 'laptop';
  if (lower.includes('ноутбук') || lower.includes('ultrabook') || lower.includes('expertbook') || lower.includes('macbook') || lower.includes('laptop') || lower.includes('thinkpad') || lower.includes('ideapad') || lower.includes('vivobook') || lower.includes('zenbook') || lower.includes('rog') || lower.includes('tuf') || lower.includes('pavilion') || lower.includes('victus') || lower.includes('legion') || lower.includes('nitro')) {
    category = 'laptop';
  } else if (lower.includes('телефон') || lower.includes('смартфон') || lower.includes('iphone') || lower.includes('galaxy') || lower.includes('xiaomi') || lower.includes('redmi') || lower.includes('poco') || lower.includes('vivo') || lower.includes('oppo') || lower.includes('realme') || lower.includes('honor')) {
    category = 'phone';
  } else if (lower.includes('телевизор') || lower.includes('led') || lower.includes('qled') || lower.includes('oled') || lower.includes('smart tv')) {
    category = 'tv';
  } else {
    category = 'general';
  }

  // --- Parse Laptop Specifications via Slash Delimiter ---
  if (category === 'laptop') {
    let parts = smartSplitSlashes(name);
    let title = parts[0] || name;
    let screen = '';
    let cpu = '';
    let ram = '';
    let storage = '';
    let gpu = '';
    let os = '';

    // Check if screen is attached to title before first slash, e.g. "Model (SKU) 16 WUXGA/Core..."
    const screenTailMatch = title.match(/\s+(1[3-7](?:[\.,]\d)?(?:\s*[\"\'″])?(?:\s*(?:FHD|HD|2K|4K|WUXGA|WQXGA|OLED|IPS|Retina|QHD|\d+Hz))*)$/i);
    if (screenTailMatch && parts.length >= 4 && !/(?:Core|Ryzen|Celeron|Pentium|Apple|Ultra)/i.test(screenTailMatch[1])) {
      screen = screenTailMatch[1].trim();
      title = title.substring(0, screenTailMatch.index).trim();
      parts = [title, screen, ...parts.slice(1)];
    }

    if (parts.length >= 5) {
      title = parts[0];
      screen = parts[1];
      cpu = parts[2];
      ram = formatRam(parts[3]);
      storage = formatStorage(parts[4]);

      const remaining = parts.slice(5);
      if (remaining.length === 0) {
        if (/ryzen|amd/i.test(cpu)) {
          gpu = 'AMD Radeon™ Graphics';
        } else if (/ultra/i.test(cpu)) {
          gpu = 'Intel® Arc™ Graphics';
        } else {
          gpu = 'Intel® Iris® Xe Graphics';
        }
        os = 'FreeDOS / Без ОС';
      } else if (remaining.length === 1) {
        const val = remaining[0];
        if (/(?:dos|win|noos|free|без|mac|linux)/i.test(val)) {
          os = formatOs(val);
          if (/ryzen|amd/i.test(cpu)) {
            gpu = 'AMD Radeon™ Graphics';
          } else if (/ultra/i.test(cpu)) {
            gpu = 'Intel® Arc™ Graphics';
          } else {
            gpu = 'Intel® Iris® Xe Graphics';
          }
        } else {
          gpu = formatGpu(val);
          os = 'FreeDOS / Без ОС';
        }
      } else if (remaining.length === 2) {
        const [p5, p6] = remaining;
        if (/^\d+$/.test(p6.trim())) {
          // p5 = GPU, p6 = VRAM (e.g. RTX3050 / 6)
          gpu = formatGpu(p5, p6);
          os = 'FreeDOS / Без ОС';
        } else {
          // p5 = GPU, p6 = OS
          gpu = formatGpu(p5);
          os = formatOs(p6);
        }
      } else if (remaining.length >= 3) {
        // e.g. RTX3050 / 6 / Dos
        gpu = formatGpu(remaining[0], remaining[1]);
        os = formatOs(remaining[2]);
      }
    } else {
      // Fallback regex extraction if no standard slashes
      const intelMatch = name.match(/(?:Intel|Core\s*)?(?:i[3579]|Core\s*Ultra\s*[579]|Celeron|Pentium|N\d{3,4})[\s\-]*\d{3,5}[A-Z0-9]*(?:\s*\d+(?:\.\d+)?\s*GHz)?/i);
      const ryzenMatch = name.match(/(?:AMD\s*)?(?:Ryzen\s*[3579]|Athlon)[\s\-]*\d{3,5}[A-Z0-9]*/i);
      const appleChipMatch = name.match(/Apple\s*M[1234](?:\s*(?:Pro|Max|Ultra))?/i);
      if (intelMatch) cpu = intelMatch[0].trim();
      else if (ryzenMatch) cpu = ryzenMatch[0].trim();
      else if (appleChipMatch) cpu = appleChipMatch[0].trim();
      else cpu = 'Intel® Core™ i5';

      const screenDiagMatch = name.match(/(?:1[3-7](?:\.[0-9])?)(?:["'″\s]*(?:FHD|HD|2K|4K|UHD|QHD|WUXGA|WQXGA|IPS|OLED|Retina)?)/i);
      screen = screenDiagMatch ? screenDiagMatch[0].trim() : '15.6" FHD IPS';

      const ramMatch = name.match(/(\d{1,2})\s*(?:GB|ГБ|Gb|гб)(?:\s*DDR[45])?/i);
      ram = ramMatch ? `${ramMatch[1]} GB` : '16 GB';

      const ssdMatch = name.match(/(\d{3,4})\s*(?:GB|ГБ|Gb|гб|TB|ТБ|Tb|тб)\s*(?:SSD|NVMe|eMMC)?/i);
      storage = ssdMatch ? ssdMatch[0].trim() : '512 GB SSD';

      const rtxMatch = name.match(/(?:RTX\s*\d{4}(?:\s*Ti)?|GTX\s*\d{4}(?:\s*Ti)?)/i);
      gpu = rtxMatch ? `NVIDIA GeForce ${rtxMatch[0].trim()}` : 'Intel® Iris® Xe Graphics';

      if (lower.includes('win11') || lower.includes('windows 11') || lower.includes('w11')) {
        os = 'Microsoft Windows 11';
      } else {
        os = 'FreeDOS / Без ОС';
      }
    }

    const specsList = [
      { id: 'cpu', icon: 'cpu', label: 'Процессор', value: cpu || 'Intel® Core™ i5' },
      { id: 'screen', icon: 'screen', label: 'Экран', value: screen || '15.6" FHD' },
      { id: 'ram', icon: 'ram', label: 'Оперативная память', value: ram || '16 GB' },
      { id: 'ssd', icon: 'ssd', label: 'Накопитель', value: storage || '512 GB SSD' },
      { id: 'gpu', icon: 'gpu', label: 'Видеокарта', value: gpu || 'Intel® Iris® Xe Graphics' },
      { id: 'os', icon: 'os', label: 'Операционная система', value: os || 'FreeDOS / Без ОС' }
    ];

    return {
      title,
      category: 'laptop',
      sku: sku || '37230025006',
      specs: specsList
    };
  }

  // --- Phone specs ---
  if (category === 'phone') {
    const ramMatch = name.match(/(\d{1,2})\s*\/\s*(\d{2,4})\s*(?:GB|ГБ)?/i);
    const ramVal = ramMatch ? `${ramMatch[1]} GB / ${ramMatch[2]} GB` : '8 GB / 256 GB';

    return {
      title: name,
      category: 'phone',
      sku: sku || '',
      specs: [
        { id: 'screen', icon: 'screen', label: 'Экран', value: '6.7" OLED 120Hz' },
        { id: 'cpu', icon: 'cpu', label: 'Процессор', value: '8-ядерный процессор' },
        { id: 'ram', icon: 'ram', label: 'Память (RAM / ROM)', value: ramVal },
        { id: 'camera', icon: 'camera', label: 'Камера', value: '50 MP + 8 MP + 2 MP' },
        { id: 'battery', icon: 'battery', label: 'Аккумулятор', value: '5000 mAh' },
        { id: 'os', icon: 'os', label: 'Операционная система', value: 'Android' }
      ]
    };
  }

  // --- TV / General specs ---
  return {
    title: name,
    category: 'tv',
    sku: sku || '',
    specs: [
      { id: 'screen', icon: 'screen', label: 'Диагональ / Разрешение', value: '55" 4K UHD Smart TV' },
      { id: 'cpu', icon: 'cpu', label: 'Smart TV', value: 'Tizen OS / Google TV' },
      { id: 'sound', icon: 'sound', label: 'Звук', value: 'Dolby Digital Plus 20W' },
      { id: 'wifi', icon: 'wifi', label: 'Беспроводная связь', value: 'Wi-Fi 5, Bluetooth 5.2' }
    ]
  };
}

export function getDefaultLaptopSpecs() {
  return {
    title: 'Ноутбук ACER Nitro V16 NL16-71G (NH.DAAER.001)',
    category: 'laptop',
    sku: '37230025006',
    brand: 'МЕЧТА',
    basePrice: '549990',
    price: '489990',
    activeGift: 'Сумка для ноутбука / Игровая мышь',
    specs: [
      { id: 'cpu', icon: 'cpu', label: 'Процессор', value: 'Core i5 13420H 2.1 Ghz' },
      { id: 'screen', icon: 'screen', label: 'Экран', value: '16 WUXGA 165Hz' },
      { id: 'ram', icon: 'ram', label: 'Оперативная память', value: '16 GB' },
      { id: 'ssd', icon: 'ssd', label: 'Накопитель', value: '512 GB SSD' },
      { id: 'gpu', icon: 'gpu', label: 'Видеокарта', value: 'NVIDIA GeForce RTX3050 6 GB' },
      { id: 'os', icon: 'os', label: 'Операционная система', value: 'FreeDOS / Без ОС' }
    ]
  };
}

export function formatPrice(priceVal) {
  if (!priceVal && priceVal !== 0) return '—';
  let str = String(priceVal).replace(/[₸тг\s]/gi, '').trim();
  let num = Number(str);
  if (!isNaN(num) && num > 0) {
    return `${num.toLocaleString('ru-RU')} ₸`;
  }
  return String(priceVal);
}
