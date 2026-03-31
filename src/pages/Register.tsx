import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Shield, Loader2, ArrowRight } from 'lucide-react';

const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Le password non coincidono.');
      return;
    }

    if (password.length < 8) {
      setError('La password deve essere di almeno 8 caratteri.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Registrazione successo
        navigate('/login', { state: { message: 'Registrazione completata! Effettua il primo accesso.' } });
      } else {
        setError(data.message || 'Errore durante la registrazione.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Errore di connessione. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#0d0f11] relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#fc6719]/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#00f0ff]/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-md w-full bg-zinc-900/80 backdrop-blur-md rounded-3xl p-8 md:p-10 border border-zinc-800 shadow-[0_0_50px_rgba(252,103,25,0.1)] relative z-10">
        <div className="text-center mb-10">
          <span className="text-inox-orange font-black text-[10px] tracking-[0.3em] uppercase italic">Join the Elite</span>
          <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white mt-2">
            NEW <span className="text-inox-orange">RIDER</span>
          </h1>
        </div>
        
        <form onSubmit={handleRegister} className="space-y-5">
          {/* USERNAME */}
          <div>
            <label className="block text-zinc-500 text-[10px] font-black mb-2 uppercase tracking-widest ml-1">Username / Nome</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Es: Mario Rossi"
                className="w-full pl-12 pr-5 py-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-inox-orange/50 focus:border-inox-orange/50 transition-all placeholder:text-zinc-800 font-medium"
              />
            </div>
          </div>

          {/* EMAIL */}
          <div>
            <label className="block text-zinc-500 text-[10px] font-black mb-2 uppercase tracking-widest ml-1">Email Ufficiale</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="atleta@inoxteam.it"
                className="w-full pl-12 pr-5 py-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-inox-orange/50 focus:border-inox-orange/50 transition-all placeholder:text-zinc-800 font-medium"
              />
            </div>
          </div>
          
          {/* PASSWORD */}
          <div>
            <label className="block text-zinc-500 text-[10px] font-black mb-2 uppercase tracking-widest ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Minimo 8 caratteri"
                className="w-full pl-12 pr-5 py-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-inox-orange/50 focus:border-inox-orange/50 transition-all placeholder:text-zinc-800 font-medium"
              />
            </div>
          </div>

          {/* CONFIRM PASSWORD */}
          <div>
            <label className="block text-zinc-500 text-[10px] font-black mb-2 uppercase tracking-widest ml-1">Conferma Password</label>
            <div className="relative">
              <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                required
                placeholder="Ripeti la password"
                className="w-full pl-12 pr-5 py-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-inox-orange/50 focus:border-inox-orange/50 transition-all placeholder:text-zinc-800 font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white hover:bg-inox-orange text-black font-black italic text-xl py-4 rounded-2xl transition-all transform active:scale-95 shadow-xl flex items-center justify-center gap-3 group disabled:opacity-50 disabled:hover:bg-white"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                CREAZIONE IN CORSO...
              </>
            ) : (
              <>
                REGISTER NOW
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
          
          {error && (
            <div className="text-center text-red-500 text-xs font-bold mt-4 bg-red-500/10 py-3 rounded-xl border border-red-500/20 uppercase tracking-widest">
              {error}
            </div>
          )}
        </form>
        
        <div className="text-center text-zinc-600 text-[10px] font-black uppercase tracking-[0.2em] mt-8">
          Hai già un account? <Link to="/login" className="text-inox-cyan hover:text-white transition-all underline decoration-inox-cyan/30 underline-offset-4">Accedi qui</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
