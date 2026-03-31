import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { UserData } from '../services/types'; // Keep as type import if only used for type checking
import { Users, Shield, User, Loader2 } from 'lucide-react';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data: UserData[] = await api.listUsers(); // Type the data
      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        setError('Formato dati non valido');
      }
    } catch (err: any) { // Explicitly type error for clarity
      setError(err.message || 'Errore nel caricamento utenti');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: number, newRole: string) => {
    setUpdating(userId);
    try {
      await api.updateUserRole(userId, newRole);
      setUsers(prev => prev.map((u: UserData) => u.id === userId ? { ...u, role: newRole } : u)); // Type 'prev' and 'u'
    } catch (err: any) { // Explicitly type error
      alert('Errore aggiornamento ruolo: ' + err.message);
    } finally {
      setUpdating(null);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 text-inox-orange">
      <Loader2 className="animate-spin mb-4" size={48} />
      <p className="font-black italic uppercase tracking-widest">Accessing User Database...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-end border-b border-zinc-800 pb-6">
        <div>
          <span className="text-red-500 font-black text-xs tracking-[0.3em] uppercase italic">System Administration</span>
          <h1 className="text-6xl font-black italic tracking-tighter leading-none mt-2 text-white uppercase">
            USER <span className="text-zinc-600">MANAGEMENT</span>
          </h1>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-xl flex items-center gap-3">
          <Shield size={18} className="text-red-500" />
          <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Security Level: Admin</span>
        </div>
      </header>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl font-bold italic text-center">
          {error}
        </div>
      )}

      <div className="bg-zinc-900/30 rounded-[2.5rem] border border-zinc-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-black/40 text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="px-8 py-5">User / Rider</th>
                <th className="px-8 py-5">Email Address</th>
                <th className="px-8 py-5">Current Role</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-zinc-800/20 transition-all group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-500 group-hover:border-inox-orange group-hover:text-inox-orange transition-all">
                        <User size={24} />
                      </div>
                      <div>
                        <div className="text-white font-black uppercase tracking-tight text-lg">{user.username}</div>
                        <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">ID: #{user.id} • Created: {new Date(user.created_at).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-zinc-400 font-medium">{user.email}</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      user.role === 'admin' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                      user.role === 'captain' ? 'bg-inox-orange/10 text-inox-orange border-inox-orange/20' :
                      'bg-inox-cyan/10 text-inox-cyan border-inox-cyan/20'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2">
                      <select
                        value={user.role}
                        disabled={updating === user.id}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-xs font-black uppercase text-zinc-400 focus:border-inox-orange outline-none transition-all disabled:opacity-50"
                      >
                        <option value="athlete">Athlete</option>
                        <option value="captain">Captain</option>
                        <option value="admin">Admin</option>
                        <option value="moderator">Moderator</option>
                      </select>
                      {updating === user.id && (
                        <div className="flex items-center px-2">
                          <Loader2 className="animate-spin text-inox-orange" size={16} />
                        </div>
                      )}
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
