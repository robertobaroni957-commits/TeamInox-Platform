import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { api } from '../services/api';
import type { Role } from '../services/permissions';

type AccessState = 'loading' | 'allowed' | 'denied';

interface ZRLParticipantRouteProps {
  children: React.ReactNode;
}

const ZRLParticipantRoute: React.FC<ZRLParticipantRouteProps> = ({ children }) => {
  const location = useLocation();
  const token = localStorage.getItem('inox_token');
  const [accessState, setAccessState] = useState<AccessState>('loading');

  useEffect(() => {
    if (!token) {
      setAccessState('denied');
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const role = (payload.role || 'guest') as Role;

      if (payload.exp && Date.now() >= payload.exp * 1000) {
        localStorage.removeItem('inox_token');
        setAccessState('denied');
        return;
      }

      if (role === 'admin' || role === 'moderator' || role === 'captain') {
        setAccessState('allowed');
        return;
      }

      api
        .checkZRLParticipation()
        .then((isParticipant) => setAccessState(isParticipant ? 'allowed' : 'denied'))
        .catch(() => setAccessState('denied'));
    } catch {
      localStorage.removeItem('inox_token');
      setAccessState('denied');
    }
  }, [token]);

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (accessState === 'loading') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-[#fc6719] font-black italic text-xl animate-pulse uppercase tracking-[0.2em]">
          Verifica accesso ZRL...
        </div>
      </div>
    );
  }

  if (accessState === 'denied') {
    return <Navigate to="/zrl-operations" replace />;
  }

  return <>{children}</>;
};

export default ZRLParticipantRoute;