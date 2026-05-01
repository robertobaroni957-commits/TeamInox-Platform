import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

const StravaCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Sincronizzazione con Strava in corso...');

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      setStatus('error');
      setMessage(`Errore Strava: ${error}`);
      return;
    }

    if (!code) {
      setStatus('error');
      setMessage('Codice di autorizzazione mancante.');
      return;
    }

    const exchangeCode = async () => {
      try {
        const response = await fetch('/api/strava-auth', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('inox_token')}`
          },
          body: JSON.stringify({ code })
        });

        const data = await response.json();
        if (data.success) {
          setStatus('success');
          setMessage('Account Strava collegato con successo!');
          setTimeout(() => navigate('/dashboard'), 2000);
        } else {
          throw new Error(data.error || 'Errore durante lo scambio dei token.');
        }
      } catch (err: any) {
        setStatus('error');
        setMessage(err.message);
      }
    };

    exchangeCode();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-10 text-center shadow-2xl">
        {status === 'loading' && (
          <div className="flex flex-col items-center">
            <Loader2 className="animate-spin text-[#fc6719] mb-6" size={48} />
            <h2 className="text-xl font-black italic text-white uppercase tracking-tighter">{message}</h2>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 mb-6 border border-green-500/20">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="text-xl font-black italic text-white uppercase tracking-tighter mb-2">{message}</h2>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Verrai reindirizzato alla War Room...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-6 border border-red-500/20">
              <AlertCircle size={32} />
            </div>
            <h2 className="text-xl font-black italic text-white uppercase tracking-tighter mb-4">{message}</h2>
            <button 
              onClick={() => navigate('/dashboard')}
              className="px-8 py-3 bg-white text-black font-black italic rounded-xl hover:bg-[#fc6719] hover:text-white transition-all uppercase text-xs tracking-widest"
            >
              Torna alla Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StravaCallback;
