import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

// === КОМПАКТНЫЕ MATERIAL DESIGN SVG ИКОНКИ ===
const IconLogin = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9a2 2 0 012-2m6 0V5a2 2 0 00-2-2H9a2 2 0 00-2 2v2m6 0h-6M12 11v4m-2-2h4"/></svg>;
const IconNew = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/></svg>;
const IconProcessed = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>;
const IconCompleted = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>;
const IconArchive = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/></svg>;
const IconSearch = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>;
const IconCalendar = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>;
const IconAdmin = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.952 11.952 0 01-7.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>;
const IconClose = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>;
const IconStock = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>;
const IconAll = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>;
const IconFile = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>;
const IconGift = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V6a2 2 0 10-2 2h2zm0 0H4v13a2 2 0 002 2h14a2 2 0 002-2V8h-8z"/></svg>;
const IconCopy = () => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>;
const IconCheck = () => <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>;

const tabOrder = ['new', 'completed', 'gifts', 'archive', 'statement'];

export default function App() {
  const [user, setUser] = useState(null);
  const [authForm, setAuthForm] = useState({ iin: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [selectedBranch, setSelectedBranch] = useState('rozybakieva');
  const [currentTab, setCurrentTab] = useState('new');
  const [selectedDept, setSelectedDept] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('');

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tabCounts, setTabCounts] = useState({ new: 0, completed: 0, gifts: 0, archive: 0 });

  const [selectedDoc, setSelectedDoc] = useState(null);
  const [docItems, setDocItems] = useState([]);
  const [modalTab, setModalTab] = useState('in_stock');
  const [itemSearch, setItemSearch] = useState('');
  const [confirmModal, setConfirmModal] = useState({ show: false, type: '', docId: null });

  const [statementQuery, setStatementQuery] = useState('');
  const [statementItems, setStatementItems] = useState([]);
  const [statementLoading, setStatementLoading] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);
  const [priceHistory, setPriceHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [activeDocId, setActiveDocId] = useState(null);
  const [selectedDocIds, setSelectedDocIds] = useState([]);
  const [activeItemName, setActiveItemName] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const [promoSubTab, setPromoSubTab] = useState('new'); 
  const [giftsSubTab, setGiftsSubTab] = useState('new'); 
  const [touchStart, setTouchStart] = useState(null);
  
  const departments = ["#Цифра 🟠", "#ЧТ 🟢", "#МБТ 🟡", "#КБТ 🔵", "#Другое"];
  
  const branches = [
    { id: 'rozybakieva', name: 'Алматы, Розыбакиева 275а' },
    { id: 'mart_village', name: 'Алматы, Mart Village' }
  ];

  const getActiveBranch = () => {
    if (user?.branch && user.branch !== 'ALL') {
      return user.branch;
    }
    return selectedBranch || 'rozybakieva';
  };

  // Проверка типа документа для цветового выделения
  const isDocLaunch = (doc) => {
    const text = `${doc?.file_name || ''} ${doc?.promo_number || ''}`.toLowerCase();
    return text.includes('запуск');
  };

  const isDocRevaluation = (doc) => {
    const text = `${doc?.file_name || ''} ${doc?.promo_number || ''}`.toLowerCase();
    return doc?.doc_type === 'revaluation' || text.includes('переоценк');
  };

  const isDocCorrection = (doc) => {
    const text = `${doc?.file_name || ''} ${doc?.promo_number || ''}`.toLowerCase();
    return text.includes('корректировк') || text.includes('корр.') || text.includes('корр ') || text.includes('коррекция');
  };

  // Определение цвета обводки бейджа номера
  const getBadgeColorClass = (doc) => {
    if (isDocLaunch(doc)) {
      return 'bg-blue-50 text-blue-700 border-blue-400 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-500';
    }
    if (isDocRevaluation(doc)) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-400 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-500';
    }
    return 'bg-amber-50 text-amber-700 border-amber-400 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-500';
  };

  // Интеллектуальное извлечение чистого номера акции
  const getPromoNumber = (doc) => {
    let raw = String(doc?.promo_number || '').trim();

    raw = raw
      .replace(/запуск\s*[-_:]?\s*/gi, '')
      .replace(/акция\s*[-_:]?\s*/gi, '')
      .replace(/промо\s*[-_:]?\s*/gi, '')
      .trim();

    if (raw && raw !== 'null' && raw !== 'undefined' && raw !== '') {
      const matchNum = raw.match(/[A-Za-z0-9\-\/]+/);
      if (matchNum) {
        return `№${matchNum[0].replace(/^№+/, '')}`;
      }
    }

    const fileName = String(doc?.file_name || '');
    const cleanedFileName = fileName.replace(/запуск\s*[-_:]?\s*/gi, '');

    const matchNo = cleanedFileName.match(/(?:№|#|промо\s*№?|акция\s*№?)\s*([A-Za-z0-9\-\/]+)/i);
    if (matchNo && matchNo[1]) return `№${matchNo[1]}`;

    const matchDigits = cleanedFileName.match(/^(\d{3,8})\b/);
    if (matchDigits && matchDigits[1]) return `№${matchDigits[1]}`;

    const matchBracket = cleanedFileName.match(/\[([A-Za-z0-9\-\/]+)\]/);
    if (matchBracket && matchBracket[1]) return `№${matchBracket[1]}`;

    return 'АКЦИЯ';
  };

  // Проверка валидности цены (исключаем подарки, нули и пустые строки)
  const isValidPrice = (price) => {
    if (!price) return false;
    const s = String(price).toLowerCase().trim();
    if (s === '' || s === '—' || s === '-' || s === 'null' || s === 'undefined' || s === '0' || s === '0 ₸' || s === '0₸') {
      return false;
    }
    if (s.includes('подарок') || s.includes('бонус') || s.includes('скидка') || s.includes('комплект')) {
      return false;
    }
    const cleanNum = s.replace(/[₸\s]/g, '');
    if (!isNaN(cleanNum) && Number(cleanNum) <= 0) {
      return false;
    }
    return true;
  };

  // Безопасная проверка соответствия отдела пользователя
  const matchesUserDept = (docDept, currentUser, filterDept) => {
    const docD = String(docDept || '').toLowerCase();
    
    if (filterDept) {
      const cleanFilter = String(filterDept).replace(/[#🟠🟢🟡🔵\s]/g, '').trim().toLowerCase();
      return cleanFilter ? docD.includes(cleanFilter) : true;
    }
    
    if (!currentUser) return true;
    const hasAllAccess = currentUser.role === 'Директор' || 
                         currentUser.role === 'Супервайзер' || 
                         currentUser.role === 'Инфо-консультант' || 
                         currentUser.dept === 'ALL' || 
                         (Array.isArray(currentUser.dept) && currentUser.dept.includes('ALL'));

    if (hasAllAccess) return true;

    const userDepts = Array.isArray(currentUser.dept) ? currentUser.dept : (currentUser.dept ? [currentUser.dept] : []);
    if (userDepts.length === 0) return true;

    return userDepts.some(d => {
      const clean = String(d).replace(/[#🟠🟢🟡🔵\s]/g, '').trim().toLowerCase();
      return clean && docD.includes(clean);
    }) || docD.includes('другое');
  };

  const copyToClipboard = (e, text, id) => {
    e.stopPropagation();
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    }).catch(err => console.error("Ошибка копирования:", err));
  };

  useEffect(() => {
    if (selectedDoc) {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    } else {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    }
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, [selectedDoc]);

  // Загрузка ведомости остатков: строго по последнему документу с РЕАЛЬНОЙ ценой (без подарков и 0)
  useEffect(() => {
    if (currentTab !== 'statement') return;
    const trimmed = statementQuery.trim();
    if (!trimmed) {
      setStatementItems([]);
      return;
    }
    
    const delayDebounce = setTimeout(async () => {
      setStatementLoading(true);
      try {
        const activeBranch = getActiveBranch();

        const { data: invData, error: invError } = await supabase
          .from('inventory')
          .select('id, raw_name, normalized_name, stock_warehouse, stock_showcase')
          .ilike('raw_name', `%${trimmed}%`)
          .eq('branch', activeBranch)
          .limit(80);

        if (invError) throw invError;

        if (invData && invData.length > 0) {
          const normNames = invData.map(i => i.normalized_name).filter(Boolean);
          const rawNames = invData.map(i => i.raw_name).filter(Boolean);

          let priceMap = {};
          if (normNames.length > 0 || rawNames.length > 0) {
            // Подтягиваем элементы документов вместе с документом, чтобы отфильтровать doc_type !== 'gift'
            let q = supabase
              .from('document_items')
              .select(`
                normalized_name, 
                raw_name, 
                price, 
                created_at,
                documents!inner(doc_type)
              `)
              .neq('documents.doc_type', 'gift')
              .neq('documents.doc_type', 'media')
              .order('created_at', { ascending: false });

            if (normNames.length > 0) {
              q = q.in('normalized_name', normNames);
            }

            const { data: priceDocs } = await q;

            if (priceDocs) {
              priceDocs.forEach(p => {
                const normKey = p.normalized_name?.trim().toLowerCase();
                const rawKey = p.raw_name?.trim().toLowerCase();

                if (isValidPrice(p.price)) {
                  if (normKey && !priceMap[normKey]) {
                    priceMap[normKey] = p.price;
                  }
                  if (rawKey && !priceMap[rawKey]) {
                    priceMap[rawKey] = p.price;
                  }
                }
              });
            }
          }

          const merged = invData.map(item => {
            const normKey = item.normalized_name?.trim().toLowerCase();
            const rawKey = item.raw_name?.trim().toLowerCase();
            const foundPrice = (normKey && priceMap[normKey]) || (rawKey && priceMap[rawKey]) || '—';

            return {
              ...item,
              latest_price: foundPrice
            };
          });

          setStatementItems(merged);
        } else {
          setStatementItems([]);
        }
      } catch (err) {
        console.error("Ошибка поиска по ведомости:", err.message);
        setStatementItems([]);
      } finally {
        setStatementLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [statementQuery, currentTab, user, selectedBranch]);

  const openPriceHistory = async (item) => {
    setActiveItemName(item.raw_name);
    setSelectedHistoryItem(item);
    setPriceHistory([]);
    setHistoryLoading(true);
    try {
      const activeBranch = getActiveBranch();
      const { data, error } = await supabase
        .from('document_items')
        .select(`
          price, 
          created_at, 
          documents:document_id(
            *,
            document_branch_statuses!inner(
              status,
              processed_at,
              completed_at,
              processed_by:users!processed_by_iin(full_name),
              completed_by:users!completed_by_iin(full_name)
            ),
            document_items(price, is_in_stock, change_type, raw_name)
          )
        `)
        .eq('normalized_name', item.normalized_name)
        .eq('documents.document_branch_statuses.branch', activeBranch)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setPriceHistory(data || []);
    } catch (err) {
      console.error("Ошибка загрузки истории цен:", err.message);
    } finally {
      setHistoryLoading(false);
    }
  };

  const VAPID_PUBLIC_KEY = "BFWtU5jMprIvBQq2cAW4ZsDr7-3zGEfhyhR0efaGInmFHx5mUtaxD0OVdqBL06CDco3MdtKPmeIegsTHo1kUxco";

  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  const initPushNotifications = async (currentUser) => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return;
      
      const registration = await navigator.serviceWorker.register('sw.js');
      let subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
      }
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });
      const { error } = await supabase
        .from('users')
        .update({ push_sub: subscription.toJSON() }) 
        .eq('iin', currentUser.iin);

      if (error) throw error;
    } catch (err) {
      console.error('Ошибка при настройке веб-пушей:', err.message);
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('promo_app_user');
    if (savedUser && savedUser !== 'null' && savedUser !== 'undefined') {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed && parsed.iin) { 
          setUser(parsed);
          setSelectedDept(parsed.role === 'Директор' || parsed.role === 'Супервайзер' || parsed.role === 'Инфо-консультант' ? '' : parsed.dept);
          setSelectedBranch(parsed.branch === 'ALL' ? 'rozybakieva' : (parsed.branch || 'rozybakieva'));
          return;
        }
      } catch (e) {
        console.error("Ошибка парсинга сессии:", e);
      }
    }
    localStorage.removeItem('promo_app_user');
    setUser(null);
  }, []);

  useEffect(() => {
    if (!user) return;
    initPushNotifications(user);
    setDocuments([]); 
    setSelectedDocIds([]);
    fetchDocuments();
    updateTabCounters();

    const handleWindowFocus = () => {
      fetchDocuments();
      updateTabCounters();
    };
    window.addEventListener('focus', handleWindowFocus);
    return () => window.removeEventListener('focus', handleWindowFocus);
  }, [currentTab, selectedDept, searchQuery, dateFilter, monthFilter, promoSubTab, giftsSubTab, user, selectedBranch]);

  // Радикально переработанный точный пересчет всех документов в бейджах
  const updateTabCounters = async () => {
    if (!user) return;
    try {
      const activeBranch = getActiveBranch();

      // 1. Загружаем ВСЕ активные документы без отсекающего !inner (до 5000 шт.)
      const { data: docsData, error } = await supabase
        .from('documents')
        .select(`
          id, dept, doc_type, file_name, period_end, promo_number, created_at,
          document_branch_statuses(status, branch), 
          document_items(raw_name, normalized_name, is_in_stock)
        `)
        .order('created_at', { ascending: false })
        .limit(5000);

      if (error || !docsData) {
        console.error("Ошибка загрузки документов для счетчиков:", error);
        return;
      }

      // 2. Мягкая фильтрация по отделу пользователя
      const visibleDocs = docsData.filter(doc => matchesUserDept(doc.dept, user, selectedDept));

      // 3. Собираем точные имена товаров из видимых документов
      const targetNormNames = [];
      const targetRawNames = [];

      visibleDocs.forEach(doc => {
        if (doc.document_items && Array.isArray(doc.document_items)) {
          doc.document_items.forEach(item => {
            if (item.normalized_name) targetNormNames.push(item.normalized_name);
            if (item.raw_name) targetRawNames.push(item.raw_name);
          });
        }
      });

      // 4. Точечная подгрузка остатков именно для товаров из документов (обходит лимит 1000 строк)
      let branchStockMap = {};

      if (targetNormNames.length > 0 || targetRawNames.length > 0) {
        let invQuery = supabase
          .from('inventory')
          .select('raw_name, normalized_name, stock_warehouse, stock_showcase')
          .eq('branch', activeBranch)
          .limit(10000);

        if (targetNormNames.length > 0) {
          invQuery = invQuery.in('normalized_name', targetNormNames.slice(0, 1500));
        }

        const { data: invData } = await invQuery;

        if (invData) {
          invData.forEach(inv => {
            const normKey = inv.normalized_name?.trim().toLowerCase();
            const rawKey = inv.raw_name?.trim().toLowerCase();
            const totalStock = (inv.stock_warehouse || 0) + (inv.stock_showcase || 0);

            if (totalStock > 0) {
              if (normKey) branchStockMap[normKey] = true;
              if (rawKey) branchStockMap[rawKey] = true;
            }
          });
        }
      }

      // 5. Проверка наличия: хотя бы 1 позиция есть на складе/витрине или помечена в документе
      const checkDocStockInBranch = (doc) => {
        if (!doc.document_items || doc.document_items.length === 0) return true;
        return doc.document_items.some(item => {
          const normKey = item.normalized_name?.trim().toLowerCase();
          const rawKey = item.raw_name?.trim().toLowerCase();
          return (normKey && branchStockMap[normKey] === true) || 
                 (rawKey && branchStockMap[rawKey] === true) || 
                 item.is_in_stock === true;
        });
      };

      const todayStr = new Date().toISOString().split('T')[0];
      const counts = { new: 0, completed: 0, gifts: 0, archive: 0 };

      // 6. Подсчёт по каждой вкладке
      visibleDocs.forEach(doc => {
        // Извлекаем статус строго для текущего филиала (если строки нет — считаем 'new')
        let branchStatus = 'new';
        if (doc.document_branch_statuses) {
          if (Array.isArray(doc.document_branch_statuses)) {
            const match = doc.document_branch_statuses.find(s => s.branch === activeBranch);
            if (match && match.status) branchStatus = match.status;
          } else if (doc.document_branch_statuses.branch === activeBranch) {
            branchStatus = doc.document_branch_statuses.status || 'new';
          }
        }

        const inStock = checkDocStockInBranch(doc);
        const isMedia = doc.doc_type === 'media';
        const isGift = doc.doc_type === 'gift';
        const isCorrection = isDocCorrection(doc);

        let computedStatus = branchStatus;
        if (doc.period_end && doc.period_end < todayStr && !isCorrection) {
          if (branchStatus === 'new' && !inStock) computedStatus = 'archive';
          else if (branchStatus === 'processed') computedStatus = 'completed';
        }

        if (isGift || isMedia) {
          // Вкладка «Подарки» (требующие оформления)
          if (branchStatus === 'new' && (isMedia || inStock)) {
            counts.gifts++;
          } else if (computedStatus === 'completed') {
            counts.completed++;
          } else if (computedStatus === 'archive' || (doc.period_end && doc.period_end < todayStr && !inStock && !isMedia)) {
            counts.archive++;
          }
        } else {
          // Вкладка «Акции» (Новые, требующие оформления — только те, что в наличии)
          if (computedStatus === 'new' && inStock) {
            counts.new++;
          } else if (computedStatus === 'completed') {
            counts.completed++;
          } else if (computedStatus === 'archive' || (doc.period_end && doc.period_end < todayStr && !inStock)) {
            counts.archive++;
          }
        }
      });

      setTabCounts(counts);
    } catch (err) { 
      console.error("Ошибка радикального пересчета счетчиков:", err); 
    }
  };

  const handleTouchStart = (e) => {
    if (selectedDoc) return;
    setTouchStart(e.targetTouches[0].clientX);
  };
  
  const handleTouchEnd = (e) => {
    if (selectedDoc || !touchStart) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    const currentIdx = tabOrder.indexOf(currentTab);

    if (diff > 70 && currentIdx < tabOrder.length - 1) {
      setCurrentTab(tabOrder[currentIdx + 1]);
      setPromoSubTab('new');
      setGiftsSubTab('new');
    } else if (diff < -70 && currentIdx > 0) {
      setCurrentTab(tabOrder[currentIdx - 1]);
      setPromoSubTab('new');
      setGiftsSubTab('new');
    }
    setTouchStart(null);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      const { data, error } = await supabase.from('users').select('*').eq('iin', authForm.iin).eq('password', authForm.password).maybeSingle();
      if (error) throw error;
      if (!data) { setAuthError('Неверный ИИН или пароль.'); return; }
      if (data.login_status !== true) { setAuthError('Вход запрещен.'); return; }
      setUser(data);
      setSelectedDept(data.role === 'Директор' || data.role === 'Супервайзер' || data.role === 'Инфо-консультант' ? '' : data.dept);
      setSelectedBranch(data.branch === 'ALL' ? 'rozybakieva' : (data.branch || 'rozybakieva'));
      localStorage.setItem('promo_app_user', JSON.stringify(data));
    } catch (err) { setAuthError('Ошибка: ' + err.message); } finally { setAuthLoading(false); }
  };

  const fetchDocuments = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const activeBranch = getActiveBranch();

      let query = supabase.from('documents').select(`
        *,
        document_branch_statuses!inner(
          status,
          processed_at,
          completed_at,
          processed_by:users!processed_by_iin(full_name),
          completed_by:users!completed_by_iin(full_name)
        ),
        document_items(price, is_in_stock, change_type, raw_name, normalized_name)
      `).eq('document_branch_statuses.branch', activeBranch);

      if (searchQuery) {
        query = query.or(`promo_number.ilike.%${searchQuery}%,file_name.ilike.%${searchQuery}%`);
      }

      if (!searchQuery) {
        if (dateFilter) {
          query = query.gte('created_at', `${dateFilter}T00:00:00`).lte('created_at', `${dateFilter}T23:59:59`);
        } else {
          const needsMonthDefault = currentTab === 'archive' || 
            (currentTab === 'new' && promoSubTab === 'processed') || 
            (currentTab === 'gifts' && giftsSubTab === 'processed');

          const activeMonth = monthFilter || (needsMonthDefault ? new Date().toISOString().slice(0, 7) : '');

          if (activeMonth) {
            const [year, month] = activeMonth.split('-').map(Number);
            const lastDay = new Date(year, month, 0).getDate();
            query = query.gte('created_at', `${activeMonth}-01T00:00:00`).lte('created_at', `${activeMonth}-${lastDay}T23:59:59`);
          }
        }
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;

      const deptFilteredDocs = (data || []).filter(doc => matchesUserDept(doc.dept, user, selectedDept));

      let branchStockMap = {};
      const { data: invData } = await supabase
        .from('inventory')
        .select('raw_name, normalized_name, stock_warehouse, stock_showcase')
        .eq('branch', activeBranch);

      if (invData) {
        invData.forEach(inv => {
          const normKey = inv.normalized_name?.trim().toLowerCase();
          const rawKey = inv.raw_name?.trim().toLowerCase();
          const totalStock = (inv.stock_warehouse || 0) + (inv.stock_showcase || 0);

          if (totalStock > 0) {
            if (normKey) branchStockMap[normKey] = true;
            if (rawKey) branchStockMap[rawKey] = true;
          }
        });
      }

      // Документ в наличии, если хотя бы 1 позиция есть на складе/витрине текущего филиала
      const checkDocStock = (doc) => {
        if (!doc.document_items || doc.document_items.length === 0) return true;
        return doc.document_items.some(item => {
          const normKey = item.normalized_name?.trim().toLowerCase();
          const rawKey = item.raw_name?.trim().toLowerCase();
          return (normKey && branchStockMap[normKey] === true) || 
                 (rawKey && branchStockMap[rawKey] === true) || 
                 item.is_in_stock === true;
        });
      };

      const todayStr = new Date().toISOString().split('T')[0];
      let mapped = deptFilteredDocs.map(doc => {
        const branchStatusObj = Array.isArray(doc.document_branch_statuses) 
          ? doc.document_branch_statuses[0] 
          : doc.document_branch_statuses;

        const currentBranchStatus = branchStatusObj?.status || 'new';
        const inStockInBranch = checkDocStock(doc);
        let s = currentBranchStatus;
        const isCorrection = isDocCorrection(doc);

        if (doc.period_end && doc.period_end < todayStr && !isCorrection) {
          if (currentBranchStatus === 'new' && !inStockInBranch) s = 'archive';
          else if (currentBranchStatus === 'processed') s = 'completed';
        }

        return { 
          ...doc, 
          hasStockInBranch: inStockInBranch,
          computedStatus: s,
          status: currentBranchStatus,
          processed_by: branchStatusObj?.processed_by,
          processed_at: branchStatusObj?.processed_at,
          completed_by: branchStatusObj?.completed_by,
          completed_at: branchStatusObj?.completed_at
        };
      });

      let finalDocs = [];
      if (currentTab === 'new') {
        if (promoSubTab === 'new') {
          // Только новые И если хотя бы 1 позиция в наличии
          finalDocs = mapped.filter(doc => doc.computedStatus === 'new' && doc.hasStockInBranch && doc.doc_type !== 'gift' && doc.doc_type !== 'media');
        } else {
          // Оформленные ИЛИ те, у которых нет остатков
          finalDocs = mapped.filter(doc => ((doc.computedStatus === 'processed') || (doc.computedStatus === 'new' && !doc.hasStockInBranch)) && doc.doc_type !== 'gift' && doc.doc_type !== 'media');
        }
      } else if (currentTab === 'gifts') {
        if (giftsSubTab === 'new') {
          finalDocs = mapped.filter(doc => (doc.doc_type === 'media' || (doc.doc_type === 'gift' && doc.hasStockInBranch)) && doc.status === 'new');
        } else {
          finalDocs = mapped.filter(doc => (doc.doc_type === 'media' || doc.doc_type === 'gift') && (doc.status === 'processed' || (doc.doc_type === 'gift' && !doc.hasStockInBranch && doc.status === 'new')));
        }
      } else if (currentTab === 'completed') {
        finalDocs = mapped.filter(doc => doc.computedStatus === 'completed');
      } else if (currentTab === 'archive') {
        finalDocs = mapped.filter(doc => 
          (doc.computedStatus === 'archive') || 
          (doc.period_end && doc.period_end < todayStr && !doc.hasStockInBranch && doc.doc_type !== 'media')
        );
      }

      setDocuments(finalDocs);
    } catch (err) { 
      console.error(err.message); 
    } finally { 
      setLoading(false); 
    }
  };

  // Детали документа: строгая привязка остатков (склад + витрина) к выбранному филиалу
  const openDocDetails = async (doc) => {
    setActiveDocId(doc.id);
    setSelectedDoc(doc);
    setModalTab('in_stock');
    setItemSearch('');
    try {
      const { data: itemsData, error: itemsError } = await supabase
        .from('document_items')
        .select('*')
        .eq('document_id', doc.id);
      if (itemsError) throw itemsError;

      if (itemsData && itemsData.length > 0) {
        const namesToFetch = itemsData.map(i => i.normalized_name).filter(Boolean);
        const targetBranch = getActiveBranch();

        let invMap = {};
        if (namesToFetch.length > 0) {
          const { data: invData, error: invError } = await supabase
            .from('inventory')
            .select('raw_name, normalized_name, stock_warehouse, stock_showcase')
            .in('normalized_name', namesToFetch)
            .eq('branch', targetBranch);

          if (!invError && invData) {
            invData.forEach(inv => {
              const normKey = inv.normalized_name?.trim().toLowerCase();
              const rawKey = inv.raw_name?.trim().toLowerCase();
              const wh = inv.stock_warehouse ?? 0;
              const sc = inv.stock_showcase ?? 0;

              if (normKey) {
                const curWh = invMap[normKey]?.wh ?? 0;
                const curSc = invMap[normKey]?.sc ?? 0;
                invMap[normKey] = { wh: curWh + wh, sc: curSc + sc };
              }
              if (rawKey) {
                const curWh = invMap[rawKey]?.wh ?? 0;
                const curSc = invMap[rawKey]?.sc ?? 0;
                invMap[rawKey] = { wh: curWh + wh, sc: curSc + sc };
              }
            });
          }
        }

        const enrichedItems = itemsData.map(item => {
          const normKey = item.normalized_name?.trim().toLowerCase();
          const rawKey = item.raw_name?.trim().toLowerCase();
          const stockInfo = (normKey && invMap[normKey]) || (rawKey && invMap[rawKey]) || null;
          const wh = stockInfo ? stockInfo.wh : 0;
          const sc = stockInfo ? stockInfo.sc : 0;
          const hasBranchStock = (wh + sc) > 0;

          return {
            ...item,
            stock_wh: wh,
            stock_sc: sc,
            is_in_stock: hasBranchStock
          };
        });

        setDocItems(enrichedItems);
        return;
      }
      setDocItems(itemsData || []);
    } catch (err) { 
      console.error("Ошибка подгрузки остатков:", err.message); 
    }
  };

  // Обработчик клика по карточке (обычный клик открывает документ, с Ctrl/Cmd - выделяет)
  const handleDocCardClick = (e, doc) => {
    const isMultiKey = e.ctrlKey || e.metaKey;

    if (isMultiKey) {
      e.preventDefault();
      setSelectedDocIds(prev => 
        prev.includes(doc.id) ? prev.filter(id => id !== doc.id) : [...prev, doc.id]
      );
    } else {
      if (selectedDocIds.length > 0) {
        setSelectedDocIds([]);
      }
      openDocDetails(doc);
    }
  };

  const toggleDocSelection = (e, docId) => {
    e.stopPropagation();
    setSelectedDocIds(prev => 
      prev.includes(docId) ? prev.filter(id => id !== docId) : [...prev, docId]
    );
  };

  // Массовое изменение статуса выбранных документов
  const executeBatchStatusChange = async () => {
    if (selectedDocIds.length === 0 || !user) return;
    const activeBranch = getActiveBranch();
    const isCompletedTab = currentTab === 'completed';
    const targetStatus = isCompletedTab ? 'archive' : 'processed';

    const updatePayload = {};
    if (targetStatus === 'processed') {
      updatePayload.status = 'processed';
      updatePayload.processed_by_iin = user.iin;
      updatePayload.processed_at = new Date().toISOString();
    } else {
      updatePayload.status = 'archive';
      updatePayload.completed_by_iin = user.iin;
      updatePayload.completed_at = new Date().toISOString();
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('document_branch_statuses')
        .update(updatePayload)
        .in('document_id', selectedDocIds)
        .eq('branch', activeBranch);

      if (error) throw error;

      setSelectedDocIds([]);
      await fetchDocuments();
      await updateTabCounters();
    } catch (err) {
      alert("Ошибка массового обновления: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const executeStatusChange = async () => {
    const { type, docId } = confirmModal;
    const activeBranch = getActiveBranch();
    const updatePayload = {};

    if (type === 'process') {
      updatePayload.status = 'processed';
      updatePayload.processed_by_iin = user.iin;
      updatePayload.processed_at = new Date().toISOString();
    } else if (type === 'archive') {
      updatePayload.status = 'archive';
      updatePayload.completed_by_iin = user.iin;
      updatePayload.completed_at = new Date().toISOString();
    }

    try {
      const { error } = await supabase
        .from('document_branch_statuses')
        .update(updatePayload)
        .eq('document_id', docId)
        .eq('branch', activeBranch);

      if (error) throw error;
      setConfirmModal({ show: false, type: '', docId: null });
      if (selectedDoc) setSelectedDoc(null);
      fetchDocuments();
      updateTabCounters();
    } catch (err) { 
      alert(err.message); 
    }
  };

  const renderUserDepts = (deptVal) => {
    if (!deptVal) return '—';
    if (Array.isArray(deptVal)) {
      if (deptVal.includes('ALL')) return 'Все отделы (ALL)';
      return deptVal.join(', ');
    }
    return deptVal === 'ALL' ? 'Все отделы (ALL)' : deptVal;
  };

  const formatCardDate = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return d.toLocaleString('ru-RU', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    }).replace(',', '');
  };

  const formatDisplayPrice = (price, docType) => {
    if (!price) return '—';
    if (docType === 'revaluation' || String(price).includes('₸')) {
      let clean = String(price).replace(/[₸\s]/g, '').trim();
      if (!isNaN(clean) && clean !== '') {
        return Number(clean).toLocaleString('ru-RU');
      }
      return String(price).replace('₸', '').trim();
    }
    return price;
  };

  const getRowStyle = (type) => {
    switch (type) {
      case 'green': return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-900';
      case 'red': return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900';
      case 'yellow': return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-400 dark:border-yellow-900';
      default: return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
  };

  const filteredItems = docItems.filter(item => {
    const matchesText = item.raw_name ? item.raw_name.toLowerCase().includes(itemSearch.toLowerCase()) : false;
    if (modalTab === 'in_stock') return matchesText && item.is_in_stock;
    return matchesText;
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 dark:bg-slate-950 flex items-center justify-center p-4 transition-all duration-500">
        <form onSubmit={handleLogin} className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl max-w-sm w-full border dark:border-slate-800 transition-all duration-500">
          <div className="flex flex-col items-center mb-5">
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-b from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20 dark:shadow-indigo-500/10 mb-3 transition-all duration-300">
              <div className="absolute inset-0 rounded-2xl bg-white/10 blur-xs opacity-50 pointer-events-none" />
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)] animate-fade-in">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Авторизация в систему мониторинга Промо</h2>
          </div>
          {authError && <div className="mb-3 p-2.5 bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 text-xs font-semibold rounded-xl border border-red-200 dark:border-red-900">{authError}</div>}
          <div className="space-y-3 mb-5">
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-400 tracking-wider mb-1">Логин</label>
              <input type="text" required placeholder="Введите ваш ИИН" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-base dark:text-white" value={authForm.iin} onChange={e => setAuthForm({ ...authForm, iin: e.target.value })} />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-400 tracking-wider mb-1">Пароль</label>
              <input type="password" required placeholder="••••••••" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-base dark:text-white" value={authForm.password} onChange={e => setAuthForm({ ...authForm, password: e.target.value })} />
            </div>
          </div>
          <button type="submit" disabled={authLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-bold transition text-sm">Войти</button>
        </form>
      </div>
    );
  }

  return (
    <div 
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="w-full max-w-full overflow-hidden h-[100dvh] max-h-[100dvh] bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col select-none"
    >
      <div className="w-full shrink-0 relative z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xs transition-colors duration-300">
        
        <header className="px-4 py-2.5 flex items-center justify-between gap-3 max-w-3xl mx-auto w-full flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-2 min-w-0">
            <div className="bg-blue-600 text-white w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs shrink-0">PM</div>
            <div className="min-w-0">
              <h1 className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-none truncate">Мониторинг Промо</h1>
              <div className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                <span className="truncate">{user?.full_name}</span>
                <span>•</span>
                <span className="truncate max-w-[120px] sm:max-w-[160px]">{renderUserDepts(user?.dept)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 flex-wrap shrink-0">
            {user?.branch === 'ALL' && (
              <div className="flex items-center gap-1 bg-blue-50 dark:bg-slate-800 border border-blue-200 dark:border-slate-700 px-2 py-1 rounded-lg text-[10px]">
                <select 
                  className="bg-transparent border-none font-bold text-blue-700 dark:text-blue-300 outline-none p-0 text-[10px] cursor-pointer" 
                  value={selectedBranch || 'rozybakieva'} 
                  onChange={e => setSelectedBranch(e.target.value)}
                >
                  {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
            )}

            {(user?.role === 'Директор' || user?.role === 'Супервайзер' || user?.role === 'Инфо-консультант') && (
              <div className="flex items-center gap-1 bg-amber-50 dark:bg-slate-800 border border-amber-200 dark:border-slate-700 px-2 py-1 rounded-lg text-[10px]">
                <IconAdmin />
                <select 
                  className="bg-transparent border-none font-bold text-slate-700 dark:text-slate-200 outline-none p-0 text-[10px] cursor-pointer" 
                  value={selectedDept} 
                  onChange={e => setSelectedDept(e.target.value)}
                >
                  <option value="">Все отделы</option>
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            )}
          </div>
        </header>

        <div className="px-4 pb-3 max-w-3xl mx-auto w-full space-y-2.5">
          
          <div className="grid grid-cols-5 bg-slate-200/70 dark:bg-slate-800/60 p-1 rounded-xl shadow-inner gap-0.5 border border-slate-300/10 transition-colors duration-500">
            {[
              { id: 'new', label: 'Акции', icon: <IconNew />, count: tabCounts.new },
              { id: 'completed', label: 'Завершенные', icon: <IconCompleted />, count: tabCounts.completed },
              { id: 'gifts', label: 'Подарки', icon: <IconGift />, count: tabCounts.gifts },
              { id: 'archive', label: 'Архив', icon: <IconArchive />, count: tabCounts.archive },
              { id: 'statement', label: 'Ведомость', icon: <IconStock />, count: 0 }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { setCurrentTab(tab.id); setDateFilter(''); setPromoSubTab('new'); setGiftsSubTab('new'); }}
                className={`relative flex flex-col items-center justify-center pt-2.5 pb-2 rounded-lg transition-[background-color,color] duration-200 ease-out ${currentTab === tab.id ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500 dark:text-slate-400'}`}
              >
                {tab.count > 0 && tab.id !== 'archive' && tab.id !== 'statement' && (
                  <span className="absolute top-0.5 right-0.5 bg-red-500 text-white text-[8px] font-black h-3.5 min-w-[14px] px-0.5 rounded-full flex items-center justify-center border border-white dark:border-slate-950 scale-90">
                    {tab.count}
                  </span>
                )}
                <div className="mb-0.5 scale-90">{tab.icon}</div>
                <span className="text-[9px] sm:text-xs font-medium tracking-tight truncate max-w-full px-0.5">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 w-full flex-wrap sm:flex-nowrap">
            <div className="relative flex-1 min-w-[150px]">
              <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-400"><IconSearch /></span>
              <input
                type="text"
                placeholder={currentTab === 'statement' ? "Поиск товара по ведомости..." : "Поиск документа..."}
                className="w-full pl-7 pr-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg outline-none text-xs font-medium dark:text-white shadow-2xs transition-colors duration-500"
                value={currentTab === 'statement' ? statementQuery : searchQuery}
                onChange={e => currentTab === 'statement' ? setStatementQuery(e.target.value) : setSearchQuery(e.target.value)}
              />
            </div>

            {currentTab === 'new' && (
              <button 
                onClick={() => { setPromoSubTab(promoSubTab === 'new' ? 'processed' : 'new'); setDateFilter(''); setMonthFilter(''); }} 
                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition shadow-2xs whitespace-nowrap ${promoSubTab === 'processed' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'}`}
              >
                {promoSubTab === 'processed' ? 'Оформленные' : 'Новые'}
              </button>
            )}

            {currentTab === 'gifts' && (
              <button 
                onClick={() => { setGiftsSubTab(giftsSubTab === 'new' ? 'processed' : 'new'); setDateFilter(''); setMonthFilter(''); }} 
                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition shadow-2xs whitespace-nowrap ${giftsSubTab === 'processed' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'}`}
              >
                {giftsSubTab === 'processed' ? 'Оформленные' : 'Новые'}
              </button>
            )}

            {currentTab !== 'statement' && (currentTab === 'archive' || (currentTab === 'new' && promoSubTab === 'processed') || (currentTab === 'gifts' && giftsSubTab === 'processed')) && (
              <div className="flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-8 h-8 rounded-lg shrink-0 relative shadow-2xs transition-colors duration-500">
                <span className={(monthFilter || !dateFilter) && !searchQuery ? 'text-blue-500' : 'text-slate-400'}><IconCalendar /></span>
                <span className="absolute bottom-0.5 right-1 text-[7px] font-black text-slate-400 dark:text-slate-500 pointer-events-none select-none">М</span>
                <input 
                  type="month" 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  value={monthFilter || new Date().toISOString().slice(0, 7)} 
                  onChange={e => { setMonthFilter(e.target.value); setDateFilter(''); }} 
                />
                {monthFilter && (
                  <button onClick={(e) => { e.stopPropagation(); setMonthFilter(''); }} className="absolute -top-1 -right-1 bg-slate-500 text-white rounded-full w-3.5 h-3.5 text-[8px] font-black flex items-center justify-center border border-white">✕</button>
                )}
              </div>
            )}

            {currentTab !== 'statement' && (
              <div className="flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-8 h-8 rounded-lg shrink-0 relative shadow-2xs transition-colors duration-500">
                <span className={dateFilter ? 'text-blue-500' : 'text-slate-400'}><IconCalendar /></span>
                <span className="absolute bottom-0.5 right-1 text-[7px] font-black text-slate-400 dark:text-slate-500 pointer-events-none select-none">Д</span>
                <input 
                  type="date" 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  value={dateFilter} 
                  onChange={e => { setDateFilter(e.target.value); setMonthFilter(''); }} 
                />
                {dateFilter && (
                  <button onClick={(e) => { e.stopPropagation(); setDateFilter(''); }} className="absolute -top-1 -right-1 bg-slate-500 text-white rounded-full w-3.5 h-3.5 text-[8px] font-black flex items-center justify-center border border-white">✕</button>
                )}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ================= ЛЕНТА КАРТОЧЕК ДОКУМЕНТОВ ================= */}
      <main 
        key={currentTab} 
        className="p-4 flex-1 overflow-y-auto overscroll-y-contain max-w-3xl mx-auto w-full animate-fade-in"
      >
        {currentTab === 'statement' ? (
          <div className="space-y-3 pb-4 pt-1.5">
            {statementLoading ? (
              <div className="text-center py-10 text-slate-400 font-medium text-xs tracking-wider animate-pulse">ПОИСК СОВПАДЕНИЙ...</div>
            ) : statementItems.length === 0 ? (
              <div className="text-center py-8 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-xl text-xs text-slate-400 font-medium">
                {statementQuery.trim() ? 'Ничего не найдено' : 'Введите наименование товара в верхнюю строку поиска для отображения остатков'}
              </div>
            ) : (
              <div className="w-full overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl shadow-2xs">
                <table className="w-full table-fixed border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800 border-b dark:border-slate-700 text-slate-500 dark:text-slate-400 uppercase text-[9px] font-bold">
                      <th className="p-2.5 text-left">Номенклатура</th>
                      <th className="p-1 text-center w-[48px]">Склад</th>
                      <th className="p-1 text-center w-[48px]">Витр.</th>
                      <th className="p-2.5 text-right w-[75px]">Цена</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {statementItems.map(item => (
                      <tr 
                        key={item.id} 
                        onClick={() => openPriceHistory(item)} 
                        className={`transition cursor-pointer ${
                          activeItemName === item.raw_name 
                            ? 'bg-amber-100/70 dark:bg-amber-950/40 font-medium' 
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/40 active:bg-slate-100'
                        }`}
                      >
                        <td className="p-2.5 text-left font-normal text-slate-700 dark:text-slate-300 break-words whitespace-normal align-middle">
                          <div className="flex items-center gap-1.5">
                            <span className="flex-1">{item.raw_name}</span>
                            <button
                              type="button"
                              title="Копировать название"
                              onClick={(e) => copyToClipboard(e, item.raw_name, `stmt_${item.id}`)}
                              className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0 transition"
                            >
                              {copiedId === `stmt_${item.id}` ? <IconCheck /> : <IconCopy />}
                            </button>
                          </div>
                        </td>
                        <td className="p-1 text-center font-bold text-blue-600 dark:text-blue-400 align-middle">{item.stock_warehouse}</td>
                        <td className="p-1 text-center font-bold text-amber-600 dark:text-amber-400 align-middle">{item.stock_showcase}</td>
                        <td className="p-2.5 text-right font-normal text-slate-900 dark:text-slate-100 align-middle">
                          {formatDisplayPrice(item.latest_price)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : loading ? (
          <div className="text-center py-10 text-slate-400 dark:text-slate-600 font-medium text-xs tracking-wider animate-pulse">ОБРАБОТКА ДАННЫХ...</div>
        ) : documents.length === 0 ? (
          <div className="text-center py-8 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-xl text-xs text-slate-400 font-medium transition-colors duration-300">Список пуст</div>
        ) : (
          <div className="space-y-1.5 pb-24">
            {documents.map(doc => {
              const isSelected = selectedDocIds.includes(doc.id);
              const displayPromoNumber = getPromoNumber(doc);

              return (
                <div
                  key={doc.id}
                  onClick={(e) => handleDocCardClick(e, doc)}
                  className={`p-2.5 rounded-lg border flex items-center justify-between gap-3 active:scale-[0.99] transition-all duration-150 ease-out shadow-2xs relative cursor-pointer ${
                    isSelected
                      ? 'bg-blue-100/80 dark:bg-blue-900/40 border-blue-500 ring-2 ring-blue-500/50 pl-2.5'
                      : activeDocId === doc.id 
                        ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-400 dark:border-blue-800 border-l-4 border-l-blue-500 pl-2' 
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-0.5 min-w-0 flex-1 pr-16">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {selectedDocIds.length > 0 && (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => toggleDocSelection(e, doc.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-0 cursor-pointer mr-0.5"
                        />
                      )}
                      
                      {/* БЕЙДЖ НОМЕРА С ТОЧНЫМ ЦВЕТОВЫМ РАЗДЕЛЕНИЕМ */}
                      <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border transition-colors duration-300 ${getBadgeColorClass(doc)}`}>
                        {displayPromoNumber}
                      </span>

                      {(doc.doc_type === 'gift' || doc.doc_type === 'media') && currentTab !== 'processed' && (
                        <span className="bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 text-[8px] font-black px-1 rounded border border-purple-200 dark:border-purple-900">
                          Подарок / Комплект
                        </span>
                      )}
                      <span className="text-[9px] text-slate-400 font-medium">{doc.dept}</span>
                    </div>
                    <h3 className="font-normal text-slate-700 dark:text-slate-200 text-xs sm:text-sm truncate transition-colors duration-300">{doc.file_name}</h3>
                    
                    <div className="flex flex-wrap gap-x-2 text-[9px] pt-0.5">
                      {!doc.hasStockInBranch && doc.computedStatus === 'new' && doc.doc_type !== 'media' ? (
                        <span className="text-amber-600 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/30 px-1 rounded transition-colors duration-300">Нет в наличии</span>
                      ) : (
                        <div className="text-slate-400 dark:text-slate-500 flex flex-wrap gap-x-2">
                          {doc.processed_by?.full_name && (
                            <span>Оформил: {doc.processed_by.full_name} {doc.processed_at && `— ${formatCardDate(doc.processed_at)}`}</span>
                          )}
                          {doc.completed_by?.full_name && (
                            <span>Закрыл: {doc.completed_by.full_name} {doc.completed_at && `— ${formatCardDate(doc.completed_at)}`}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="absolute top-2.5 right-2.5 text-[9px] text-slate-400 dark:text-slate-500 font-medium bg-transparent px-1 py-0.5">
                    <span>{formatCardDate(doc.created_at)}</span>
                  </div>
                </div>
              );
            })}
            <div className="text-center pt-5 pb-3 text-slate-300 dark:text-slate-800 text-[10px] font-medium tracking-widest select-none">
              • КОНЕЦ СПИСКА •
            </div>
          </div>
        )}
      </main>

      {/* ================= ФИКСИРОВАННАЯ ПЛАВАЮЩАЯ ПАНЕЛЬ МАССОВОГО ДЕЙСТВИЯ ================= */}
      {selectedDocIds.length > 0 && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 dark:bg-slate-800/95 text-white px-4 py-2.5 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-3 border border-slate-700/60 transition-all duration-200">
          <span className="text-xs font-semibold text-slate-200 whitespace-nowrap">
            Выбрано: <strong className="text-white font-black">{selectedDocIds.length}</strong>
          </span>
          
          <div className="h-4 w-px bg-slate-700" />

          <button
            type="button"
            onClick={executeBatchStatusChange}
            className={`px-3.5 py-1.5 text-white text-xs font-bold rounded-xl shadow-md transition active:scale-95 whitespace-nowrap ${
              currentTab === 'completed' 
                ? 'bg-green-600 hover:bg-green-500' 
                : 'bg-blue-600 hover:bg-blue-500'
            }`}
          >
            {currentTab === 'completed' 
              ? `Обновить ценники (${selectedDocIds.length})` 
              : `Оформить выделенные (${selectedDocIds.length})`}
          </button>

          <button
            type="button"
            onClick={() => setSelectedDocIds([])}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            title="Сбросить выделение"
          >
            <IconClose />
          </button>
        </div>
      )}

      {/* ================= МОДАЛЬНОЕ ОКНО СПЕЦИФИКАЦИИ ДОКУМЕНТА ================= */}
      {selectedDoc && (() => {
        const isMediaContent = selectedDoc.doc_type === 'media' || selectedDoc.file_name?.match(/\.(jpeg|jpg|gif|png|webp|pdf)$/i);
        
        const driveId = selectedDoc.file_url?.includes('file/d/') 
          ? selectedDoc.file_url.match(/file\/d\/([^/]+)/)?.[1] 
          : (selectedDoc.file_url?.includes('id=') ? selectedDoc.file_url.match(/id=([^&]+)/)?.[1] : null);
        
        const finalUrl = driveId 
          ? `https://drive.google.com/file/d/${driveId}/preview` 
          : selectedDoc.file_url;

        return (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 flex items-center justify-center p-3 pb-8 sm:p-4 transition-opacity duration-300 ease-out">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-7xl w-full h-[88vh] flex flex-col overflow-hidden border dark:border-slate-800 transition-[transform,opacity] duration-300 cubic-bezier(0.34,1.56,0.64,1) will-change-transform scale-100 animate-in fade-in zoom-in-95">
              
              <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between transition-colors duration-300">
                <div className="min-w-0 flex-1 pr-3">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${getBadgeColorClass(selectedDoc)}`}>
                    {getPromoNumber(selectedDoc)}
                  </span>
                  <h2 className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-0.5 truncate">{selectedDoc.file_name}</h2>
                </div>
                <button onClick={() => setSelectedDoc(null)} className="text-slate-400 hover:text-slate-600 p-1"><IconClose /></button>
              </div>

              {!isMediaContent && (
                <div className="p-1 bg-slate-50 dark:bg-slate-950/40 border-b dark:border-slate-800 shrink-0">
                  <div className="grid grid-cols-3 bg-slate-200/60 dark:bg-slate-800/60 p-0.5 rounded-lg text-slate-500 font-medium w-full">
                    <button onClick={() => setModalTab('in_stock')} className={`flex items-center justify-center gap-1 py-1 text-[10px] sm:text-xs rounded-md transition-all ${modalTab === 'in_stock' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs' : ''}`}>
                      <IconStock /> В наличии ({docItems.filter(i => i.is_in_stock).length})
                    </button>
                    <button onClick={() => setModalTab('all')} className={`flex items-center justify-center gap-1 py-1 text-[10px] sm:text-xs rounded-md transition-all ${modalTab === 'all' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs' : ''}`}>
                      <IconAll /> Все ({docItems.length})
                    </button>
                    <button onClick={() => setModalTab('source')} className={`flex items-center justify-center gap-1 py-1 text-[10px] sm:text-xs rounded-md transition-all ${modalTab === 'source' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs' : ''}`}>
                      <IconFile /> Документ
                    </button>
                  </div>
                </div>
              )}

              {modalTab !== 'source' && !isMediaContent && (
                <div className="p-1.5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
                  <input
                    type="text"
                    placeholder="Поиск товара по спецификации..."
                    className="w-full p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-xs font-medium dark:text-white"
                    value={itemSearch}
                    onChange={e => setItemSearch(e.target.value)}
                  />
                </div>
              )}

              <div className="flex-1 overflow-auto p-1.5 bg-slate-50 dark:bg-slate-950/20">
                {isMediaContent || modalTab === 'source' ? (() => {
                  const isWordDoc = selectedDoc?.file_name?.match(/\.docx$/i);
                  
                  if (isWordDoc) {
                    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 390;
                    const availableWidth = screenWidth - 36; 
                    const targetWidth = 950; 
                    const scaleFactor = Math.min(1, availableWidth / targetWidth); 
                    
                    return (
                      <div 
                        className="w-full h-full overflow-x-hidden overflow-y-auto rounded-lg bg-white border border-slate-200 dark:border-slate-800 p-0 m-0 relative min-h-[500px] cursor-pointer"
                        onClick={(e) => {
                          const container = e.currentTarget;
                          const frame = container.querySelector('iframe');
                          if (!frame) return;
                          
                          const isZoomed = frame.getAttribute('data-zoomed') === 'true';
                          if (!isZoomed) {
                            const zoomScale = 0.7;
                            frame.style.transform = `scale(${zoomScale})`;
                            frame.style.position = 'static';
                            frame.style.width = `${targetWidth}px`;
                            frame.style.height = '1800px'; 
                            container.style.overflowX = 'auto'; 
                            frame.setAttribute('data-zoomed', 'true');
                          } else {
                            frame.style.transform = `scale(${scaleFactor})`;
                            frame.style.position = 'absolute';
                            frame.style.width = `${targetWidth}px`;
                            frame.style.height = `${100 / scaleFactor}%`;
                            container.style.overflowX = 'hidden';
                            container.scrollLeft = 0; 
                            container.scrollTop = 0;  
                            frame.setAttribute('data-zoomed', 'false');
                          }
                        }}
                      >
                        <iframe 
                          src={finalUrl} 
                          title="Doc" 
                          className="border-none p-0 m-0 absolute top-0 left-0 transition-transform duration-200 ease-out pointer-events-none"
                          data-zoomed="false"
                          style={{
                            width: `${targetWidth}px`,
                            height: `${100 / scaleFactor}%`,
                            transform: `scale(${scaleFactor})`,
                            transformOrigin: 'top left'
                          }}
                        />
                      </div>
                    );
                  }
                  
                  return (
                    <div className="w-full h-full overflow-auto rounded-lg bg-white border border-slate-200 dark:border-slate-800 p-0 m-0" style={{ WebkitOverflowScrolling: 'touch' }}>
                      <iframe src={finalUrl} width="100%" height="100%" className="w-full h-full min-h-[500px] border-none p-0 m-0" title="Doc" />
                    </div>
                  );
                })() : filteredItems.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 text-xs font-bold uppercase">Ничего не найдено</div>
                ) : (
                  <div className="w-full overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-lg shadow-2xs">
                    <table className="w-full table-fixed border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-100 dark:bg-slate-800 border-b dark:border-slate-700 text-slate-500 dark:text-slate-400 uppercase text-[9px] font-bold">
                          <th className="p-2 w-[70px] shrink-0">Статус</th>
                          <th className="p-2 text-left">{selectedDoc?.header_col1 || 'Наименование'}</th>
                          <th className="p-2 text-right w-[85px] shrink-0">
                            {selectedDoc?.doc_type === 'revaluation' ? 'Переоценка' : (selectedDoc?.header_col2 || 'Промо')}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filteredItems.slice(0, 100).map(item => (
                          <tr 
                            key={item.id} 
                            onClick={() => openPriceHistory({ normalized_name: item.normalized_name, raw_name: item.raw_name })} 
                            className={`transition cursor-pointer ${
                              activeItemName === item.raw_name 
                                ? 'bg-amber-100/70 dark:bg-amber-950/40 font-medium' 
                                : 'hover:bg-slate-50 dark:hover:bg-slate-800/40 active:bg-slate-100'
                            }`}
                          >
                            <td className="p-2 whitespace-nowrap overflow-hidden align-middle">
                              <div className="flex flex-col gap-1 items-start">
                                <span className={`px-1 py-0.2 rounded text-[8px] font-bold border ${getRowStyle(item.change_type)}`}>
                                  {item.change_type === 'green' ? 'Добавлен' : item.change_type === 'red' ? 'Удален' : item.change_type === 'yellow' ? 'Цена' : 'База'}
                                </span>
                                <div className="flex items-center gap-1 text-[8px] font-bold tracking-tight">
                                  <span className="text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-0.5 rounded">Ск: {item.stock_wh ?? 0}</span>
                                  <span className="text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-0.5 rounded">Вт: {item.stock_sc ?? 0}</span>
                                </div>
                              </div>
                            </td>
                            <td className="p-2 font-normal text-slate-700 dark:text-slate-300 break-words whitespace-normal align-middle">
                              <div className="flex items-center gap-1.5">
                                <span className="flex-1">{item.raw_name}</span>
                                <button
                                  type="button"
                                  title="Копировать название"
                                  onClick={(e) => copyToClipboard(e, item.raw_name, `doc_${item.id}`)}
                                  className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0 transition"
                                >
                              {copiedId === `doc_${item.id}` ? <IconCheck /> : <IconCopy />}
                                </button>
                              </div>
                            </td>
                            <td className="p-2 text-right font-normal text-slate-900 dark:text-slate-100 break-all align-middle">
                              {formatDisplayPrice(item.price, selectedDoc?.doc_type)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="p-2 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-end gap-1.5 shrink-0">
                <button onClick={() => setSelectedDoc(null)} className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300">Закрыть</button>
                {selectedDoc?.status === 'new' && ((currentTab === 'new' && promoSubTab === 'new' && selectedDoc.hasStockInBranch) || (currentTab === 'gifts' && giftsSubTab === 'new')) && (
                  <button onClick={() => setConfirmModal({ show: true, type: 'process', docId: selectedDoc.id })} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs">Оформить</button>
                )}
                {currentTab === 'completed' && (
                  <button onClick={() => setConfirmModal({ show: true, type: 'archive', docId: selectedDoc.id })} className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg shadow-xs">Ценники обновлены</button>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {confirmModal.show && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl max-w-xs w-full shadow-2xl text-center border dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">Подтверждение</h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mb-4 leading-relaxed">
              {confirmModal.type === 'process' ? 'Оформить промо-акцию?' : 'Ценники обновлены?'}
            </p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmModal({ show: false, type: '', docId: null })} className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-xs text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 flex-1">Отмена</button>
              <button onClick={executeStatusChange} className="px-3 py-2 text-white font-bold text-xs bg-blue-600 hover:bg-blue-700 rounded-lg flex-1">ОК</button>
            </div>
          </div>
        </div>
      )}

      {selectedHistoryItem && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-md w-full max-h-[70vh] flex flex-col overflow-hidden border dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-1 py-0.2 rounded border border-amber-200 uppercase tracking-wider">История стоимости товара</span>
                <h2 className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-0.5 break-words">{selectedHistoryItem.raw_name}</h2>
              </div>
              <button onClick={() => setSelectedHistoryItem(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <div className="flex-1 overflow-auto p-3 space-y-2 bg-slate-50 dark:bg-slate-950/20">
              {historyLoading ? (
                <div className="text-center py-6 text-slate-400 text-xs font-medium animate-pulse">ЗАГРУЗКА ИСТОРИИ...</div>
              ) : priceHistory.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs font-medium">Товар не участвовал в прошлых промо-кампаниях</div>
              ) : (
                <div className="space-y-1.5">
                  {priceHistory.map((hist, idx) => {
                    const doc = hist.documents;
                    if (!doc) return null;

                    const branchStatusObj = Array.isArray(doc.document_branch_statuses) 
                      ? doc.document_branch_statuses[0] 
                      : doc.document_branch_statuses;

                    return (
                      <div
                        key={idx}
                        onClick={() => { openDocDetails(doc); }}
                        className={`p-2.5 rounded-lg border flex items-center justify-between gap-3 active:scale-[0.97] transition-[transform,background-color,border-color] duration-100 ease-out shadow-2xs relative cursor-pointer text-left ${
                          activeDocId === doc.id 
                            ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-400 dark:border-blue-800 border-l-4 border-l-blue-500 pl-2' 
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        <div className="space-y-0.5 min-w-0 flex-1 pr-16">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`text-[8px] font-bold px-1 rounded border ${getBadgeColorClass(doc)}`}>
                              {getPromoNumber(doc)}
                            </span>
                            {(doc.doc_type === 'gift' || doc.doc_type === 'media') && (
                              <span className="bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 text-[8px] font-black px-1 rounded border border-purple-200 dark:border-purple-900">
                                Подарок / Комплект
                              </span>
                            )}
                            <span className="text-[9px] text-slate-400 font-medium">{doc.dept}</span>
                          </div>
                          <h3 className="font-normal text-slate-700 dark:text-slate-200 text-xs truncate">{doc.file_name}</h3>
                          
                          <div className="flex flex-wrap gap-x-2 text-[9px] pt-0.5">
                            <div className="text-slate-400 dark:text-slate-500 flex flex-wrap gap-x-2">
                              {branchStatusObj?.processed_by?.full_name && (
                                <span>Оформил: {branchStatusObj.processed_by.full_name} {branchStatusObj.processed_at && `— ${formatCardDate(branchStatusObj.processed_at)}`}</span>
                              )}
                              {branchStatusObj?.completed_by?.full_name && (
                                <span>Закрыл: {branchStatusObj.completed_by.full_name} {branchStatusObj.completed_at && `— ${formatCardDate(branchStatusObj.completed_at)}`}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0 text-right">
                          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-md border border-blue-100 dark:border-blue-900 whitespace-nowrap">
                            {formatDisplayPrice(hist.price, doc.doc_type)}
                          </span>
                        </div>

                        <div className="absolute top-2.5 right-2.5 text-[8px] text-slate-400 dark:text-slate-500 font-medium">
                          <span>{formatCardDate(doc.created_at)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div> 
              )} 
            </div> 

            <div className="p-2 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-end shrink-0">
              <button onClick={() => setSelectedHistoryItem(null)} className="px-4 py-1.5 bg-slate-800 text-white text-xs font-bold rounded-lg shadow-xs">Закрыть</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes PremiumFadeIn {
          from { 
            opacity: 0; 
            transform: translate3d(0, 12px, 0); 
          }
          to { 
            opacity: 1; 
            transform: translate3d(0, 0, 0); 
          }
        }
        .animate-fade-in {
          animation: PremiumFadeIn 0.25s cubic-bezier(0.215, 0.610, 0.355, 1) forwards;
          will-change: transform, opacity; 
        }
        .style-bounce-scroll {
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
        }
        .style-bounce-scroll:active {
          overscroll-behavior-y: contain;
        }
      `}</style>
    </div>
  );
}
