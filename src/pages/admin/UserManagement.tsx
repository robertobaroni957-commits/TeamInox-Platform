import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../services/api';
import type { UserData } from '../../services/types'; 
import { Users, Shield, User, Loader2, Trash2, Mail, Calendar, Search, Filter, RefreshCw, X, ChevronLeft, ChevronRight, FileJson, Database, HelpCircle, ExternalLink, Info, Copy } from 'lucide-react';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showGuideModal, setShowGuideModal] = useState(false);

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterGender, setFilterGender] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/list_users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('inox_token')}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('inox_token');
          window.location.href = '/login';
          return;
        }
        throw new Error(`Errore Server: ${response.status}`);
      }

      const data = await response.json();
      if (Array.isArray(data)) {
        // Ordinamento alfabetico di default
        const sortedData = data.sort((a, b) => a.username.localeCompare(b.username));
        setUsers(sortedData);
      } else {
        console.error('Data is not an array:', data);
        setUsers([]);
        setError('Formato dati non valido ricevuto dal server.');
      }
    } catch (err: any) {
      console.error('Fetch Users Error:', err);
      setError('Impossibile caricare la lista utenti. Verifica la connessione.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        user.id.toString().includes(searchTerm);
      
      const matchesRole = !filterRole || user.role === filterRole;
      const matchesCategory = !filterCategory || user.base_category === filterCategory;
      const matchesGender = !filterGender || user.gender === filterGender;

      return matchesSearch && matchesRole && matchesCategory && matchesGender;
    });
  }, [users, searchTerm, filterRole, filterCategory, filterGender]);

  // Paginazione
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const currentUsers = useMemo(() => {
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    return filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  }, [filteredUsers, currentPage]);

  useEffect(() => {
    setCurrentPage(1); // Reset alla prima pagina quando cambiano i filtri
  }, [searchTerm, filterRole, filterCategory, filterGender]);

  const [importing, setImporting] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [zpJson, setZpJson] = useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleZPSync = async () => {
    if (!zpJson.trim()) return;
    setImporting(true);
    try {
      let data = JSON.parse(zpJson);
      const riders = data.data || data.riders || (Array.isArray(data) ? data : []);
      
      const response = await fetch('/api/admin/sync-zp-categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('inox_token')}`
        },
        body: JSON.stringify({ riders })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Errore sincronizzazione');

      alert(result.message);
      setShowSyncModal(false);
      setZpJson('');
      fetchUsers();
    } catch (err: any) {
      alert('Errore JSON o Sincronizzazione: ' + err.message);
    } finally {
      setImporting(false);
    }
  };

  const handleImportCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const text = await file.text();
      const token = localStorage.getItem('inox_token');
      
      const response = await fetch('/api/admin/import-csv', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: text
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Errore durante l\'importazione');

      alert(`Importazione completata!\nAtleti: ${result.athletesCount}\nSquadre: ${result.teamsCount}\nPreferenze: ${result.preferencesCount}`);
      
      fetchUsers();

    } catch (err: any) {
      console.error('Import Error:', err);
      alert('Errore: ' + err.message);
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    setUpdating(userId);
    try {
      const response = await fetch('/api/admin/update_role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('inox_token')}`
        },
        body: JSON.stringify({ userId, newRole })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Errore durante l\'aggiornamento');
      }

      setUsers(prev => prev.map((u: UserData) => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err: any) {
      alert('Errore aggiornamento ruolo: ' + err.message);
    } finally {
      setUpdating(null);
    }
  };

  const handleCategoryChange = async (userId: number, newCategory: string) => {
    setUpdating(userId);
    try {
      await api.updateAthlete(userId, { category: newCategory });
      setUsers(prev => prev.map((u: UserData) => u.id === userId ? { ...u, base_category: newCategory } : u));
    } catch (err: any) {
      alert('Errore aggiornamento categoria: ' + err.message);
    } finally {
      setUpdating(null);
    }
  };

  const handleDeleteUser = async (userId: number, username: string) => {
    if (window.confirm(`Sei sicuro di voler eliminare definitivamente l'utente ${username}? Questa azione non è reversibile.`)) {
      setUpdating(userId);
      try {
        await api.deleteUser(userId);
        setUsers(prev => prev.filter((u: UserData) => u.id !== userId));
      } catch (err: any) {
        alert('Errore eliminazione utente: ' + err.message);
      } finally {
        setUpdating(null);
      }
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 text-inox-orange">
      <Loader2 className="animate-spin mb-4" size={48} />
      <p className="font-black italic uppercase tracking-widest">Accessing User Database...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-zinc-800 pb-6 gap-4">
        <div>
          <span className="text-red-500 font-black text-xs tracking-[0.3em] uppercase italic">System Administration</span>
          <h1 className="text-6xl font-black italic tracking-tighter leading-none mt-2 text-white uppercase">
            USER <span className="text-zinc-600">MANAGEMENT</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowGuideModal(true)}
            className="bg-zinc-900 border border-zinc-800 hover:border-blue-500 text-zinc-400 hover:text-blue-500 px-6 py-2.5 rounded-xl flex items-center gap-3 transition-all text-[10px] font-black uppercase tracking-widest"
          >
            <HelpCircle size={16} />
            Guida Online
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportCSV}
            accept=".csv,.json"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className="bg-zinc-900 border border-zinc-800 hover:border-inox-orange text-zinc-400 hover:text-white px-6 py-2.5 rounded-xl flex items-center gap-3 transition-all text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
          >
            {importing ? <Loader2 size={16} className="animate-spin" /> : <FileJson size={16} />}
            {importing ? 'Importing...' : 'Carica File Locale'}
          </button>

          <button
            onClick={() => setShowSyncModal(true)}
            className="bg-orange-500/10 border border-orange-500/20 hover:bg-orange-500/20 text-orange-500 px-6 py-2.5 rounded-xl flex items-center gap-3 transition-all text-[10px] font-black uppercase tracking-widest"
          >
            <RefreshCw size={16} />
            Sincronizza da ZwiftPower
          </button>
        </div>
      </header>

      {/* GUIDE MODAL */}
      {showGuideModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-3xl rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                  <HelpCircle size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black italic text-white uppercase leading-none">Guida Importazione Atleti</h3>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-2">Istruzioni per sincronizzare il team da ZwiftPower</p>
                </div>
              </div>
              <button onClick={() => setShowGuideModal(false)} className="text-zinc-500 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-8 space-y-8 overflow-y-auto max-h-[70vh]">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-inox-orange uppercase font-black italic text-sm">
                  <span className="w-8 h-8 rounded-full bg-inox-orange text-black flex items-center justify-center not-italic">1</span>
                  Accedi a ZwiftPower
                </div>
                <p className="text-zinc-400 text-sm pl-11">
                  Apri il browser e vai all'URL dell'API di ZwiftPower per il tuo team:<br/>
                  <code className="bg-black px-2 py-1 rounded text-inox-cyan mt-2 inline-block">https://zwiftpower.com/api3.php?do=team_riders&id=16461</code>
                </p>
                <div className="pl-11">
                  <a href="https://zwiftpower.com/api3.php?do=team_riders&id=16461" target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 flex items-center gap-2 text-xs font-bold uppercase underline">
                    Apri ZwiftPower API <ExternalLink size={14} />
                  </a>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-inox-orange uppercase font-black italic text-sm">
                  <span className="w-8 h-8 rounded-full bg-inox-orange text-black flex items-center justify-center not-italic">2</span>
                  Copia il JSON
                </div>
                <p className="text-zinc-400 text-sm pl-11">
                  Una volta aperta la pagina, vedrai un testo simile a <code className="text-zinc-300">{"{\"data\": [...]}"}</code>. <br/>
                  Seleziona tutto il testo (CTRL+A) e copialo (CTRL+C).
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-inox-orange uppercase font-black italic text-sm">
                  <span className="w-8 h-8 rounded-full bg-inox-orange text-black flex items-center justify-center not-italic">3</span>
                  Incolla e Sincronizza
                </div>
                <p className="text-zinc-400 text-sm pl-11">
                  Torna in questa pagina, clicca su <strong>"Sincronizza da ZwiftPower"</strong>, incolla il testo nell'area dedicata e premi <strong>"Avvia Sincronizzazione"</strong>.
                </p>
              </div>

              <div className="bg-zinc-950 p-6 rounded-3xl border border-zinc-800 space-y-4">
                <div className="flex items-center gap-3 text-blue-500 uppercase font-black italic text-xs">
                  <Info size={16} />
                  Mappatura Categorie (ZwiftPower)
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {[
                    { val: '5', cat: 'A+', col: 'text-purple-500' },
                    { val: '10', cat: 'A', col: 'text-red-500' },
                    { val: '20', cat: 'B', col: 'text-emerald-500' },
                    { val: '30', cat: 'C', col: 'text-sky-500' },
                    { val: '40', cat: 'D', col: 'text-yellow-500' }
                  ].map(m => (
                    <div key={m.val} className="bg-zinc-900 p-3 rounded-2xl border border-zinc-800 text-center">
                      <div className="text-[10px] text-zinc-600 font-bold uppercase mb-1">DIV {m.val}</div>
                      <div className={`font-black italic ${m.col}`}>CAT {m.cat}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-zinc-800 flex justify-end">
              <button
                onClick={() => setShowGuideModal(false)}
                className="px-8 py-3 bg-white text-black rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-zinc-200 transition-all"
              >
                Ho Capito
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SYNC MODAL */}
      {showSyncModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-zinc-800 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black italic text-white uppercase leading-none">ZwiftPower Sync</h3>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-2">Incolla il JSON di api3.php?do=team_riders</p>
              </div>
              <button onClick={() => setShowSyncModal(false)} className="text-zinc-500 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <textarea
                value={zpJson}
                onChange={(e) => setZpJson(e.target.value)}
                placeholder='Incolla qui il JSON... (es: {"data": [...]})'
                className="w-full h-64 bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-xs font-mono text-zinc-400 focus:border-orange-500 outline-none resize-none"
              />
              <div className="flex gap-4">
                <button
                  onClick={() => setShowSyncModal(false)}
                  className="flex-1 py-4 bg-zinc-800 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-zinc-700 transition-all"
                >
                  Annulla
                </button>
                <button
                  onClick={handleZPSync}
                  disabled={importing || !zpJson.trim()}
                  className="flex-[2] py-4 bg-orange-500 text-black rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-orange-400 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {importing ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                  Avvia Sincronizzazione
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl font-bold italic text-center">
          {error}
        </div>
      )}

      {/* Filters Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-zinc-900/50 p-6 rounded-[2rem] border border-zinc-800 shadow-xl">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <input
            type="text"
            placeholder="Cerca per nome, email o ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:border-inox-orange outline-none transition-all placeholder:text-zinc-700"
          />
        </div>
        
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-12 pr-10 py-3 text-sm text-zinc-400 focus:border-inox-orange outline-none transition-all appearance-none cursor-pointer"
          >
            <option value="">Tutti i Ruoli</option>
            <option value="admin">Admin</option>
            <option value="moderator">Moderator</option>
            <option value="captain">Captain</option>
            <option value="athlete">User/Athlete</option>
          </select>
        </div>

        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-12 pr-10 py-3 text-sm text-zinc-400 focus:border-inox-orange outline-none transition-all appearance-none cursor-pointer"
          >
            <option value="">Tutte le Categorie</option>
            <option value="A+">Categoria A+</option>
            <option value="A">Categoria A</option>
            <option value="B">Categoria B</option>
            <option value="C">Categoria C</option>
            <option value="D">Categoria D</option>
            <option value="E">Categoria E</option>
          </select>
        </div>

        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <select
            value={filterGender}
            onChange={(e) => setFilterGender(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-12 pr-10 py-3 text-sm text-zinc-400 focus:border-inox-orange outline-none transition-all appearance-none cursor-pointer"
          >
            <option value="">Tutti i Sessi</option>
            <option value="M">Uomo</option>
            <option value="F">Donna</option>
          </select>
        </div>
      </div>

      <div className="bg-zinc-900/30 rounded-[2.5rem] border border-zinc-800 overflow-hidden shadow-2xl flex flex-col h-full">
        <div className="overflow-x-auto flex-grow">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/40 text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="px-8 py-5">User / Rider</th>
                <th className="px-8 py-5">Cat / Gender</th>
                <th className="px-8 py-5">Email Address</th>
                <th className="px-8 py-5">Current Role</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {currentUsers.map((user: UserData) => (
                <tr key={user.id} className="hover:bg-zinc-800/20 transition-all group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-500 group-hover:border-inox-orange group-hover:text-inox-orange transition-all">
                        <User size={24} />
                      </div>
                      <div>
                        <div className="text-white font-black uppercase tracking-tight text-lg leading-none">{user.username}</div>
                        <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1 italic opacity-70">
                           {user.zwift_power_id ? `ZWID: ${user.zwift_power_id}` : `ZWID: ${user.id}`} • Registered: {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-2">
                      <span className={`w-fit px-5 py-2 rounded-xl text-sm font-black uppercase border shadow-lg ${
                        user.base_category === 'A+' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                        user.base_category === 'A' ? 'bg-red-500/20 text-red-500 border-red-500/30' :
                        user.base_category === 'B' ? 'bg-green-500/20 text-green-500 border-green-500/30' :
                        user.base_category === 'C' ? 'bg-sky-500/20 text-sky-400 border-sky-500/30' :
                        user.base_category === 'D' ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' :
                        'bg-zinc-800 text-zinc-500 border-zinc-700'
                      }`}>
                        CAT {user.base_category || '?'}
                      </span>
                      <span className="text-xs font-black text-zinc-400 uppercase tracking-[0.2em] ml-1">
                        {user.gender === 'M' ? 'Male' : user.gender === 'F' ? 'Female' : 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-zinc-400">
                      <Mail size={14} className="opacity-40" />
                      <span className="font-medium text-sm">{user.email}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-[0.15em] border shadow-md ${
                      user.role === 'admin' ? 'bg-red-500/20 text-red-500 border-red-500/30' :
                      user.role === 'moderator' ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30' :
                      user.role === 'captain' ? 'bg-orange-500/20 text-orange-500 border-orange-500/30' :
                      'bg-sky-500/20 text-sky-400 border-sky-500/30'
                    }`}>
                      {user.role === 'athlete' ? 'user' : user.role}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end items-center gap-4">
                      <select
                        value={user.base_category || ''}
                        disabled={updating === user.id}
                        onChange={(e) => handleCategoryChange(user.id, e.target.value)}
                        className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-[10px] font-black uppercase text-zinc-400 focus:border-inox-orange outline-none transition-all disabled:opacity-50"
                      >
                        <option value="">No Cat</option>
                        <option value="A">Cat A</option>
                        <option value="B">Cat B</option>
                        <option value="C">Cat C</option>
                        <option value="D">Cat D</option>
                        <option value="E">Cat E</option>
                      </select>

                      <select
                        value={user.role}
                        disabled={updating === user.id}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-[10px] font-black uppercase text-zinc-400 focus:border-inox-orange outline-none transition-all disabled:opacity-50"
                      >
                        <option value="athlete">User (Athlete)</option>
                        <option value="captain">Captain</option>
                        <option value="moderator">Moderator</option>
                        <option value="admin">Admin</option>
                      </select>
                      
                      <button
                        onClick={() => handleDeleteUser(user.id, user.username)}
                        disabled={updating === user.id}
                        className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-600 hover:text-red-500 hover:border-red-500/50 transition-all disabled:opacity-20"
                        title="Elimina Utente"
                      >
                        {updating === user.id ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && !loading && (
            <div className="p-20 text-center text-zinc-700 font-black italic uppercase tracking-widest">
              No users found matching filters.
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        <div className="p-8 border-t border-zinc-800 bg-black/20 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-zinc-800/50 p-2 rounded-xl border border-zinc-700/50">
              <Database size={18} className="text-zinc-500" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 leading-none">Total Records</p>
              <p className="text-xl font-black italic text-white leading-none mt-1">{filteredUsers.length}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:border-inox-orange transition-all disabled:opacity-20 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={20} />
            </button>
            
            <div className="flex items-center gap-2 px-4">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Page</span>
              <span className="text-lg font-black italic text-inox-orange">{currentPage}</span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">of {totalPages || 1}</span>
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:border-inox-orange transition-all disabled:opacity-20 disabled:cursor-not-allowed"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="text-[10px] font-black uppercase tracking-widest text-zinc-600 italic">
            Showing {Math.min(filteredUsers.length, (currentPage - 1) * usersPerPage + 1)}-{Math.min(filteredUsers.length, currentPage * usersPerPage)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
