import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';

const Login: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state && (location.state as any).message) {
      setSuccess((location.state as any).message);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('/api/login_auth', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('inox_token', data.token);
        navigate('/dashboard');
      } else {
        setError(data.message || 'Credenziali non valide.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Errore di connessione. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#0d0f11] relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#fc6719]/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#00f0ff]/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-md w-full bg-zinc-900/80 backdrop-blur-md rounded-3xl p-8 md:p-10 border border-zinc-800 shadow-[0_0_50px_rgba(252,103,25,0.15)] relative z-10">
        <h1 className="text-5xl font-black italic text-center mb-8 uppercase tracking-tighter text-white leading-none">
          RIDER <span className="text-inox-orange">ACCESS</span>
        </h1>
        
        {success && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl font-bold text-xs text-center uppercase tracking-widest">
            {success}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="identifier" className="block text-zinc-500 text-[10px] font-black mb-2 uppercase tracking-widest ml-1">
              Zwift ID o Email
            </label>
            <input
              type="text"
              id="identifier"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              placeholder="es: 3252657"
              className="w-full px-5 py-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-inox-orange/50 transition-all placeholder:text-zinc-800 font-medium"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-zinc-500 text-[10px] font-black mb-2 uppercase tracking-widest ml-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="•••••••••••••"
              autocomplete="current-password"
              className="w-full px-5 py-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-inox-orange/50 transition-all placeholder:text-zinc-800 font-medium"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-inox-orange to-orange-600 hover:from-orange-500 hover:to-orange-700 text-black font-black italic text-xl py-4 rounded-2xl transition-all transform active:scale-95 shadow-lg shadow-orange-950/20 uppercase tracking-wider"
          >
            {loading ? 'ACCESSO IN CORSO...' : 'ENTRA NEL PORTALE'}
          </button>

          {error && (
            <div className="text-center text-red-500 text-xs font-bold mt-4 bg-red-500/10 py-3 rounded-xl border border-red-500/20 uppercase tracking-widest">
              {error}
            </div>
          )}
        </form>
        
        <div className="text-center text-zinc-600 text-[10px] font-black uppercase tracking-[0.2em] mt-8">
          Non hai un account? <Link to="/register" className="text-inox-orange hover:text-white transition-all underline decoration-inox-orange/30 underline-offset-4">Registrati ora</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
