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

const tabOrder = ['new', 'completed', 'gifts', 'archive'];

export default function App() {
  const [user, setUser] = useState(null);
  const [authForm, setAuthForm] = useState({ iin: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [currentTab, setCurrentTab] = useState('new');
  const [selectedDept, setSelectedDept] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  // ИСПРАВЛЕНО: Добавляем независимое состояние для фильтрации по месяцу
  const [monthFilter, setMonthFilter] = useState('');

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tabCounts, setTabCounts] = useState({ new: 0, completed: 0, gifts: 0, archive: 0 });

  const [selectedDoc, setSelectedDoc] = useState(null);
  const [docItems, setDocItems] = useState([]);
  const [modalTab, setModalTab] = useState('in_stock');
  const [itemSearch, setItemSearch] = useState('');
  const [confirmModal, setConfirmModal] = useState({ show: false, type: '', docId: null });

  // Локальные подразделы для вкладок
  const [promoSubTab, setPromoSubTab] = useState('new'); 
  const [giftsSubTab, setGiftsSubTab] = useState('new'); 
  const [touchStart, setTouchStart] = useState(null);
  const departments = ["#Цифра 🟠", "#МБТ 🟡", "#КБТ 🔵", "#Другое"];

// ИСПРАВЛЕНО: Блокировка прокрутки основного экрана при открытом модальном окне
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

// ВАПИД КЛЮЧ ДЛЯ АВТОРИЗАЦИИ PUSH-СЕРВЕРА
const VAPID_PUBLIC_KEY = "BL2u0Iuaz_Eig1rfzFAhGvMycdoICZcAsM77N-ZZzVrzDl9JJlrQhc0owh6f4GeYhVJWOdg8gjWxt47cRHiYRwM";

// Помощник для конвертации VAPID ключа в бинарный формат
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

// Главная функция генерации пуш-токена и синхронизации с Supabase
const initPushNotifications = async (currentUser) => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.log('Push-уведомления не поддерживаются данным браузером');
    return;
  }

  try {
    // 1. Запрашиваем у пользователя доступ к уведомлениям
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Пользователь отклонил запрос на уведомления');
      return;
    }

    // 2. Ждем готовности сервис-воркера
    const registration = await navigator.serviceWorker.ready;
    
    // 3. Проверяем существующую подписку
    let subscription = await registration.pushManager.getSubscription();

    // 4. Если подписки нет — создаем новую с твоим VAPID ключом
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });
    }

    // 5. Отправляем объект подписки в Supabase в карточку текущего авторизованного сотрудника
    const { error } = await supabase
      .from('users')
      .update({ push_sub: subscription }) // Если колонка типа text, используй JSON.stringify(subscription)
      .eq('iin', currentUser.iin);

    if (error) throw error;
    console.log('Push-подписка успешно синхронизирована с Supabase');

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
          // ИСПРАВЛЕНО: Добавили сброс выбранного отдела по умолчанию для Инфо-консультанта
          setSelectedDept(parsed.role === 'Директор' || parsed.role === 'Супервайзер' || parsed.role === 'Инфо-консультант' ? '' : parsed.dept);
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
    
    // ИСПРАВЛЕНО: Как только пользователь успешно определен, автоматически проверяем и обновляем push-подписку
    initPushNotifications(user);

    setDocuments([]); 
    fetchDocuments();
    updateTabCounters();

    const handleWindowFocus = () => {
      fetchDocuments();
      updateTabCounters();
    };
    window.addEventListener('focus', handleWindowFocus);
    return () => window.removeEventListener('focus', handleWindowFocus);
  }, [currentTab, selectedDept, searchQuery, dateFilter, monthFilter, promoSubTab, giftsSubTab, user]);

  const hasStock = (doc) => {
    if (!doc?.document_items || doc.document_items.length === 0) return true;
    return doc.document_items.some(item => item.is_in_stock === true);
  };

  const updateTabCounters = async () => {
    if (!user) return;
    try {
      let query = supabase.from('documents').select('status, dept, doc_type, period_end, document_items(is_in_stock)');
      // ИСПРАВЛЕНО: Инфо-консультант теперь тоже видит глобальные счетчики всех отделов
      if (user.role !== 'Директор' && user.role !== 'Супервайзер' && user.role !== 'Инфо-консультант') {
        query = query.or(`dept.ilike.*${user.dept}*,dept.ilike.*Другое*`);
      } else if (selectedDept) {
        query = query.eq('dept', selectedDept);
      }

      const { data } = await query;
      if (data) {
        const todayStr = new Date().toISOString().split('T')[0];
        const counts = { new: 0, completed: 0, gifts: 0, archive: 0 };
        
        data.forEach(doc => {
          let computedStatus = doc.status;
          if (doc.period_end && doc.period_end < todayStr) {
            if (doc.status === 'new' && !hasStock(doc)) computedStatus = 'archive';
            else if (doc.status === 'processed') computedStatus = 'completed';
          }

          if (doc.doc_type === 'gift' || doc.doc_type === 'media') {
            // ИСПРАВЛЕНО: Бейдж Подарков теперь считает ТОЛЬКО то, что поступает в "Новые" и у чего ЕСТЬ наличие (кроме медиа-картинок)
            if (doc.status === 'new' && (doc.doc_type === 'media' || hasStock(doc))) {
              counts.gifts++; 
            } else if (computedStatus === 'completed') {
              counts.completed++;
            } else if (computedStatus === 'archive') {
              counts.archive++;
            }
          } else {
            // ИСПРАВЛЕНО: Бейдж Акций теперь считает ТОЛЬКО новые документы, которые реально есть на складе в наличии
            if (computedStatus === 'new' && hasStock(doc)) {
              counts.new++; 
            } else if (computedStatus === 'completed') {
              counts.completed++; 
            } else if (computedStatus === 'archive') {
              counts.archive++;
            }
          }
        });
        setTabCounts(counts);
      }
    } catch (err) { console.error(err); }
  };

  // ИСПРАВЛЕНО: Свайп принудительно отключается, если открыто окошко документа
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
      setSelectedDept(data.role === 'Директор' || data.role === 'Супервайзер' ? '' : data.dept);
      localStorage.setItem('promo_app_user', JSON.stringify(data));
    } catch (err) { setAuthError('Ошибка: ' + err.message); } finally { setAuthLoading(false); }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('promo_app_user');
  };

  const fetchDocuments = async () => {
    if (!user) return;
    setLoading(true);
    try {
      let query = supabase.from('documents').select(`
        *,
        processed_by:users!processed_by_iin(full_name),
        completed_by:users!completed_by_iin(full_name),
        document_items(price, is_in_stock, change_type, raw_name)
      `);

      if (user.role !== 'Директор' && user.role !== 'Супервайзер') {
        // ИСПРАВЛЕНО: Заменили % на * чтобы шлюз Supabase не выдавал ошибку адресации 404
        query = query.or(`dept.ilike.*${user.dept}*,dept.ilike.*Другое*`);
      } else if (selectedDept) {
        query = query.eq('dept', selectedDept);
      }

      if (searchQuery) {
        query = query.or(`promo_number.ilike.%${searchQuery}%,file_name.ilike.%${searchQuery}%`);
      }

      // ИСПРАВЛЕНО: Вычисляем, когда кнопка календаря должна переходить в режим МЕСЯЦА
      const needsMonthFilter = currentTab === 'archive' || 
        (currentTab === 'new' && promoSubTab === 'processed') || 
        (currentTab === 'gifts' && giftsSubTab === 'processed');

      // ИСПРАВЛЕНО: Логика раздельной работы кнопок Дня (dateFilter) и Месяца (monthFilter)
      if (!searchQuery) {
        if (dateFilter) {
          // Если выбран конкретный день (Д), у него наивысший приоритет
          query = query.gte('created_at', `${dateFilter}T00:00:00`).lte('created_at', `${dateFilter}T23:59:59`);
        } else {
          // Вычисляем, на каких вкладках по умолчанию должен стоять текущий месяц, если фильтры пусты
          const needsMonthDefault = currentTab === 'archive' || 
            (currentTab === 'new' && promoSubTab === 'processed') || 
            (currentTab === 'gifts' && giftsSubTab === 'processed');

          const activeMonth = monthFilter || (needsMonthDefault ? new Date().toISOString().slice(0, 7) : '');

          if (activeMonth) {
            const [year, month] = activeMonth.split('-').map(Number);
            const lastDay = new Date(year, month, 0).getDate(); // Автоматически находит 28, 30 или 31 число
            query = query.gte('created_at', `${activeMonth}-01T00:00:00`).lte('created_at', `${activeMonth}-${lastDay}T23:59:59`);
          }
        }
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;

      const todayStr = new Date().toISOString().split('T')[0];
      let mapped = (data || []).map(doc => {
        let s = doc.status;
        if (doc.period_end && doc.period_end < todayStr) {
          if (doc.status === 'new' && !hasStock(doc)) s = 'archive';
          else if (doc.status === 'processed') s = 'completed';
        }
        return { ...doc, computedStatus: s };
      });

      let finalDocs = [];
      if (currentTab === 'new') {
        if (promoSubTab === 'new') {
          finalDocs = mapped.filter(doc => doc.computedStatus === 'new' && hasStock(doc) && doc.doc_type !== 'gift' && doc.doc_type !== 'media');
        } else {
          finalDocs = mapped.filter(doc => ((doc.computedStatus === 'processed') || (doc.computedStatus === 'new' && !hasStock(doc))) && doc.doc_type !== 'gift' && doc.doc_type !== 'media');
        }
      } else if (currentTab === 'gifts') {
        if (giftsSubTab === 'new') {
          finalDocs = mapped.filter(doc => (doc.doc_type === 'media' || (doc.doc_type === 'gift' && hasStock(doc))) && doc.status === 'new');
        } else {
          finalDocs = mapped.filter(doc => (doc.doc_type === 'media' || doc.doc_type === 'gift') && (doc.status === 'processed' || (doc.doc_type === 'gift' && !hasStock(doc) && doc.status === 'new')));
        }
      } else if (currentTab === 'completed') {
        finalDocs = mapped.filter(doc => doc.computedStatus === 'completed');
      } else if (currentTab === 'archive') {
        finalDocs = mapped.filter(doc => 
          (doc.computedStatus === 'archive') || 
          (doc.period_end && doc.period_end < todayStr && !hasStock(doc) && doc.doc_type !== 'media')
        );
      }

      setDocuments(finalDocs);
    } catch (err) { console.error(err.message); } finally { setLoading(false); }
  };

  const openDocDetails = async (doc) => {
    setSelectedDoc(doc);
    setModalTab('in_stock');
    setItemSearch('');
    try {
      const { data, error } = await supabase.from('document_items').select('*').eq('document_id', doc.id);
      if (error) throw error;
      setDocItems(data || []);
    } catch (err) { console.error(err.message); }
  };

  const executeStatusChange = async () => {
    const { type, docId } = confirmModal;
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
      const { error } = await supabase.from('documents').update(updatePayload).eq('id', docId);
      if (error) throw error;
      setConfirmModal({ show: false, type: '', docId: null });
      if (selectedDoc) setSelectedDoc(null);
      fetchDocuments();
    } catch (err) { alert(err.message); }
  };

  // ИСПРАВЛЕНО: Вывод даты с полным четырехзначным годом без лишних знаков и скобок
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

  // ИСПРАВЛЕНО: Парсинг и разделение слитных цен Excel без валюты (Подарки не затрагивает)
  const formatDisplayPrice = (price, docType) => {
    if (!price) return '—';
    if (docType === 'revaluation') {
      let clean = price.replace(/[₸\s]/g, '').trim();
      if (!isNaN(clean) && clean !== '') {
        return Number(clean).toLocaleString('ru-RU');
      }
      return price.replace('₸', '').trim();
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
            {/* ИСПРАВЛЕНО: Премиальная иконка авторизации со стильным iOS-скруглением, градиентом и мягким свечением */}
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-b from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20 dark:shadow-indigo-500/10 mb-3 transition-all duration-300">
              {/* Декоративный внутренний блик */}
              <div className="absolute inset-0 rounded-2xl bg-white/10 blur-xs opacity-50 pointer-events-none" />
              
              {/* Векторный замок высокой четкости */}
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth={2} 
                stroke="currentColor" 
                className="w-7 h-7 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)] animate-fade-in"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" 
                />
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
      /* ИСПРАВЛЕНО: h-[100dvh] и max-h-[100dvh] намертво блокируют прокрутку самого экрана телефона */
      className="w-full max-w-full overflow-hidden h-[100dvh] max-h-[100dvh] bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col select-none"
    >
      {/* ================= ЗАКРЕПЛЕННАЯ СВЕРХУ ПАНЕЛЬ УПРАВЛЕНИЯ ================= */}
      {/* ИСПРАВЛЕНО: shrink-0 гарантирует, что эта панель никогда не сожмется и не уползет вверх */}
      <div className="w-full shrink-0 relative z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xs transition-colors duration-300">
        
        {/* 1. Нативная шапка профиля и админ-селектор */}
        <header className="px-4 py-2.5 flex items-center justify-between gap-4 max-w-3xl mx-auto w-full">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 text-white w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs">PM</div>
            <div>
              <h1 className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-none">Мониторинг Промо</h1>
              <div className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                <span>{user?.full_name}</span>
                <span>•</span>
                <span>{user?.dept}</span>
              </div>
            </div>
          </div>
          
          {/* Панель выбора отделов (Доступна Директору, Супервайзеру и Инфо-консультанту) */}
          {(user?.role === 'Директор' || user?.role === 'Супервайзер' || user?.role === 'Инфо-консультант') && (
            <div className="flex items-center gap-1 bg-amber-50 dark:bg-slate-800 border border-amber-200 dark:border-slate-700 px-1.5 py-0.5 rounded-lg text-[10px] transition-colors duration-500">
              <IconAdmin />
              <select 
                className="bg-transparent border-none font-bold text-slate-700 dark:text-slate-200 outline-none p-0 text-[10px]" 
                value={selectedDept} 
                onChange={e => setSelectedDept(e.target.value)}
              >
                <option value="">Все</option>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          )}
        </header>

        {/* 2. Контейнер фильтров и главных вкладок */}
        <div className="px-4 pb-3 max-w-3xl mx-auto w-full space-y-2.5">
          
          {/* Главные табы */}
          <div className="grid grid-cols-4 bg-slate-200/70 dark:bg-slate-800/60 p-1 rounded-xl shadow-inner gap-0.5 border border-slate-300/10 transition-colors duration-500">
            {[
              { id: 'new', label: 'Акции', icon: <IconNew />, count: tabCounts.new },
              { id: 'completed', label: 'Завершенные', icon: <IconCompleted />, count: tabCounts.completed },
              { id: 'gifts', label: 'Подарки', icon: <IconGift />, count: tabCounts.gifts },
              { id: 'archive', label: 'Архив', icon: <IconArchive />, count: tabCounts.archive }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { setCurrentTab(tab.id); setDateFilter(''); setPromoSubTab('new'); setGiftsSubTab('new'); }}
                className={`relative flex flex-col items-center justify-center pt-2.5 pb-2 rounded-lg transition-[background-color,color] duration-200 ease-out ${currentTab === tab.id ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500 dark:text-slate-400'}`}
              >
                {tab.count > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-red-500 text-white text-[8px] font-black h-3.5 min-w-[14px] px-0.5 rounded-full flex items-center justify-center border border-white dark:border-slate-950 scale-90">
                    {tab.count}
                  </span>
                )}
                <div className="mb-0.5 scale-90">{tab.icon}</div>
                <span className="text-[9px] sm:text-xs font-medium tracking-tight truncate max-w-full px-0.5">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* ИСПРАВЛЕНО: Подразделы теперь органично встроены в строку поиска, календаря и фильтрации */}
          <div className="flex items-center gap-1.5 w-full flex-wrap sm:flex-nowrap">
            <div className="relative flex-1 min-w-[150px]">
              <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-400"><IconSearch /></span>
              <input
                type="text"
                placeholder="Поиск документа..."
                className="w-full pl-7 pr-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg outline-none text-xs font-medium dark:text-white shadow-2xs transition-colors duration-500"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Однострочная кнопка циклического переключения для Акций */}
            {currentTab === 'new' && (
              <button 
                onClick={() => { setPromoSubTab(promoSubTab === 'new' ? 'processed' : 'new'); setDateFilter(''); setMonthFilter(''); }} 
                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition shadow-2xs whitespace-nowrap ${promoSubTab === 'processed' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'}`}
              >
                {promoSubTab === 'processed' ? 'Оформленные' : 'Новые'}
              </button>
            )}

            {/* Однострочная кнопка циклического переключения для Подарков */}
            {currentTab === 'gifts' && (
              <button 
                onClick={() => { setGiftsSubTab(giftsSubTab === 'new' ? 'processed' : 'new'); setDateFilter(''); setMonthFilter(''); }} 
                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition shadow-2xs whitespace-nowrap ${giftsSubTab === 'processed' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'}`}
              >
                {giftsSubTab === 'processed' ? 'Оформленные' : 'Новые'}
              </button>
            )}

            {/* ИСПРАВЛЕНО: Кнопка выбора МЕСЯЦА с меткой "М" (показывается только в Архиве и Оформленных) */}
            {(currentTab === 'archive' || (currentTab === 'new' && promoSubTab === 'processed') || (currentTab === 'gifts' && giftsSubTab === 'processed')) && (
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

            {/* ИСПРАВЛЕНО: Кнопка выбора конкретного ДНЯ с меткой "Д" (показывается всегда) */}
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
          </div>

        </div>
      </div>

      {/* ================= ЛЕНТА КАРТОЧЕК ДОКУМЕНТОВ (СКРОЛЛИТСЯ) ================= */}
      <main 
        key={currentTab} 
        className="p-4 flex-1 overflow-y-auto overscroll-y-contain max-w-3xl mx-auto w-full animate-fade-in"
      >
        {loading ? (
          <div className="text-center py-10 text-slate-400 dark:text-slate-600 font-medium text-xs tracking-wider animate-pulse">ОБРАБОТКА ДАННЫХ...</div>
        ) : documents.length === 0 ? (
          <div className="text-center py-8 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-xl text-xs text-slate-400 font-medium transition-colors duration-300">Список пуст</div>
        ) : (
          <div className="space-y-1.5 pb-4">
            {documents.map(doc => (
              <div
                key={doc.id}
                onClick={() => openDocDetails(doc)}
                /* ИСПРАВЛЕНО: Убрали тяжелый transition-all, оставив только ультра-быстрый отклик на нажатие пальцем */
                className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 active:scale-[0.97] transition-transform duration-100 ease-out shadow-2xs relative cursor-pointer"
              >
                <div className="space-y-0.5 min-w-0 flex-1 pr-16">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[8px] font-bold px-1 rounded border dark:border-slate-700 transition-colors duration-300">
                      {doc.promo_number || 'АКЦИЯ'}
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
                    {!hasStock(doc) && doc.status === 'new' && doc.doc_type !== 'media' ? (
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
            ))}
            <div className="text-center pt-5 pb-3 text-slate-300 dark:text-slate-800 text-[10px] font-medium tracking-widest select-none">
              • КОНЕЦ СПИСКА •
            </div>
          </div>
        )}
      </main>

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
                  <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-1 py-0.2 rounded border border-blue-200 uppercase tracking-wider">{selectedDoc.promo_number || 'Документ'}</span>
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
                  // Проверяем, является ли открытый документ файлом Ворд (.docx)
                  const isWordDoc = selectedDoc?.file_name?.match(/\.docx$/i);
                  
                  if (isWordDoc) {
                    // Считаем точный коэффициент масштаба в JS, чтобы избежать пустых экранов
                    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 390;
                    const availableWidth = screenWidth - 36; // Вычитаем боковые отступы модального окна
                    const targetWidth = 950; // Оптимальная ширина для полной прорисовки таблиц Ворда
                    const scaleFactor = Math.min(1, availableWidth / targetWidth); // Получаем чистый множитель
                    
                    return (
                      /* ИСПРАВЛЕНО: Клик теперь обрабатывается самим контейнером. 
                         Это полностью решает баг со сбросом тапа после скроллинга, так как события больше не теряются. */
                      <div 
                        className="w-full h-full overflow-x-hidden overflow-y-auto rounded-lg bg-white border border-slate-200 dark:border-slate-800 p-0 m-0 relative min-h-[500px] cursor-pointer"
                        onClick={(e) => {
                          const container = e.currentTarget;
                          const frame = container.querySelector('iframe');
                          if (!frame) return;
                          
                          const isZoomed = frame.getAttribute('data-zoomed') === 'true';
                          if (!isZoomed) {
                            // ТАП 1: Включаем приближение (уменьшено в 1.5 раза от максимума -> ставим комфортный масштаб 0.7)
                            const zoomScale = 0.7;
                            frame.style.transform = `scale(${zoomScale})`;
                            frame.style.position = 'static';
                            frame.style.width = `${targetWidth}px`;
                            frame.style.height = '1800px'; // Задаем запас высоты для прокрутки страниц
                            container.style.overflowX = 'auto'; 
                            frame.setAttribute('data-zoomed', 'true');
                          } else {
                            // ТАП 2: Возвращаем в исходный аккуратный режим по ширине экрана смартфона
                            frame.style.transform = `scale(${scaleFactor})`;
                            frame.style.position = 'absolute';
                            frame.style.width = `${targetWidth}px`;
                            frame.style.height = `${100 / scaleFactor}%`;
                            container.style.overflowX = 'hidden';
                            container.scrollLeft = 0; // Возвращаем горизонтальный сдвиг в начало
                            container.scrollTop = 0;  // Возвращаем вертикальный скролл на самый верх документа
                            frame.setAttribute('data-zoomed', 'false');
                          }
                        }}
                      >
                        <iframe 
                          src={finalUrl} 
                          title="Doc" 
                          /* ИСПРАВЛЕНО: pointer-events-none пропускает клики и свайпы напрямую в контейнер, сохраняя нативный скролл */
                          className="border-none p-0 m-0 absolute top-0 left-0 transition-transform duration-200 ease-out pointer-events-none"
                          data-zoomed="false"
                          style={{
                            width: `${targetWidth}px`,
                            // Высота увеличивается пропорционально сжатию, чтобы документ идеально заполнил 100% высоты окошка
                            height: `${100 / scaleFactor}%`,
                            // Применяем чистое аппаратное отдаление без багов верстки
                            transform: `scale(${scaleFactor})`,
                            transformOrigin: 'top left'
                          }}
                        />
                      </div>
                    );
                  }
                  
                  return (
                    /* ДЛЯ ПДФ, КАРТИНОК И ПРОЧЕГО: Оставляем твой исходный рабочий код без изменений */
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
                          <th className="p-2 w-[85px] shrink-0">Статус</th>
                          <th className="p-2 text-left">{selectedDoc?.header_col1 || 'Наименование'}</th>
                          <th className="p-2 text-right w-[85px] shrink-0">
                            {selectedDoc?.doc_type === 'revaluation' ? 'Переоценка' : (selectedDoc?.header_col2 || 'Промо')}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {/* ИСПРАВЛЕНО: Лимит в 80 строк для мгновенного рендеринга на смартфонах */}
                        {filteredItems.slice(0, 80).map(item => (
                          <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                            <td className="p-2 whitespace-nowrap overflow-hidden">
                              <span className={`px-1 py-0.2 rounded text-[8px] font-bold border ${getRowStyle(item.change_type)}`}>
                                {item.change_type === 'green' ? 'Добавлен' : item.change_type === 'red' ? 'Удален' : item.change_type === 'yellow' ? 'Цена' : 'База'}
                              </span>
                            </td>
                            <td className="p-2 font-normal text-slate-700 dark:text-slate-300 break-words whitespace-normal align-middle">
                              {item.raw_name}
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
                {selectedDoc?.status === 'new' && ((currentTab === 'new' && promoSubTab === 'new' && hasStock(selectedDoc)) || (currentTab === 'gifts' && giftsSubTab === 'new')) && (
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

      {/* ================= ДИАЛОГ ПОДТВЕРЖДЕНИЯ ДЕЙСТВИЯ ================= */}
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

      <style>{`
        /* ИСПРАВЛЕНО: Нативная физика мягкого выплывания списков (Spring Physics) через видеокарту смартфона */
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
          will-change: transform, opacity; /* Заранее готовит GPU телефона к плавной отрисовке */
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
