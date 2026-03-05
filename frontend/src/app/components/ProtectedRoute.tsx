import React from 'react';
import { Navigate } from 'react-router';
import { Scale } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div
        className="flex flex-col items-center justify-center h-screen gap-4"
        style={{ background: 'linear-gradient(135deg, #060B18 0%, #0A1020 50%, #060B18 100%)' }}
      >
        <div className="relative">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-xl shadow-amber-500/30">
            <Scale className="h-7 w-7 text-slate-900" />
          </div>
          <div className="absolute -inset-1 rounded-2xl border-2 border-amber-500/30 animate-ping" />
        </div>
        <div className="text-xs text-slate-600 tracking-widest uppercase">Loading…</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};