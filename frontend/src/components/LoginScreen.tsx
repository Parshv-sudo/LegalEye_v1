import React, { useState } from 'react';
import { Workspace } from '../types';
import { initialWorkspaces } from '../data/mockData';

import { authApi, api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface LoginScreenProps {
  onLogin: (workspace: Workspace) => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const { setCurrentUser, setGlobalRole } = useAuth();
  const [email, setEmail] = useState('admin');
  const [password, setPassword] = useState('password123');
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace>(initialWorkspaces[0]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      // In our dummy setup, username='admin', password='password123'. 
      // We pass 'email' as the username to the Django Token endpoint.
      const response = await authApi.login({ username: email, password });
      
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      
      // Update global api headers immediately
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
      
      setCurrentUser({
        id: 'u-admin',
        name: email === 'admin' ? 'Admin User' : email,
        email: `${email}@acme.com`
      });
      setGlobalRole('ADMIN');
      
      onLogin(selectedWorkspace);
    } catch (err: any) {

      console.error('Login failed', err);
      setError(err.response?.data?.detail || 'Invalid credentials or server unavailable.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#F0F2F5] text-[#1A1A1A]">
      {/* Left Brand & Workspace Selection Pane */}
      <div className="w-full md:w-1/2 bg-[#0A192F] text-white p-8 md:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden">
        {/* Subtle background ornamentation */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-96 h-96 rounded-full bg-[#2D5A27]/20 blur-3xl pointer-events-none"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded bg-[#115fd4] flex items-center justify-center font-bold text-white shadow-lg">
              <span className="material-symbols-outlined text-[24px]">visibility</span>
            </div>
            <div>
              <h1 className="font-heading font-bold text-2xl tracking-wide text-white">
                Legal &amp; Lens
              </h1>
              <p className="text-xs text-blue-200 uppercase tracking-widest font-sans">
                Litigation Intelligence Engine
              </p>
            </div>
          </div>

          <div className="my-8 md:my-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold leading-tight text-white mb-4">
              Precision Case Synthesis &amp; Contradiction Discovery.
            </h2>
            <p className="text-sm md:text-base text-gray-300 leading-relaxed font-sans max-w-md">
              Automated pleading extraction, evidentiary timeline reconstruction, and cross-document contradiction mapping for modern counsel.
            </p>
          </div>
        </div>

        {/* Recent Workspaces Card Stack */}
        <div className="relative z-10 pt-6">
          <p className="text-xs uppercase font-bold tracking-wider text-gray-400 mb-3">
            Select Active Workspace
          </p>
          <div className="space-y-2.5">
            {initialWorkspaces.map((ws) => (
              <button
                key={ws.id}
                type="button"
                onClick={() => setSelectedWorkspace(ws)}
                className={`w-full p-3.5 rounded-lg border text-left flex items-center justify-between transition-all cursor-pointer ${selectedWorkspace.id === ws.id
                  ? 'bg-[#101F38] border-[#115fd4] shadow-md ring-1 ring-[#115fd4]'
                  : 'bg-[#0E1B30] border-[#1E293B] hover:bg-[#101F38] opacity-80 hover:opacity-100'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded flex items-center justify-center text-xs font-bold text-white shadow-inner"
                    style={{ backgroundColor: ws.color }}
                  >
                    {ws.code}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{ws.name}</h3>
                    <p className="text-[11px] text-gray-400">{ws.lastAccessed}</p>
                  </div>
                </div>
                {selectedWorkspace.id === ws.id && (
                  <span className="material-symbols-outlined text-[#115fd4] text-[20px]">
                    check_circle
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Login Form Pane */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-12 lg:p-16 bg-white">
        <div className="w-full max-w-md space-y-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-[#0A192F]">
              Sign In to Practice
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Secure biometric &amp; enterprise Single Sign-On enabled
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-600 text-xs font-semibold">
              {error}
            </div>
          )}

          {infoMessage && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded text-blue-700 text-xs font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">info</span>
              {infoMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#1A1A1A] mb-1.5" htmlFor="email">
                Work Email
              </label>
              <div className="relative">
                <span className="material-symbols-outlined text-gray-400 absolute left-3 top-2.5 text-[20px]">
                  mail
                </span>
                <input
                  id="email"
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-300 rounded bg-white text-[#1A1A1A] focus:ring-1 focus:ring-[#0A192F] focus:border-[#0A192F]"
                  placeholder="name@firm.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-[#1A1A1A]" htmlFor="password">
                  Password / Passkey
                </label>
                <a href="#forgot" onClick={(e) => { e.preventDefault(); setInfoMessage('Password recovery is not yet configured. Contact your system administrator.'); setTimeout(() => setInfoMessage(null), 4000); }} className="text-[11px] text-[#115fd4] hover:underline cursor-pointer">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined text-gray-400 absolute left-3 top-2.5 text-[20px]">
                  lock
                </span>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-300 rounded bg-white text-[#1A1A1A] focus:ring-1 focus:ring-[#0A192F] focus:border-[#0A192F]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 bg-[#0A192F] hover:bg-[#115fd4] text-white font-semibold text-sm rounded shadow-md transition-colors flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <span>{loading ? 'Authenticating...' : 'Authenticate & Open Workspace'}</span>
              {!loading && <span className="material-symbols-outlined text-[18px]">arrow_forward</span>}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white text-gray-500 font-medium">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => { setInfoMessage('Google SSO is not configured. Using demo login.'); setTimeout(() => setInfoMessage(null), 3000); }}
              className="py-2.5 px-4 border border-gray-300 rounded text-xs font-semibold hover:bg-gray-50 flex items-center justify-center gap-2 text-gray-700 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px] text-red-500">cloud</span>
              Google Workspace
            </button>
            <button
              type="button"
              onClick={() => { setInfoMessage('Microsoft Entra SSO is not configured. Using demo login.'); setTimeout(() => setInfoMessage(null), 3000); }}
              className="py-2.5 px-4 border border-gray-300 rounded text-xs font-semibold hover:bg-gray-50 flex items-center justify-center gap-2 text-gray-700 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px] text-blue-600">domain</span>
              Microsoft Entra
            </button>
          </div>

          <p className="text-center text-[11px] text-gray-400">
            Encrypted with 256-bit AES • SOC2 Type II Certified
          </p>
        </div>
      </div>
    </div>
  );
}
