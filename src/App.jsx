import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

// === СТРОГИЕ КРУПНЫЕ MATERIAL DESIGN SVG ИКОНКИ (РАЗМЕР УВЕЛИЧЕН ДЛЯ МОБИЛОК) ===
const IconLogin = () => <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9a2 2 0 012-2m6 0V5a2 2 0 00-2-2H9a2 2 0 00-2 2v2m6 0h-6M12 11v4m-2-2h4"/></svg>;
const IconNew = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/></svg>;
const IconProcessed = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>;
const IconCompleted = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>;
const IconArchive = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/></svg>;
const IconSearch = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>;
const IconCalendar = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>;
const IconAdmin = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.952 11.952 0 01-7.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>;
const IconClose = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>;
const IconStock = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>;
const IconAll = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>;
const IconFile = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>;

export default function App() {
  const [user, setUser] = useState(null);
  const [authForm, setAuthForm] = useState({ iin: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [currentTab, setCurrentTab] = useState('new');
  const [selectedDept, setSelectedDept] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedDoc, setSelectedDoc] = useState(null);
  const [docItems, setDocItems] = useState([]);
  const [modalTab, setModalTab] = useState('in_stock');
  const [itemSearch, setItemSearch] = useState('');
  const [confirmModal, setConfirmModal] = useState({ show: false, type: '', docId: null });

  const departments = ["#Цифра 🟠", "#МБТ 🟡", "#КБТ 🔵", "#Другое"];

  useEffect(() => {
    const savedUser = localStorage.getItem('promo_app_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      setSelectedDept(parsed.role === 'Директор' || parsed.role === 'Супервайзер' ? '' : parsed.dept);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchDocuments();
    }
  }, [currentTab, selectedDept, searchQuery, dateFilter, user]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('iin', authForm.iin)
        .eq('password', authForm.password)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        setAuthError('Неверный ИИН или пароль. Проверьте данные.');
        return;
      }
      if (data.login_status !== true) {
        setAuthError('Вход запрещен. Ваш аккаунт деактивирован в табеле.');
        return;
      }

      setUser(data);
      setSelectedDept(data.role === 'Директор' || data.role === 'Супервайзер' ? '' : data.dept);
      localStorage.setItem('promo_app_user', JSON.stringify(data));
    } catch (err) {
      setAuthError('Ошибка базы данных: ' + err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('promo_app_user');
  };

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      let query = supabase.from('documents').select(`
        *,
        processed_by:users!processed_by_iin(full_name),
        completed_by:users!completed_by_iin(full_name)
      `);

      const isAdmin = user.role === 'Директор' || user.role === 'Супервайзер';
      if (!isAdmin) {
        query = query.or(`dept.eq."${user.dept}",dept.eq."#Другое"`);
      } else if (selectedDept) {
        query = query.eq('dept', selectedDept);
      }

      query = query.eq('status', currentTab);

      if (searchQuery) {
        query = query.or(`promo_number.ilike.%${searchQuery}%,file_name.ilike.%${searchQuery}%`);
      }

      if (dateFilter) {
        query = query.lte('period_start', dateFilter).gte('period_end', dateFilter);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;

      if (currentTab === 'processed') {
        const todayStr = new Date().toISOString().split('T')[0];
        const expiredDocs = data.filter(doc => doc.period_end && doc.period_end < todayStr);
        
        if (expiredDocs.length > 0) {
          const expiredIds = expiredDocs.map(d => d.id);
          await supabase.from('documents').update({ status: 'completed' }).in('id', expiredIds);
          fetchDocuments();
          return;
        }
      }

      setDocuments(data || []);
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openDocDetails = async (doc) => {
    setSelectedDoc(doc);
    setModalTab('in_stock');
    setItemSearch('');
    try {
      const { data, error } = await supabase
        .from('document_items')
        .select('*')
        .eq('document_id', doc.id);
      if (error) throw error;
      setDocItems(data || []);
    } catch (err) {
      console.error(err.message);
    }
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
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredItems = docItems.filter(item => {
    const matchesText = item.raw_name.toLowerCase().includes(itemSearch.toLowerCase());
    if (modalTab === 'in_stock') {
      return matchesText && item.is_in_stock;
    }
    return matchesText;
  });

  const getRowStyle = (type) => {
    switch (type) {
      case 'green': return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-900';
      case 'red': return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900';
      case 'yellow': return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-400 dark:border-yellow-900';
      default: return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 dark:bg-slate-950 flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-800">
          <div className="flex flex-col items-center mb-6">
            <div className="p-3 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-2xl mb-3"><IconLogin /></div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 text-center">Авторизация Табель</h2>
          </div>
          {authError && <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 text-xs font-semibold rounded-xl border border-red-200 dark:border-red-900">{authError}</div>}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">ИИН (Логин)</label>
              <input type="text" required placeholder="Введите ваш ИИН" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-base font-medium dark:text-white" value={authForm.iin} onChange={e => setAuthForm({ ...authForm, iin: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">Пароль</label>
              <input type="password" required placeholder="••••••••" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-base dark:text-white" value={authForm.password} onChange={e => setAuthForm({ ...authForm, password: e.target.value })} />
            </div>
          </div>
          <button type="submit" disabled={authLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold transition">Войти</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col justify-between transition-colors duration-200">
      <div>
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shadow-md">PM</div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-none">Мониторинг Переоценок</h1>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                <span className="text-slate-700 dark:text-slate-200 font-semibold">{user.full_name}</span>
                <span>•</span>
                <span>{user.dept}</span>
              </div>
            </div>
          </div>

          {(user.role === 'Директор' || user.role === 'Супервайзер') && (
            <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 px-2 py-1 rounded-lg text-xs">
              <IconAdmin />
              <select className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded p-0.5 font-bold text-slate-700 dark:text-slate-200 outline-none" value={selectedDept} onChange={e => setSelectedDept(e.target.value)}>
                <option value="">Все отделы</option>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          )}
        </header>

        <main className="max-w-7xl mx-auto p-4 sm:p-6">
          {/* ВКЛАДКИ ПЕРЕИМЕНОВАНЫ, ЗНАЧКИ КРУПНЫЕ ДЛЯ МОБИЛОК */}
          <div className="flex flex-nowrap overflow-x-auto no-scrollbar bg-slate-200/60 dark:bg-slate-800/60 p-1 rounded-xl mb-5 shadow-inner gap-1 whitespace-nowrap">
            {[
              { id: 'new', label: 'Акции', icon: <IconNew /> },
              { id: 'processed', label: 'Оформленные', icon: <IconProcessed /> },
              { id: 'completed', label: 'Завершенные', icon: <IconCompleted /> },
              { id: 'archive', label: 'Архив', icon: <IconArchive /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { setCurrentTab(tab.id); setDateFilter(''); }}
                className={`flex items-center justify-center gap-2 py-3 px-4 font-bold text-xs sm:text-sm rounded-lg transition-all flex-1 min-w-[125px] ${currentTab === tab.id ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
              >
                <span className="scale-110 sm:scale-100">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* КАЛЕНДАРЬ НАХОДИТСЯ СТРОГО СПРАВА ОТ ПОИСКА (НЕ ВЫХОДИТ ЗА РАМКИ) */}
          <div className="flex items-center gap-2 mb-5">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-slate-500"><IconSearch /></span>
              <input
                type="text"
                placeholder="Поиск по номеру или названию..."
                className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-base font-medium shadow-sm dark:text-white"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3.5 py-2.5 rounded-xl shadow-sm shrink-0 relative cursor-pointer">
              <span className="text-slate-400 dark:text-slate-500 sm:mr-2 shrink-0"><IconCalendar /></span>
              <input
                type="date"
                className="bg-transparent border-none text-base font-bold text-slate-700 dark:text-slate-200 outline-none w-full hidden sm:block dark:[color-scheme:dark]"
                value={dateFilter}
                onChange={e => setDateFilter(e.target.value)}
              />
              {/* Невидимый клик-слой для мобильных устройств, вызывающий календарь по нажатию на иконку */}
              <input
                type="date"
                className="absolute inset-0 opacity-0 sm:hidden cursor-pointer"
                value={dateFilter}
                onChange={e => setDateFilter(e.target.value)}
              />
              {dateFilter && (
                <button onClick={(e) => { e.stopPropagation(); setDateFilter(''); }} className="text-xs text-red-500 font-bold ml-1.5 sm:ml-2 shrink-0 relative z-10">✕</button>
              )}
            </div>
          </div>

          {/* КОМПАКТНЫЙ СПИСОК КАРТОЧЕК — СТРОКА СРОКИ ПОЛНОСТЬЮ СКРЫТА */}
          {loading ? (
            <div className="text-center py-12 text-slate-400 dark:text-slate-500 font-bold text-xs tracking-wider animate-pulse">ЗАГРУЗКА ДАННЫХ...</div>
          ) : documents.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-xl text-xs text-slate-400 font-medium shadow-xs">Список пуст</div>
          ) : (
            <div className="space-y-2">
              {documents.map(doc => (
                <div
                  key={doc.id}
                  onClick={() => openDocDetails(doc)}
                  className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition duration-150 cursor-pointer flex items-center justify-between gap-4"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-[10px] font-bold px-1.5 py-0.5 rounded border dark:border-slate-700">
                        {doc.promo_number || 'ПРАЙС'}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{doc.dept}</span>
                    </div>
                    
                    <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm truncate">{doc.file_name}</h3>

                    {(doc.processed_by || doc.completed_by) && (
                      <div className="flex flex-wrap gap-x-3 text-[10px] text-slate-400 dark:text-slate-500 pt-1 border-t border-slate-50 dark:border-slate-800 mt-1">
                        {doc.processed_by && <span>✍️ {doc.processed_by.full_name}</span>}
                        {doc.completed_by && <span>🏷️ {doc.completed_by.full_name}</span>}
                      </div>
                    )}
                  </div>
                  
                  <div className="text-slate-300 dark:text-slate-600 shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <footer className="py-6 text-center bg-transparent shrink-0">
        <button onClick={handleLogout} className="text-xs text-slate-300 dark:text-slate-600 hover:text-slate-500 transition underline tracking-wide">
          Выйти из системы табеля
        </button>
      </footer>

      {/* ОТКРЫВАЕМОЕ ОКНО С АККУРАТНЫМИ СТИЛЬНЫМИ ВКЛАДКАМИ И УБРАННЫМ СЛОВОМ ИСХОДНЫЙ */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs z-40 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-5xl w-full h-[90vh] sm:h-[85vh] flex flex-col overflow-hidden animate-in静态 fade-in zoom-in-95 duration-100 border dark:border-slate-800">
            
            <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
              <div className="min-w-0 flex-1 pr-4">
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-900 uppercase tracking-wider">{selectedDoc.promo_number || 'Документ'}</span>
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1 truncate">{selectedDoc.file_name}</h2>
              </div>
              <button onClick={() => setSelectedDoc(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"><IconClose /></button>
            </div>

            {/* ТАБЫ ВНУТРИ МОДАЛКИ СДЕЛАНЫ В ТОМ ЖЕ КРАСИВОМ СТИЛЕ ЧТО И ОСНОВНЫЕ */}
            <div className="p-2 bg-slate-50 dark:bg-slate-950/50 border-b dark:border-slate-800">
              <div className="flex flex-nowrap overflow-x-auto no-scrollbar bg-slate-200/60 dark:bg-slate-800/60 p-1 rounded-xl gap-1 whitespace-nowrap font-bold text-slate-500">
                <button onClick={() => setModalTab('in_stock')} className={`flex items-center justify-center gap-2 py-2 px-3 text-xs sm:text-sm rounded-lg transition-all flex-1 ${modalTab === 'in_stock' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}>
                  <IconStock /> В наличии ({docItems.filter(i=>i.is_in_stock).length})
                </button>
                <button onClick={() => setModalTab('all')} className={`flex items-center justify-center gap-2 py-2 px-3 text-xs sm:text-sm rounded-lg transition-all flex-1 ${modalTab === 'all' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}>
                  <IconAll /> Все ({docItems.length})
                </button>
                <button onClick={() => setModalTab('source')} className={`flex items-center justify-center gap-2 py-2 px-3 text-xs sm:text-sm rounded-lg transition-all flex-1 ${modalTab === 'source' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}>
                  <IconFile /> Документ
                </button>
              </div>
            </div>

            {modalTab !== 'source' && (
              <div className="p-2.5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                <input
                  type="text"
                  placeholder="Поиск товара по наименованию..."
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-base font-medium dark:text-white"
                  value={itemSearch}
                  onChange={e => setItemSearch(e.target.value)}
                />
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-3 bg-slate-50 dark:bg-slate-950/20">
              {modalTab === 'source' ? (
                <iframe src={selectedDoc.file_url} width="100%" height="100%" className="border rounded-lg bg-white dark:bg-slate-900 dark:border-slate-800" title="Doc" />
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-xs font-bold uppercase">Ничего не найдено</div>
              ) : (
                <div className="overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-lg shadow-xs">
                  <table className="w-full text-left border-collapse text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-slate-800 border-b dark:border-slate-700 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold">
                        <th className="p-2.5">Статус</th>
                        <th className="p-2.5">Наименование</th>
                        <th className="p-2.5 text-right">Цена</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredItems.map(item => (
                        <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                          <td className="p-2.5">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${getRowStyle(item.change_type)}`}>
                              {item.change_type === 'green' ? 'Добавлен' : item.change_type === 'red' ? 'Удален' : item.change_type === 'yellow' ? 'Цена' : 'База'}
                            </span>
                          </td>
                          <td className="p-2.5 font-medium text-slate-700 dark:text-slate-300">{item.raw_name}</td>
                          <td className="p-2.5 text-right font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">{item.price || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-end gap-2 shrink-0">
              <button onClick={() => setSelectedDoc(null)} className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">Закрыть</button>
              {currentTab === 'new' && (
                <button onClick={() => setConfirmModal({ show: true, type: 'process', docId: selectedDoc.id })} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md">Оформить акцию</button>
              )}
              {currentTab === 'completed' && (
                <button onClick={() => setConfirmModal({ show: true, type: 'archive', docId: selectedDoc.id })} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl shadow-md">Ценники обновлены</button>
              )}
            </div>
          </div>
        </div>
      )}

      {confirmModal.show && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl max-w-sm w-full shadow-2xl text-center border dark:border-slate-800 animate-in fade-in zoom-in-95 duration-100">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">Требуется подтверждение</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-5 leading-relaxed">
              {confirmModal.type === 'process' 
                ? 'Вы подтверждаете оформление данной промо-акции? Документ закрепится за вашим ФИО.' 
                : 'Вы подтверждаете, что ценники на витринах обновлены? Документ переместится в архив.'}
            </p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmModal({ show: false, type: '', docId: null })} className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 flex-1">Отмена</button>
              <button onClick={executeStatusChange} className={`px-4 py-2 text-white font-bold text-xs rounded-xl flex-1 ${confirmModal.type === 'process' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}`}>Подтвердить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
