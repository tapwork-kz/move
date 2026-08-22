import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import PriceTagCard from './PriceTagCard';
import PriceTagSettingsModal from './PriceTagSettingsModal';
import { getDefaultLaptopSpecs } from '../utils/specsParser';

export default function PriceTagKiosk({ onBackToDashboard }) {
  // Load saved config or fallback to default
  const [config, setConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('showcase_pricetag_config');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Ошибка загрузки конфигурации ценника:', e);
    }
    return {
      title: 'Ноутбук ASUS ExpertBook B5 Flip B5402FVA-HY0043X 14 FHD Core i5 1340P 1.9 GHz',
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
    };
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isUpdatedPulse, setIsUpdatedPulse] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const hideControlsTimeout = useRef(null);

  // Save config changes to localStorage
  const handleSaveConfig = (newConfig) => {
    setConfig(newConfig);
    try {
      localStorage.setItem('showcase_pricetag_config', JSON.stringify(newConfig));
    } catch (e) {
      console.error('Ошибка сохранения конфигурации:', e);
    }
  };

  // Fullscreen toggle handler
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Auto-hide controls on inactivity
  const handleActivity = () => {
    setShowControls(true);
    if (hideControlsTimeout.current) {
      clearTimeout(hideControlsTimeout.current);
    }
    hideControlsTimeout.current = setTimeout(() => {
      if (!isSettingsOpen) {
        setShowControls(false);
      }
    }, 3500);
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('touchstart', handleActivity);
    window.addEventListener('keydown', handleActivity);
    handleActivity();

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      if (hideControlsTimeout.current) clearTimeout(hideControlsTimeout.current);
    };
  }, [isSettingsOpen]);

  // Keyboard hotkeys
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'F11' || (e.key.toLowerCase() === 'f' && !isSettingsOpen)) {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key.toLowerCase() === 's' && !isSettingsOpen) {
        e.preventDefault();
        setIsSettingsOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSettingsOpen]);

  // REALTIME SUPABASE SYNC: Listening for price changes in real-time
  useEffect(() => {
    if (!config?.title) return;

    const normalizedTarget = config.title.trim().toLowerCase();

    // Check latest price from database periodically or on mount
    const checkLatestPrice = async () => {
      try {
        const { data: items } = await supabase
          .from('document_items')
          .select('price, raw_name, normalized_name, created_at')
          .ilike('raw_name', `%${config.title.slice(0, 20)}%`)
          .order('created_at', { ascending: false })
          .limit(5);

        if (items && items.length > 0) {
          const matching = items.find(i => 
            i.raw_name?.toLowerCase().includes(normalizedTarget) || 
            normalizedTarget.includes(i.raw_name?.toLowerCase())
          );
          if (matching && matching.price) {
            const clean = String(matching.price).replace(/[₸\s]/g, '');
            if (clean && clean !== config.price && !isNaN(clean)) {
              setConfig(prev => ({ ...prev, price: clean }));
              setIsUpdatedPulse(true);
              setTimeout(() => setIsUpdatedPulse(false), 3000);
            }
          }
        }
      } catch (err) {
        console.error('Ошибка проверки цены:', err);
      }
    };

    checkLatestPrice();

    // Subscribe to Supabase Realtime channel
    const channel = supabase
      .channel('pricetag-realtime-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'document_items' },
        (payload) => {
          const newRow = payload.new;
          if (newRow && newRow.price) {
            const raw = String(newRow.raw_name || '').toLowerCase();
            const norm = String(newRow.normalized_name || '').toLowerCase();
            if (raw.includes(normalizedTarget) || norm.includes(normalizedTarget) || normalizedTarget.includes(raw)) {
              const clean = String(newRow.price).replace(/[₸\s]/g, '');
              if (clean && !isNaN(clean)) {
                setConfig(prev => ({ ...prev, price: clean }));
                setIsUpdatedPulse(true);
                setTimeout(() => setIsUpdatedPulse(false), 4000);
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [config.title]);

  // Background style resolver
  const getBackgroundStyle = () => {
    if (config.customBgUrl) {
      return {
        backgroundImage: `url(${config.customBgUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      };
    }

    switch (config.backgroundTheme) {
      case 'electric_blue':
        return { background: 'radial-gradient(circle at 60% 40%, #1e40af 0%, #1e1b4b 60%, #09090b 100%)' };
      case 'emerald_premium':
        return { background: 'radial-gradient(circle at 60% 40%, #065f46 0%, #022c22 60%, #050505 100%)' };
      case 'oled_dark':
        return { background: 'radial-gradient(circle at 50% 50%, #1e293b 0%, #0f172a 50%, #020617 100%)' };
      case 'mechta_magenta':
      default:
        return { background: 'radial-gradient(circle at 70% 30%, #c0135a 0%, #900c43 45%, #590424 100%)' };
    }
  };

  return (
    <div 
      className="relative w-screen h-screen overflow-hidden flex items-center justify-center select-none"
      style={getBackgroundStyle()}
    >
      
      {/* Decorative Retail Background Graphics */}
      {!config.customBgUrl && (
        <>
          {/* Subtle brand glow and ambient highlights */}
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Top Right Mechta.kz Retail Logo Banner */}
          <div className="absolute top-6 right-8 sm:top-10 sm:right-14 z-10 flex items-center gap-2 bg-white/95 text-rose-900 px-4 py-2 rounded-2xl shadow-xl backdrop-blur-md border border-white/40">
            <div className="w-6 h-6 rounded-full bg-rose-700 text-white flex items-center justify-center">
              <svg className="w-3 h-3 fill-current ml-0.5" viewBox="0 0 24 24">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </div>
            <span className="text-base sm:text-lg font-black tracking-tight uppercase text-rose-900">
              {config.brandName || 'Mechta.kz'}
            </span>
          </div>

          {/* Background Illustration Accent (Abstract 3D showroom elements) */}
          <div className="absolute right-12 sm:right-28 bottom-12 sm:bottom-20 pointer-events-none opacity-25 sm:opacity-40 hidden md:block">
            <svg width="340" height="340" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="20" y="30" width="70" height="140" rx="12" fill="white" fillOpacity="0.3" />
              <rect x="110" y="50" width="70" height="120" rx="12" fill="white" fillOpacity="0.2" />
              <circle cx="100" cy="40" r="30" fill="white" fillOpacity="0.4" />
            </svg>
          </div>
        </>
      )}

      {/* Main Digital Price Tag Component */}
      <div className="relative z-20 transition-all duration-300 transform scale-95 sm:scale-100 lg:scale-105">
        <PriceTagCard
          productData={config}
          price={config.price}
          sku={config.sku}
          qrUrl={config.qrUrl}
          brandName={config.brandName}
          isUpdatedPulse={isUpdatedPulse}
          showPromoShield={config.showPromoShield}
          promoShieldText={config.promoShieldText}
        />
      </div>

      {/* Floating Auto-Hiding Control Bar */}
      <div 
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-40 bg-slate-950/85 backdrop-blur-md text-white px-4 py-2 rounded-2xl shadow-2xl border border-white/15 flex items-center gap-2.5 transition-all duration-300 ${
          showControls ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        <button
          type="button"
          onClick={() => setIsSettingsOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 rounded-xl text-xs font-bold transition shadow-sm active:scale-95"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          Выбрать товар / Настройки
        </button>

        <button
          type="button"
          onClick={toggleFullscreen}
          className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition"
          title="Во весь экран (F11)"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/></svg>
        </button>

        {onBackToDashboard && (
          <button
            type="button"
            onClick={onBackToDashboard}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-semibold text-slate-200 transition"
          >
            ← В Мониторинг
          </button>
        )}
      </div>

      {/* Settings Modal */}
      <PriceTagSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentConfig={config}
        onSaveConfig={handleSaveConfig}
      />

    </div>
  );
}
