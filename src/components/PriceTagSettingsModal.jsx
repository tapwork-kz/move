import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { parseSpecsFromRawName, getDefaultLaptopSpecs, formatPrice } from '../utils/specsParser';

export default function PriceTagSettingsModal({
  isOpen,
  onClose,
  currentConfig,
  onSaveConfig,
  branches = [
    { id: 'rozybakieva', name: 'Алматы, Розыбакиева 275а' },
    { id: 'mart_village', name: 'Алматы, Mart Village' }
  ]
}) {
  const [activeTab, setActiveTab] = useState('search'); // 'search' | 'specs' | 'theme'
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(currentConfig?.branch || 'rozybakieva');

  // Form state
  const [config, setConfig] = useState(currentConfig || {
    title: '',
    sku: '37230025006',
    price: '529990',
    brandName: 'МЕЧТА',
    showPromoShield: true,
    promoShieldText: 'АРТЫҚ ТӨЛЕМСІЗ БӨЛІП ТӨЛЕУ 0-0-24',
    qrUrl: 'https://mechta.kz',
    backgroundTheme: 'mechta_magenta',
    customBgUrl: '',
    specs: getDefaultLaptopSpecs().specs,
    branch: 'rozybakieva'
  });

  const [hardwareDetecting, setHardwareDetecting] = useState(false);

  useEffect(() => {
    if (currentConfig) {
      setConfig(currentConfig);
      if (currentConfig.branch) setSelectedBranch(currentConfig.branch);
    }
  }, [currentConfig, isOpen]);

  // Live search in Supabase inventory & documents
  useEffect(() => {
    const query = searchQuery.trim();
    if (!query) {
      setSearchResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setSearching(true);
      try {
        // 1. Search in inventory
        const { data: invData } = await supabase
          .from('inventory')
          .select('*')
          .ilike('raw_name', `%${query}%`)
          .eq('branch', selectedBranch)
          .limit(20);

        // 2. Fetch prices from document_items
        let priceMap = {};
        if (invData && invData.length > 0) {
          const names = invData.map(i => i.normalized_name).filter(Boolean);
          if (names.length > 0) {
            const { data: docItems } = await supabase
              .from('document_items')
              .select('normalized_name, raw_name, price, created_at')
              .in('normalized_name', names)
              .order('created_at', { ascending: false });

            if (docItems) {
              docItems.forEach(d => {
                const k = d.normalized_name?.trim().toLowerCase();
                if (k && !priceMap[k]) priceMap[k] = d.price;
              });
            }
          }
        }

        const combined = (invData || []).map(item => {
          const k = item.normalized_name?.trim().toLowerCase();
          return {
            id: item.id,
            raw_name: item.raw_name,
            normalized_name: item.normalized_name,
            stock_warehouse: item.stock_warehouse,
            stock_showcase: item.stock_showcase,
            price: priceMap[k] || '—'
          };
        });

        setSearchResults(combined);
      } catch (err) {
        console.error('Ошибка поиска номенклатуры:', err);
      } finally {
        setSearching(false);
      }
    }, 250);

    return () => clearTimeout(timeout);
  }, [searchQuery, selectedBranch]);

  // When an item is picked from DB search
  const handleSelectProduct = (item) => {
    const parsed = parseSpecsFromRawName(item.raw_name);
    const cleanPrice = item.price !== '—' ? String(item.price).replace(/[₸\s]/g, '') : config.price;

    const newConf = {
      ...config,
      title: item.raw_name,
      sku: parsed.sku || String(item.id),
      price: cleanPrice || '529990',
      specs: parsed.specs,
      branch: selectedBranch
    };

    setConfig(newConf);
    onSaveConfig(newConf);
    setActiveTab('specs');
  };

  // Hardware Auto-Detection (Windows / Desktop / Web)
  const handleAutoDetectSpecs = async () => {
    setHardwareDetecting(true);
    try {
      if (window.electronAPI && window.electronAPI.getSystemSpecs) {
        // Native Windows Electron API
        const sys = await window.electronAPI.getSystemSpecs();
        if (sys) {
          const updatedSpecs = [
            { id: 'cpu', icon: 'cpu', label: 'Процессор', value: sys.cpu || 'Intel Core i5' },
            { id: 'screen', icon: 'screen', label: 'Экран', value: sys.resolution || `${window.screen.width} x ${window.screen.height}` },
            { id: 'ram', icon: 'ram', label: 'ОЗУ', value: sys.ram || '8 GB' },
            { id: 'ssd', icon: 'ssd', label: 'Накопитель', value: sys.disk || '512 GB SSD' },
            { id: 'gpu', icon: 'gpu', label: 'Видеокарта', value: sys.gpu || 'Intel UHD Graphics' },
            { id: 'os', icon: 'os', label: 'Операционная система', value: sys.os || 'Windows 11' }
          ];
          setConfig(prev => ({
            ...prev,
            specs: updatedSpecs
          }));
        }
      } else {
        // Web Browser Fallback Detection
        const screenRes = `${window.screen.width} x ${window.screen.height}`;
        const cores = navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency} Cores` : '';
        const ramEst = navigator.deviceMemory ? `${navigator.deviceMemory} GB` : '8 GB';
        const ua = navigator.userAgent;
        let osName = 'Microsoft Windows 11';
        if (ua.includes('Mac')) osName = 'macOS';
        else if (ua.includes('Windows')) osName = 'Microsoft Windows 11 Pro';

        const updatedSpecs = [
          { id: 'cpu', icon: 'cpu', label: 'Процессор', value: cores ? `Intel/AMD (${cores})` : 'Intel Core Processor' },
          { id: 'screen', icon: 'screen', label: 'Экран', value: screenRes },
          { id: 'ram', icon: 'ram', label: 'ОЗУ', value: ramEst },
          { id: 'ssd', icon: 'ssd', label: 'Накопитель', value: '475 GB SSD' },
          { id: 'gpu', icon: 'gpu', label: 'Видеокарта', value: 'Intel(R) UHD Graphics' },
          { id: 'os', icon: 'os', label: 'Операционная система', value: osName }
        ];

        setConfig(prev => ({
          ...prev,
          specs: updatedSpecs
        }));
      }
    } catch (err) {
      console.error('Ошибка автоопределения характеристик:', err);
    } finally {
      setHardwareDetecting(false);
    }
  };

  const handleSpecChange = (index, field, value) => {
    const updated = [...config.specs];
    updated[index] = { ...updated[index], [field]: value };
    setConfig(prev => ({ ...prev, specs: updated }));
  };

  const handleAddSpec = () => {
    setConfig(prev => ({
      ...prev,
      specs: [...prev.specs, { id: `spec_${Date.now()}`, icon: 'cpu', label: 'Параметр', value: 'Значение' }]
    }));
  };

  const handleRemoveSpec = (index) => {
    setConfig(prev => ({
      ...prev,
      specs: prev.specs.filter((_, i) => i !== index)
    }));
  };

  const handleSave = () => {
    onSaveConfig(config);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 select-none animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/50">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              Настройка витринного ценника
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Выбор номенклатуры из базы, характеристики и оформление экрана
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-5 pt-2 gap-2 bg-slate-50/50 dark:bg-slate-950/30">
          <button
            onClick={() => setActiveTab('search')}
            className={`pb-2.5 px-3 text-xs font-bold transition border-b-2 ${
              activeTab === 'search'
                ? 'border-rose-600 text-rose-600 dark:text-rose-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            1. Поиск в базе Supabase
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`pb-2.5 px-3 text-xs font-bold transition border-b-2 ${
              activeTab === 'specs'
                ? 'border-rose-600 text-rose-600 dark:text-rose-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            2. Характеристики и цена
          </button>
          <button
            onClick={() => setActiveTab('theme')}
            className={`pb-2.5 px-3 text-xs font-bold transition border-b-2 ${
              activeTab === 'theme'
                ? 'border-rose-600 text-rose-600 dark:text-rose-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            3. Фон и брендинг
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          
          {/* TAB 1: SEARCH IN SUPABASE */}
          {activeTab === 'search' && (
            <div className="space-y-4">
              
              {/* Branch Selector */}
              <div className="flex items-center gap-3">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                  Филиал:
                </label>
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none w-full"
                >
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              {/* Search input */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Введите наименование, модель или артикул товара (например: ASUS ExpertBook, iPhone, Samsung)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-rose-500"
                  autoFocus
                />
                {searching && (
                  <div className="absolute right-3 top-3 text-[10px] font-bold text-rose-500 animate-pulse">
                    ПОИСК...
                  </div>
                )}
              </div>

              {/* Results List */}
              <div className="space-y-2 max-h-[340px] overflow-y-auto">
                {searchResults.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs font-medium bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                    {searchQuery.trim() ? 'По вашему запросу ничего не найдено в базе' : 'Начните вводить название товара для поиска в базе данных'}
                  </div>
                ) : (
                  searchResults.map(item => (
                    <div
                      key={item.id}
                      onClick={() => handleSelectProduct(item)}
                      className="p-3 bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-slate-200 dark:border-slate-700 hover:border-rose-300 dark:hover:border-rose-800 rounded-xl cursor-pointer transition flex items-center justify-between gap-3 group"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition leading-snug">
                          {item.raw_name}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                          <span>Склад: <b className="text-blue-600">{item.stock_warehouse || 0}</b></span>
                          <span>•</span>
                          <span>Витрина: <b className="text-amber-600">{item.stock_showcase || 0}</b></span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-xs font-black text-slate-900 dark:text-white">
                          {formatPrice(item.price)}
                        </div>
                        <span className="text-[9px] text-rose-600 font-bold bg-rose-50 dark:bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-200 dark:border-rose-900 mt-0.5 inline-block">
                          Выбрать →
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 2: SPECS & PRICE */}
          {activeTab === 'specs' && (
            <div className="space-y-4">
              
              {/* Auto detect button */}
              <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-950/40 p-3 rounded-xl border border-blue-200 dark:border-blue-900">
                <div className="text-xs text-blue-900 dark:text-blue-200">
                  <strong className="block font-bold">Считать характеристики этого ПК</strong>
                  Автоматически определить процессор, RAM, накопитель, видеокарту и ОС
                </div>
                <button
                  type="button"
                  onClick={handleAutoDetectSpecs}
                  disabled={hardwareDetecting}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shrink-0 shadow-xs"
                >
                  {hardwareDetecting ? 'Сканирование...' : 'Считать железо ⚡'}
                </button>
              </div>

              {/* Product Title */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-400 tracking-wider mb-1">
                  Полное наименование товара
                </label>
                <textarea
                  rows="2"
                  value={config.title}
                  onChange={(e) => setConfig({ ...config, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white outline-none"
                />
              </div>

              {/* Price & SKU */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-400 tracking-wider mb-1">
                    Цена (тг)
                  </label>
                  <input
                    type="text"
                    value={config.price}
                    onChange={(e) => setConfig({ ...config, price: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-400 tracking-wider mb-1">
                    Артикул / Код
                  </label>
                  <input
                    type="text"
                    value={config.sku}
                    onChange={(e) => setConfig({ ...config, sku: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              {/* Specs Editor List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                    Характеристики товара
                  </label>
                  <button
                    type="button"
                    onClick={handleAddSpec}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400"
                  >
                    + Добавить строку
                  </button>
                </div>

                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {config.specs.map((item, idx) => (
                    <div key={item.id || idx} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
                      
                      {/* Icon Selector */}
                      <select
                        value={item.icon || 'cpu'}
                        onChange={(e) => handleSpecChange(idx, 'icon', e.target.value)}
                        className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg p-1 text-[11px] font-bold text-slate-700 dark:text-slate-200 outline-none w-20 shrink-0"
                      >
                        <option value="cpu">CPU 🔲</option>
                        <option value="screen">Экран 🖥️</option>
                        <option value="ram">RAM 💾</option>
                        <option value="ssd">SSD 💽</option>
                        <option value="gpu">GPU 🎮</option>
                        <option value="os">ОС 🪟</option>
                        <option value="camera">Камера 📷</option>
                        <option value="battery">Батарея 🔋</option>
                        <option value="sound">Звук 🔊</option>
                        <option value="wifi">Связь 📶</option>
                      </select>

                      {/* Value Input */}
                      <input
                        type="text"
                        value={item.value}
                        onChange={(e) => handleSpecChange(idx, 'value', e.target.value)}
                        className="flex-1 px-2.5 py-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-medium text-slate-900 dark:text-white outline-none"
                        placeholder="Значение характеристики..."
                      />

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveSpec(idx)}
                        className="text-slate-400 hover:text-red-500 p-1 transition"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: THEME & BRANDING */}
          {activeTab === 'theme' && (
            <div className="space-y-4">
              
              {/* Brand & Promo shield */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-400 tracking-wider mb-1">
                    Название бренда / Магазина
                  </label>
                  <input
                    type="text"
                    value={config.brandName}
                    onChange={(e) => setConfig({ ...config, brandName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-400 tracking-wider mb-1">
                    QR-ссылка для покупателей
                  </label>
                  <input
                    type="text"
                    value={config.qrUrl}
                    onChange={(e) => setConfig({ ...config, qrUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              {/* Promo Ribbon / Shield Toggle */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.showPromoShield}
                    onChange={(e) => setConfig({ ...config, showPromoShield: e.target.checked })}
                    className="rounded text-rose-600 focus:ring-0 w-4 h-4"
                  />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Отображать боковой шильдик рассрочки / промо
                  </span>
                </label>
                {config.showPromoShield && (
                  <input
                    type="text"
                    value={config.promoShieldText}
                    onChange={(e) => setConfig({ ...config, promoShieldText: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-semibold text-slate-900 dark:text-white outline-none"
                    placeholder="Текст на шильдике (например: АРТЫҚ ТӨЛЕМСІЗ БӨЛІП ТӨЛЕУ 0-0-24)"
                  />
                )}
              </div>

              {/* Background Preset Selection */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-400 tracking-wider mb-2">
                  Фоновое оформление экрана
                </label>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: 'mechta_magenta', name: 'Малиновый Мечта (Фото)', class: 'from-[#a10e47] via-[#850b39] to-[#590424]' },
                    { id: 'electric_blue', name: 'Электрик Синий', class: 'from-blue-600 via-indigo-700 to-slate-900' },
                    { id: 'emerald_premium', name: 'Изумрудный', class: 'from-emerald-700 via-teal-800 to-slate-950' },
                    { id: 'oled_dark', name: 'Тёмный Showroom', class: 'from-slate-950 via-slate-900 to-black' }
                  ].map(theme => (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => setConfig({ ...config, backgroundTheme: theme.id, customBgUrl: '' })}
                      className={`p-3 rounded-xl border text-left transition relative overflow-hidden ${
                        config.backgroundTheme === theme.id && !config.customBgUrl
                          ? 'border-rose-500 ring-2 ring-rose-500/50'
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <div className={`h-10 rounded-lg bg-gradient-to-br ${theme.class} mb-2 shadow-inner`} />
                      <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block truncate">
                        {theme.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Image URL */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-400 tracking-wider mb-1">
                  Или укажите ссылку на свой фоновый баннер (URL картинки):
                </label>
                <input
                  type="text"
                  placeholder="https://example.com/banner.jpg"
                  value={config.customBgUrl || ''}
                  onChange={(e) => setConfig({ ...config, customBgUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white outline-none"
                />
              </div>

            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            Отмена
          </button>
          
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md transition active:scale-95"
          >
            Применить на экране ✓
          </button>
        </div>

      </div>
    </div>
  );
}
