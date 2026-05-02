import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../services/api';
import type { UserData } from '../../services/types'; 
import { Users, Shield, User, Loader2, Trash2, Mail, Calendar, Search, Filter } from 'lucide-react';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterGender, setFilterGender] = useState('');

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
        setUsers(data);
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
    const filtered = users.filter(user => {
      const matchesSearch = 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        user.id.toString().includes(searchTerm);
      
      const matchesRole = !filterRole || user.role === filterRole;
      const matchesCategory = !filterCategory || user.base_category === filterCategory;
      const matchesGender = !filterGender || user.gender === filterGender;

      return matchesSearch && matchesRole && matchesCategory && matchesGender;
    });

    return [...filtered].sort((a, b) => a.username.localeCompare(b.username));
  }, [users, searchTerm, filterRole, filterCategory, filterGender]);

  const [importing, setImporting] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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
      
      // Ricarica la lista utenti dopo l'import
      const updatedUsers = await api.listUsers();
      setUsers(updatedUsers);

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
            {importing ? <Loader2 size={16} className="animate-spin" /> : <Users size={16} />}
            {importing ? 'Importing...' : 'Importa Rider CSV/JSON'}
          </button>

          <div className="bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-xl flex items-center gap-3">
            <Shield size={18} className="text-red-500" />
            <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Security Level: Admin</span>
          </div>
        </div>
      </header>

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

      <div className="bg-zinc-900/30 rounded-[2.5rem] border border-zinc-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
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
              {filteredUsers.map((user: UserData) => (
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
                    <div className="flex flex-col gap-1">
                      <span className={`w-fit px-2 py-0.5 rounded text-[10px] font-black uppercase border ${
                        user.base_category === 'A' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                        user.base_category === 'B' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                        user.base_category === 'C' ? 'bg-inox-orange/10 text-inox-orange border-inox-orange/20' :
                        user.base_category === 'D' ? 'bg-inox-cyan/10 text-inox-cyan border-inox-cyan/20' :
                        'bg-zinc-800 text-zinc-500 border-zinc-700'
                      }`}>
                        CAT {user.base_category || '?'}
                      </span>
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
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
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      user.role === 'admin' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                      user.role === 'moderator' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                      user.role === 'captain' ? 'bg-inox-orange/10 text-inox-orange border-inox-orange/20' :
                      'bg-inox-cyan/10 text-inox-cyan border-inox-cyan/20'
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
          {users.length === 0 && !loading && (
            <div className="p-20 text-center text-zinc-700 font-black italic uppercase tracking-widest">
              No users found in database.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
