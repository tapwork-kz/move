import React, { useMemo } from 'react';
import { generateQRCodeSVG } from '../utils/qrcode';
import { formatPrice, calculateInstallment } from '../utils/specsParser';

// Spec Icon definitions matching the digital price tag aesthetic
const SpecIcon = ({ name }) => {
  const iconMap = {
    cpu: (
      // CPU Microchip Icon
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <rect x="9" y="9" width="6" height="6" />
        <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3" />
      </svg>
    ),
    screen: (
      // Display / Screen Icon
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
    ram: (
      // RAM / Memory Modules Icon
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 19v-3M10 19v-3M14 19v-3M18 19v-3M2 6h20v10H2z" />
      </svg>
    ),
    ssd: (
      // Storage SSD / Hard Drive Icon
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M7 8h10M7 12h10M7 16h4" />
        <circle cx="17" cy="16" r="1" fill="currentColor" />
      </svg>
    ),
    gpu: (
      // GPU / Graphics Card Icon
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <circle cx="8" cy="12" r="2.5" />
        <circle cx="16" cy="12" r="2.5" />
        <path d="M6 6V4M18 6V4" />
      </svg>
    ),
    os: (
      // Windows / OS Grid Icon
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="8" height="8" rx="1" />
        <rect x="13" y="3" width="8" height="8" rx="1" />
        <rect x="3" y="13" width="8" height="8" rx="1" />
        <rect x="13" y="13" width="8" height="8" rx="1" />
      </svg>
    ),
    camera: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
        <circle cx="12" cy="13" r="4" />
      </svg>
    ),
    battery: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="6" width="18" height="12" rx="2" />
        <path d="M23 11v2" />
      </svg>
    ),
    sound: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14" />
      </svg>
    ),
    wifi: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01" />
      </svg>
    )
  };

  return iconMap[name] || iconMap.cpu;
};

export default function PriceTagCard({
  productData,
  price,
  basePrice,
  activeGift,
  sku,
  qrUrl = 'https://mechta.kz',
  brandName = 'МЕЧТА',
  isUpdatedPulse = false,
  showPromoShield = true,
  promoShieldText = 'АРТЫҚ ТӨЛЕМСІЗ БӨЛІП ТӨЛЕУ 0-0-24'
}) {
  const currentPromoPrice = price || productData?.price || '529990';
  const currentBasePrice = basePrice || productData?.basePrice || '';
  const currentGift = activeGift || productData?.activeGift || '';

  const displayPrice = formatPrice(currentPromoPrice);
  const displayBasePrice = currentBasePrice ? formatPrice(currentBasePrice) : null;
  const isPromoDiscount = displayBasePrice && displayBasePrice !== displayPrice;

  // Calculate savings if base price is known
  const discountSavings = useMemo(() => {
    if (!currentBasePrice || !currentPromoPrice) return null;
    const b = Number(String(currentBasePrice).replace(/[₸тг\s]/gi, ''));
    const p = Number(String(currentPromoPrice).replace(/[₸тг\s]/gi, ''));
    if (!isNaN(b) && !isNaN(p) && b > p) {
      const diff = b - p;
      return `-${diff.toLocaleString('ru-RU')} ₸`;
    }
    return null;
  }, [currentBasePrice, currentPromoPrice]);

  const displaySku = sku || productData?.sku || '37230025006';
  const displayTitle = productData?.title || 'Ноутбук ASUS ExpertBook B5 Flip B5402FVA-HY0043X 14 FHD Core i5 1340P 1.9 GHz';
  const specs = productData?.specs || [];

  // 12 and 24 month calculated installment payments
  const installment24 = useMemo(() => calculateInstallment(currentPromoPrice, 24), [currentPromoPrice]);
  const installment12 = useMemo(() => calculateInstallment(currentPromoPrice, 12), [currentPromoPrice]);

  const qrSvg = useMemo(() => {
    const targetUrl = qrUrl || (displaySku ? `https://mechta.kz/search/?q=${encodeURIComponent(displaySku)}` : 'https://mechta.kz');
    return generateQRCodeSVG(targetUrl, 90);
  }, [qrUrl, displaySku]);

  return (
    <div className="relative flex items-center justify-center select-none font-sans drop-shadow-2xl">
      
      {/* 
        PROMO SHIELD & INSTALLMENT BLOCK (Positioned to the left without blocking card content) 
      */}
      {showPromoShield && (
        <div className="absolute -left-28 sm:-left-36 md:-left-44 top-10 sm:top-14 z-10 w-32 sm:w-40 md:w-44 -rotate-3 hover:rotate-0 transition-transform duration-300 pointer-events-auto">
          
          <div className="relative bg-gradient-to-br from-[#d80064] via-[#c00057] to-[#800033] text-white rounded-2xl p-3 shadow-2xl border-2 border-white/90 overflow-hidden flex flex-col items-center text-center">
            
            {/* Glossy highlight */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/25 via-transparent to-black/20 pointer-events-none" />

            {/* Shield Title from photo */}
            <div className="text-[10px] sm:text-xs font-black uppercase tracking-wider leading-tight text-white drop-shadow">
              АРТЫҚ<br />БАҒАМЕН<br /><span className="text-yellow-300">КЕПІЛДІК</span>
            </div>

            {/* Installment Badge */}
            <div className="my-1.5 bg-yellow-400 text-rose-950 px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-black tracking-wider uppercase shadow-xs">
              0 • 0 • 24
            </div>

            {/* Realtime Calculated Monthly Payments (12 & 24 mo) */}
            <div className="w-full bg-black/35 backdrop-blur-xs rounded-xl p-2 mt-1 space-y-1 text-left border border-white/10">
              <div className="flex items-center justify-between text-[9px] sm:text-[10px]">
                <span className="text-white/80 font-medium">24 мес:</span>
                <strong className="text-yellow-300 font-black">{installment24}/мес</strong>
              </div>
              <div className="flex items-center justify-between text-[9px] sm:text-[10px] border-t border-white/10 pt-1">
                <span className="text-white/80 font-medium">12 мес:</span>
                <strong className="text-white font-black">{installment12}/мес</strong>
              </div>
            </div>

            <div className="mt-1.5 text-[8px] text-white/90 font-bold uppercase tracking-tight">
              0% переплаты
            </div>
          </div>
        </div>
      )}

      {/* Main Digital Price Tag Container */}
      <div 
        className={`w-[305px] sm:w-[335px] md:w-[355px] bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-200/90 transition-all duration-500 transform relative z-20 ${
          isUpdatedPulse ? 'ring-4 ring-emerald-400 scale-[1.02] shadow-emerald-500/30' : ''
        }`}
      >
        
        {/* Top Header with Authentic Mechta Logo & Product Title */}
        <div className="bg-gradient-to-r from-[#800033] via-[#a8004e] to-[#800033] text-white p-3.5 sm:p-4 text-center relative overflow-hidden">
          
          {/* Subtle glossy overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/15 to-transparent pointer-events-none" />

          {/* Authentic Mechta Logo */}
          <div className="flex items-center justify-center gap-1.5 mb-2">
            <img 
              src="/logo_mechta.png" 
              alt="Mechta.kz" 
              className="h-6 sm:h-7 object-contain brightness-0 invert filter drop-shadow-sm" 
            />
          </div>

          {/* Full Product Title */}
          <h2 className="text-xs sm:text-[12.5px] font-bold leading-snug tracking-tight text-white/95 line-clamp-3">
            {displayTitle}
          </h2>
        </div>

        {/* Specs List with round pinkish icon badges */}
        <div className="p-3.5 sm:p-4 bg-white divide-y divide-slate-100 space-y-2 sm:space-y-2.5">
          {specs.map((item, index) => (
            <div key={item.id || index} className="flex items-center gap-3 pt-1.5 first:pt-0">
              
              {/* Circular Icon Badge */}
              <div className="w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-full bg-[#fae8f0] text-[#991b52] border border-[#f3cadc] flex items-center justify-center shrink-0 shadow-xs">
                <SpecIcon name={item.icon || 'cpu'} />
              </div>

              {/* Spec Text */}
              <div className="min-w-0 flex-1">
                <p className="text-[11px] sm:text-xs font-semibold text-slate-800 leading-tight break-words">
                  {item.value}
                </p>
                {item.label && item.label !== item.value && (
                  <span className="text-[9px] text-slate-400 block font-normal mt-0.5">
                    {item.label}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Dedicated Gift / Bonus Window if active */}
        {currentGift && (
          <div className="px-3.5 pb-2">
            <div className="bg-gradient-to-r from-purple-700 via-pink-700 to-rose-700 text-white p-2 sm:p-2.5 rounded-xl shadow-md flex items-center gap-2 border border-purple-300/40 animate-fade-in">
              <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center text-sm shrink-0 shadow-inner">
                🎁
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-yellow-300">
                  Подарок к покупке:
                </div>
                <div className="text-[11px] sm:text-xs font-bold truncate text-white leading-tight">
                  {currentGift}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Section: QR Code, Price (Base / Crossed-out / Special Promo), SKU */}
        <div className="bg-slate-50/95 border-t border-slate-200 p-3.5 sm:p-4 flex items-center justify-between gap-3">
          
          {/* QR Code */}
          <div className="w-16 h-16 sm:w-18 sm:h-18 p-1 bg-white rounded-xl shadow-xs border border-slate-200 shrink-0 flex items-center justify-center">
            <div 
              className="w-full h-full"
              dangerouslySetInnerHTML={{ __html: qrSvg }} 
            />
          </div>

          {/* Price & SKU */}
          <div className="flex-1 text-right min-w-0">
            
            {/* If promo is active, show crossed out Base Price */}
            {isPromoDiscount && (
              <div className="flex items-center justify-end gap-1.5 mb-0.5">
                <span className="line-through text-slate-400 font-bold text-xs sm:text-sm">
                  {displayBasePrice}
                </span>
                {discountSavings && (
                  <span className="bg-red-500 text-white text-[8px] sm:text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase tracking-tight">
                    {discountSavings}
                  </span>
                )}
              </div>
            )}

            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              {isPromoDiscount ? 'Специальная цена' : 'Цена'}
            </span>

            <div className={`text-xl sm:text-2xl font-black tracking-tight leading-none transition-colors duration-300 ${
              isPromoDiscount ? 'text-rose-600' : 'text-slate-950'
            } ${isUpdatedPulse ? 'text-emerald-600 animate-pulse' : ''}`}>
              {displayPrice}
            </div>

            <div className="text-[10px] sm:text-[11px] text-slate-500 font-bold mt-1 tracking-tight truncate">
              Артикул: <span className="text-slate-800">{displaySku}</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
