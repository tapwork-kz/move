import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

export default function App() {
  // === СОСТОЯНИЕ АВТОРИЗАЦИИ ===
  const [user, setUser] = useState(null);
  const [authForm, setAuthForm] = useState({ iin: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // === НАСТРОЙКИ ФИЛЬТРАЦИИ И ВКЛАДОК ===
  const [currentTab, setCurrentTab] = useState('new'); // 'new', 'processed', 'completed', 'archive'
  const [selectedDept, setSelectedDept] = useState(''); // Для админ-режима
  const [searchQuery, setSearchQuery] = useState(''); // Поиск по номеру или названию документа
  const [dateFilter, setDateFilter] = useState(''); // Фильтр по дате действия акции

  // === ДАННЫЕ ИЗ БАЗЫ ДАННЫХ ===
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);

  // === СОСТОЯНИЕ МОДАЛЬНЫХ ОКОН ===
  const [selectedDoc, setSelectedDoc] = useState(null); // Активный документ для просмотра
  const [docItems, setDocItems] = useState([]); // Товары внутри документа
  const [modalTab, setModalTab] = useState('in_stock'); // 'in_stock', 'all', 'source'
  const [itemSearch, setItemSearch] = useState(''); // Поиск по товарам в модалке
  const [confirmModal, setConfirmModal] = useState({ show: false, type: '', docId: null });

  const departments = ["#Цифра 🟠", "#МБТ 🟡", "#КБТ 🔵", "#Другое"];

  // Проверка сохраненной сессии пользователя при первой загрузке
  useEffect(() => {
    const savedUser = localStorage.getItem('promo_app_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      setSelectedDept(parsed.role === 'Директор' || parsed.role === 'Супервайзер' ? '' : parsed.dept);
    }
  }, []);

  // Автоматическая загрузка данных при изменении фильтров
  useEffect(() => {
    if (user) {
      fetchDocuments();
    }
  }, [currentTab, selectedDept, searchQuery, dateFilter, user]);

  // === ОПЕРАЦИИ АВТОРИЗАЦИИ ===
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
      setAuthError('Ошибка подключения к базе данных: ' + err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('promo_app_user');
  };

  // === ПОЛУЧЕНИЕ И АВТОМАТИЧЕСКИЙ ПЕРЕНОС ДОКУМЕНТОВ ===
  const fetchDocuments = async () => {
    setLoading(true);
    try {
      let query = supabase.from('documents').select(`
        *,
        processed_by:users!processed_by_iin(full_name),
        completed_by:users!completed_by_iin(full_name)
      `);

      // Ролевой фильтр: Админ видит всё / Сотрудник только свой отдел (dept)
      const isAdmin = user.role === 'Директор' || user.role === 'Супервайзер';
      if (!isAdmin) {
        query = query.or(`dept.eq."${user.dept}",dept.eq."#Другое"`);
      } else if (selectedDept) {
        query = query.eq('dept', selectedDept);
      }

      // Фильтр по текущей вкладке
      query = query.eq('status', currentTab);

      // Живой поиск по номеру акции/переоценки или названию файла
      if (searchQuery) {
        query = query.or(`promo_number.ilike.%${searchQuery}%,file_name.ilike.%${searchQuery}%`);
      }

      // Фильтр по дате (выбранная дата должна попадать в период акции)
      if (dateFilter) {
        query = query.lte('period_start', dateFilter).gte('period_end', dateFilter);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;

      // СТРОГОЕ УСЛОВИЕ: Сроки оформления истекли -> Автоперенос в "Завершенные"
      if (currentTab === 'processed') {
        const todayStr = new Date().toISOString().split('T')[0];
        const expiredDocs = data.filter(doc => doc.period_end && doc.period_end < todayStr);
        
        if (expiredDocs.length > 0) {
          const expiredIds = expiredDocs.map(d => d.id);
          await supabase
            .from('documents')
            .update({ status: 'completed' })
            .in('id', expiredIds);
          
          // Рекурсивно обновляем список для отображения актуального состояния
          fetchDocuments();
          return;
        }
      }

      setDocuments(data || []);
    } catch (err) {
      console.error("Ошибка получения документов:", err.message);
    } finally {
      setLoading(false);
    }
  };

  // === ЗАГРУЗКА ТОВАРОВ ДЛЯ МОДАЛЬНОГО ОКНА ===
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
      console.error("Ошибка загрузки состава документа:", err.message);
    }
  };

  // === ПЕРЕВОД ДОКУМЕНТА ПО СТАТУСАМ (БИЗНЕС-ЛОГИКА) ===
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
      const { error } = await supabase
        .from('documents')
        .update(updatePayload)
        .eq('id', docId);

      if (error) throw error;

      setConfirmModal({ show: false, type: '', docId: null });
      if (selectedDoc) setSelectedDoc(null);
      fetchDocuments();
    } catch (err) {
      alert("Не удалось обновить статус: " + err.message);
    }
  };

  // Сортировка и поиск строк товаров внутри модалки
  const filteredItems = docItems.filter(item => {
    const matchesText = item.raw_name.toLowerCase().includes(itemSearch.toLowerCase());
    if (modalTab === 'in_stock') {
      return matchesText && item.is_in_stock;
    }
    return matchesText;
  });

  const getRowStyle = (type) => {
    switch (type) {
      case 'green': return 'bg-green-50 text-green-700 border-green-200';
      case 'red': return 'bg-red-50 text-red-700 border-red-200';
      case 'yellow': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  // ВХОД В ПРИЛОЖЕНИЕ (ИНТЕРФЕЙС АВТОРИЗАЦИИ)
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full border border-slate-200">
          <div className="flex flex-col items-center mb-6">
            <div className="p-3 bg-blue-100 rounded-2xl text-blue-600 mb-3">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
            </div>
            <h2 className="text-2xl font-black text-slate-800 text-center">Авторизация Табель</h2>
            <p className="text-sm text-slate-400 mt-1">Доступ к распределению промо-акций</p>
          </div>

          {authError && (
            <div className="mb-4 p-3.5 bg-red-50 text-red-600 text-xs font-semibold rounded-xl border border-red-200 flex items-center gap-2">
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
              {authError}
            </div>
          )}

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">ИИН (Логин)</label>
              <input type="text" required disabled={authLoading} placeholder="Введите ваш ИИН" className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition font-medium" value={authForm.iin} onChange={e => setAuthForm({ ...authForm, iin: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">Пароль</label>
              <input type="password" required disabled={authLoading} placeholder="••••••••" className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition" value={authForm.password} onChange={e => setAuthForm({ ...authForm, password: e.target.value })} />
            </div>
          </div>

          <button type="submit" disabled={authLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold transition shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2">
            {authLoading ? 'Проверка данных...' : 'Войти в систему'}
          </button>
        </form>
      </div>
    );
  }

  // ОСНОВНОЙ РАБОЧИЙ ИНТЕРФЕЙС ПРИЛОЖЕНИЯ
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased font-sans">
      
      {/* ПАНЕЛЬ НАВИГАЦИИ И ПОЛЬЗОВАТЕЛЯ (ВЕРХНЯЯ ШАПКА) */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 px-4 sm:px-8 py-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 text-white p-2 rounded-xl font-black text-lg tracking-wider shadow-md shadow-blue-600/10">PM</div>
          <div>
            <h1 className="text-base font-black text-slate-900 leading-tight">Мониторинг Переоценок</h1>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              <span className="font-bold text-slate-700">{user.full_name}</span>
              <span>•</span>
              <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">{user.dept}</span>
              <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-bold uppercase text-[10px]">{user.role}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap">
          {/* АДМИНИСТРАТИВНЫЙ РЕЖИМ (ДОСТУПЕН ТОЛЬКО ДЛЯ ДИРЕКТОРОВ И СУПЕРВАЙЗЕРОВ) */}
          {(user.role === 'Директор' || user.role === 'Супервайзер') && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl text-xs">
              <span className="font-extrabold text-amber-800 flex items-center gap-1">🛡️ Режим Управления:</span>
              <select className="bg-white border border-slate-200 rounded-lg p-1 font-bold text-slate-700 outline-none focus:ring-1 focus:ring-amber-400" value={selectedDept} onChange={e => setSelectedDept(e.target.value)}>
                <option value="">Все отделы компании</option>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          )}
          <button onClick={handleLogout} className="text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-xl transition flex items-center gap-1">
            Выйти
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* ВКЛАДКИ ПРИЛОЖЕНИЯ (МАРШРУТЫ ТАБОВ) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-slate-200/60 p-1.5 rounded-2xl mb-6 shadow-inner">
          {[
            { id: 'new', label: '📥 Новые акции' },
            { id: 'processed', label: '⏳ Оформленные' },
            { id: 'completed', label: '✅ Завершенные' },
            { id: 'archive', label: '📦 Архив акций' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setCurrentTab(tab.id); setDateFilter(''); }}
              className={`py-3 px-4 font-bold text-xs sm:text-sm rounded-xl transition-all duration-200 text-center ${currentTab === tab.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ПАНЕЛЬ ФИЛЬТРАЦИИ ПО ДАТЕ И УМНОГО ПОИСКА */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="relative flex-1 min-w-[280px]">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </span>
            <input
              type="text"
              placeholder="Введите номер акции или название документа для поиска..."
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition text-sm font-medium"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl shrink-0">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              Фильтр по дате документа:
            </span>
            <input
              type="date"
              className="bg-white border border-slate-200 rounded-lg p-1.5 text-xs font-bold text-slate-700 outline-none focus:ring-1 focus:ring-blue-500"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
            />
            {dateFilter && (
              <button onClick={() => setDateFilter('')} className="text-xs text-red-500 font-bold hover:underline">Сброс</button>
            )}
          </div>
        </div>

        {/* СПИСОК КАРТОЧЕК ДОКУМЕНТОВ */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 font-medium space-y-2">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs animate-pulse font-bold uppercase tracking-widest text-slate-400">Считывание базы данных Supabase...</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl shadow-sm max-w-xl mx-auto p-6 flex flex-col items-center">
            <div className="p-3 bg-slate-100 rounded-full text-slate-400 mb-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/></svg>
            </div>
            <h4 className="font-bold text-slate-700 mb-1">Документы отсутствуют</h4>
            <p className="text-xs text-slate-400">В выбранной вкладке или по заданным критериям поиска записей не обнаружено.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map(doc => (
              <div
                key={doc.id}
                onClick={() => openDocDetails(doc)}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition duration-150 cursor-pointer flex flex-wrap items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 min-w-[280px]">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider shadow-sm">
                      {doc.promo_number || 'АКЦИЯ / ПЕРЕОЦЕНКА'}
                    </span>
                    <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-0.5 rounded">{doc.dept}</span>
                  </div>
                  
                  <h3 className="font-extrabold text-slate-800 text-base leading-snug">{doc.file_name}</h3>
                  
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      📅 Период действия в документе: <strong className="text-slate-700">{doc.period_start || '?'} — {doc.period_end || '?'}</strong>
                    </span>
                  </div>

                  {/* ИНФОРМАЦИОННЫЕ ТЕГИ ОТВЕТСТВЕННЫХ ЛИЦ ИЗ ТАБЕЛЯ */}
                  {(doc.processed_by || doc.completed_by) && (
                    <div className="pt-2 flex flex-wrap gap-2 border-t border-slate-100 mt-2">
                      {doc.processed_by && (
                        <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-1 rounded font-medium">
                          ✍️ <b>Оформил:</b> {doc.processed_by.full_name}
                        </span>
                      )}
                      {doc.completed_by && (
                        <span className="text-[11px] text-green-700 bg-green-50 px-2 py-1 rounded font-medium">
                          🏷️ <b>Ценники обновил:</b> {doc.completed_by.full_name}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* ИНТЕРАКТИВНЫЕ КНОПКИ ДЕЙСТВИЙ */}
                <div onClick={e => e.stopPropagation()} className="shrink-0">
                  {currentTab === 'new' && (
                    <button
                      onClick={() => setConfirmModal({ show: true, type: 'process', docId: doc.id })}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-blue-600/10 transition"
                    >
                      Оформить
                    </button>
                  )}
                  {currentTab === 'completed' && (
                    <button
                      onClick={() => setConfirmModal({ show: true, type: 'archive', docId: doc.id })}
                      className="bg-green-600 hover:bg-green-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-green-600/10 transition"
                    >
                      Ценники обновлены
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* МОДАЛЬНОЕ ОКНО ДЕТАЛИЗАЦИИ ДОКУМЕНТА */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Название модалки */}
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-blue-600 bg-blue-100 border border-blue-200 px-2 py-0.5 rounded uppercase tracking-wider">{selectedDoc.promo_number || 'Документ'}</span>
                <h2 className="text-base font-black text-slate-800 mt-1">{selectedDoc.file_name}</h2>
              </div>
              <button onClick={() => setSelectedDoc(null)} className="text-slate-400 hover:text-slate-600 p-2 font-bold text-lg transition">✕</button>
            </div>

            {/* Внутренние разделы/вкладки внутри модалки */}
            <div className="flex border-b border-slate-200 text-xs sm:text-sm bg-slate-100 font-bold text-slate-500">
              <button onClick={() => setModalTab('in_stock')} className={`flex-1 py-3 text-center transition ${modalTab === 'in_stock' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'hover:text-slate-800'}`}>📋 В наличии ({docItems.filter(i=>i.is_in_stock).length})</button>
              <button onClick={() => setModalTab('all')} className={`flex-1 py-3 text-center transition ${modalTab === 'all' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'hover:text-slate-800'}`}>🌐 Все товары ({docItems.length})</button>
              <button onClick={() => setModalTab('source')} className={`flex-1 py-3 text-center transition ${modalTab === 'source' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'hover:text-slate-800'}`}>📄 Исходный документ</button>
            </div>

            {/* Разделы 1 и 2 содержат в начале поле поиска */}
            {modalTab !== 'source' && (
              <div className="p-3 border-b border-slate-100 bg-white">
                <input
                  type="text"
                  placeholder="Введите наименование товара для фильтрации внутри таблицы..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm font-medium"
                  value={itemSearch}
                  onChange={e => setItemSearch(e.target.value)}
                />
              </div>
            )}

            {/* Содержимое вкладок модалки */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
              {modalTab === 'source' ? (
                <iframe src={selectedDoc.file_url} width="100%" height="100%" className="border border-slate-200 rounded-xl bg-white" title="Просмотр исходного файла" />
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs font-semibold uppercase tracking-wider">Товары не найдены</div>
              ) : (
                <div className="overflow-hidden border border-slate-200 bg-white rounded-xl shadow-sm">
                  <table className="w-full text-left border-collapse text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
                        <th className="p-3">Изменение</th>
                        <th className="p-3">Наименование товара из документа</th>
                        <th className="p-3 text-right">Цена</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredItems.map(item => (
                        <tr key={item.id} className="hover:bg-slate-50 transition">
                          <td className="p-3 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getRowStyle(item.change_type)}`}>
                              {item.change_type === 'green' ? 'Добавлен' : item.change_type === 'red' ? 'Удален' : item.change_type === 'yellow' ? 'Новая цена' : 'Базовый'}
                            </span>
                          </td>
                          <td className="p-3 font-semibold text-slate-700">{item.raw_name}</td>
                          <td className="p-3 text-right font-black text-slate-900 whitespace-nowrap">{item.price || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Нижний подвал модалки */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2 shrink-0">
              <button onClick={() => setSelectedDoc(null)} className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold bg-white text-slate-600 hover:bg-slate-100 transition">Закрыть окно</button>
              {currentTab === 'new' && (
                <button onClick={() => setConfirmModal({ show: true, type: 'process', docId: selectedDoc.id })} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl shadow-md shadow-blue-600/10">Оформить акцию</button>
              )}
              {currentTab === 'completed' && (
                <button onClick={() => setConfirmModal({ show: true, type: 'archive', docId: selectedDoc.id })} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-black rounded-xl shadow-md shadow-green-600/10">Обновление ценников выполнено</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ПОДТВЕРЖДАЮЩЕЕ ВСПЛЫВАЮЩЕЕ ОКОШКО (CONFIRM MODAL) */}
      {confirmModal.show && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white p-6 rounded-2xl max-w-sm w-full shadow-2xl border border-slate-100 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 bg-slate-100 text-2xl">
              {confirmModal.type === 'process' ? '📥' : '✅'}
            </div>
            <h3 className="text-base font-black text-slate-900 mb-1">Требуется подтверждение</h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              {confirmModal.type === 'process' 
                ? 'Вы подтверждаете, что берете в оформление данную промо-акцию/переоценку? Она будет закреплена за вашим ФИО в табеле.' 
                : 'Вы подтверждаете, что завершенные ценники обновлены на витринах магазина? Данные отправятся в архив.'}
            </p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmModal({ show: false, type: '', docId: null })} className="px-4 py-2.5 border border-slate-200 rounded-xl font-bold text-xs text-slate-500 hover:bg-slate-100 flex-1 transition">Отмена</button>
              <button onClick={executeStatusChange} className={`px-4 py-2.5 text-white font-black text-xs rounded-xl flex-1 transition shadow-sm ${confirmModal.type === 'process' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}`}>Подтвердить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
