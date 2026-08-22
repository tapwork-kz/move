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
  if (lower.includes('ноутбук') || lower.includes('ultrabook') || lower.includes('expertbook') || lower.includes('macbook') || lower.includes('laptop') || lower.includes('thinkpad') || lower.includes('ideapad') || lower.includes('vivobook') || lower.includes('zenbook') || lower.includes('rog') || lower.includes('tuf') || lower.includes('pavilion') || lower.includes('victus') || lower.includes('legion')) {
    category = 'laptop';
  } else if (lower.includes('телефон') || lower.includes('смартфон') || lower.includes('iphone') || lower.includes('galaxy') || lower.includes('xiaomi') || lower.includes('redmi') || lower.includes('poco') || lower.includes('vivo') || lower.includes('oppo') || lower.includes('realme') || lower.includes('honor')) {
    category = 'phone';
  } else if (lower.includes('телевизор') || lower.includes('led') || lower.includes('qled') || lower.includes('oled') || lower.includes('smart tv')) {
    category = 'tv';
  } else {
    category = 'general';
  }

  // --- 1. Parse CPU ---
  let cpu = '';
  const intelMatch = name.match(/(?:Intel|Core\s*)?(?:i[3579]|Core\s*Ultra\s*[579]|Celeron|Pentium|N\d{3,4})[\s\-]*\d{3,5}[A-Z0-9]*(?:\s*\d+(?:\.\d+)?\s*GHz)?/i);
  const ryzenMatch = name.match(/(?:AMD\s*)?(?:Ryzen\s*[3579]|Athlon)[\s\-]*\d{3,5}[A-Z0-9]*/i);
  const appleChipMatch = name.match(/Apple\s*M[1234](?:\s*(?:Pro|Max|Ultra))?/i);
  const snapdragonMatch = name.match(/(?:Snapdragon|Dimensity|Helio|Exynos|Apple\s*A\d+)\s*[\w\d\s]+/i);

  if (intelMatch) {
    cpu = intelMatch[0].trim();
  } else if (ryzenMatch) {
    cpu = ryzenMatch[0].trim();
  } else if (appleChipMatch) {
    cpu = appleChipMatch[0].trim();
  } else if (snapdragonMatch) {
    cpu = snapdragonMatch[0].trim();
  } else {
    cpu = '13th Gen Intel(R) Core(TM) i5-1340P';
  }

  // --- 2. Parse Display ---
  let display = '';
  const screenDiagMatch = name.match(/(?:1[3-7](?:\.[0-9])?|2[47]|32|43|50|55|65|75|85)(?:["'″\s]*(?:FHD|HD|2K|4K|UHD|QHD|WQXGA|IPS|OLED|Retina)?)/i);
  const resMatch = name.match(/(?:1920\s*x\s*1080|2560\s*x\s*1600|2880\s*x\s*1800|3840\s*x\s*2160|FHD|OLED|2K|4K)/i);

  if (screenDiagMatch && resMatch) {
    display = `${screenDiagMatch[0].trim()} (${resMatch[0].trim()})`;
  } else if (screenDiagMatch) {
    display = screenDiagMatch[0].trim();
  } else if (resMatch) {
    display = resMatch[0].trim();
  } else {
    display = '1920 x 1080 FHD IPS';
  }

  // --- 3. Parse RAM ---
  let ram = '';
  const ramMatch = name.match(/(\d{1,2})\s*(?:GB|ГБ|Gb|гб)(?:\s*DDR[45])?/i);
  if (ramMatch) {
    ram = `${ramMatch[1]} GB`;
  } else {
    ram = '8 GB';
  }

  // --- 4. Parse Storage / SSD ---
  let storage = '';
  const ssdMatch = name.match(/(\d{3,4})\s*(?:GB|ГБ|Gb|гб|TB|ТБ|Tb|тб)\s*(?:SSD|NVMe|eMMC|SSD M\.2)?/i);
  const multiStorageMatch = name.match(/\b(?:128|256|512|1000|1TB|2TB)\b/i);

  if (ssdMatch) {
    storage = ssdMatch[0].trim();
  } else if (multiStorageMatch) {
    const val = multiStorageMatch[0].toUpperCase();
    storage = val.includes('TB') ? val : `${val} GB SSD`;
  } else {
    storage = '475 GB SSD';
  }

  // --- 5. Parse GPU ---
  let gpu = '';
  const rtxMatch = name.match(/(?:RTX\s*\d{4}(?:\s*Ti)?|GTX\s*\d{4}(?:\s*Ti)?)/i);
  const radeonMatch = name.match(/Radeon\s*(?:Graphics|RX\s*\d{4})/i);
  const intelGpuMatch = name.match(/(?:Intel\s*)?(?:Iris\s*Xe|UHD\s*Graphics)/i);

  if (rtxMatch) {
    gpu = `NVIDIA GeForce ${rtxMatch[0].trim()}`;
  } else if (radeonMatch) {
    gpu = `AMD ${radeonMatch[0].trim()}`;
  } else if (intelGpuMatch) {
    gpu = intelGpuMatch[0].trim();
  } else {
    gpu = 'Intel(R) UHD Graphics';
  }

  // --- 6. Parse OS ---
  let os = '';
  if (lower.includes('win11') || lower.includes('windows 11') || lower.includes('w11')) {
    os = 'Microsoft Windows 11';
  } else if (lower.includes('mac') || lower.includes('macos')) {
    os = 'macOS';
  } else if (lower.includes('dos') || lower.includes('no os') || lower.includes('без ос') || lower.includes('freedos')) {
    os = 'FreeDOS / Без ОС';
  } else {
    os = 'Microsoft Windows 11 Home';
  }

  // Build spec rows
  let specsList = [];
  if (category === 'laptop') {
    specsList = [
      { id: 'cpu', icon: 'cpu', label: 'Процессор', value: cpu },
      { id: 'screen', icon: 'screen', label: 'Экран', value: display },
      { id: 'ram', icon: 'ram', label: 'Оперативная память', value: ram },
      { id: 'ssd', icon: 'ssd', label: 'Накопитель', value: storage },
      { id: 'gpu', icon: 'gpu', label: 'Видеокарта', value: gpu },
      { id: 'os', icon: 'os', label: 'ОС', value: os }
    ];
  } else if (category === 'phone') {
    specsList = [
      { id: 'cpu', icon: 'cpu', label: 'Процессор', value: cpu },
      { id: 'screen', icon: 'screen', label: 'Экран', value: display || '6.7" OLED 120Hz' },
      { id: 'ram', icon: 'ram', label: 'Память (RAM/ROM)', value: `${ram} / ${storage}` },
      { id: 'camera', icon: 'camera', label: 'Камера', value: '48 MP + 12 MP + 12 MP' },
      { id: 'battery', icon: 'battery', label: 'Аккумулятор', value: '5000 mAh' },
      { id: 'os', icon: 'os', label: 'ОС', value: 'Android / iOS' }
    ];
  } else {
    specsList = [
      { id: 'screen', icon: 'screen', label: 'Диагональ / Разрешение', value: display || '55" 4K UHD' },
      { id: 'cpu', icon: 'cpu', label: 'Процессор / Smart TV', value: cpu || 'Smart TV Tizen OS' },
      { id: 'sound', icon: 'sound', label: 'Звук', value: 'Dolby Digital Plus 20W' },
      { id: 'wifi', icon: 'wifi', label: 'Беспроводная связь', value: 'Wi-Fi 5, Bluetooth 5.2' }
    ];
  }

  return {
    title: name,
    category,
    sku: sku || '37230025006',
    specs: specsList
  };
}

export function getDefaultLaptopSpecs() {
  return {
    title: 'Ноутбук ASUS ExpertBook B5 Flip B5402FVA-HY0043X 14 FHD Core i5 1340P 1.9 GHz',
    category: 'laptop',
    sku: '37230025006',
    brand: 'МЕЧТА',
    basePrice: '599990',
    price: '529990',
    activeGift: 'Сумка для ноутбука ASUS Nereus Backpack',
    specs: [
      { id: 'cpu', icon: 'cpu', label: 'Процессор', value: '13th Gen Intel(R) Core(TM) i5-1340P' },
      { id: 'screen', icon: 'screen', label: 'Экран', value: '1920 x 1080' },
      { id: 'ram', icon: 'ram', label: 'ОЗУ', value: '8 GB' },
      { id: 'ssd', icon: 'ssd', label: 'Накопитель', value: '475 GB' },
      { id: 'gpu', icon: 'gpu', label: 'Видеоадаптер', value: 'Intel(R) UHD Graphics' },
      { id: 'os', icon: 'os', label: 'Операционная система', value: 'Microsoft Windows 11 Pro Standalone Workstation (22H2)' }
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
