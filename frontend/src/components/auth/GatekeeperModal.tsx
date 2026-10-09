import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Key, Fingerprint, Lock, CheckCircle2, AlertOctagon, Terminal, Sparkles, UserCheck } from 'lucide-react';
import { authApi, UserProfile } from '../../api/authApi';

interface GatekeeperModalProps {
  isOpen: boolean;
  onSuccess: (user: UserProfile) => void;
  onClose?: () => void;
  requiredRole?: string | null;
}

export const GatekeeperModal: React.FC<GatekeeperModalProps> = ({
  isOpen,
  onSuccess,
  onClose,
  requiredRole,
}) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('Admin@NetSentinel2026!');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);

  const personas = [
    {
      role: 'admin',
      name: 'Security Architect (Admin)',
      badge: 'Full Remediation Authority',
      user: 'admin',
      pass: 'Admin@NetSentinel2026!',
      color: 'border-rose-500/40 text-rose-300 bg-rose-950/20 hover:border-rose-400',
    },
    {
      role: 'operator',
      name: 'NOC Controller (Operator)',
      badge: 'What-If Simulations & Sandbox',
      user: 'operator',
      pass: 'Operator@NetSentinel2026!',
      color: 'border-cyan-500/40 text-cyan-300 bg-cyan-950/20 hover:border-cyan-400',
    },
    {
      role: 'viewer',
      name: 'Telemetry Observer (Viewer)',
      badge: 'Read-Only Telemetry Stream',
      user: 'viewer',
      pass: 'Viewer@NetSentinel2026!',
      color: 'border-slate-500/40 text-slate-300 bg-slate-900/30 hover:border-slate-400',
    },
  ];

  const handleLogin = async (overrideUser?: string, overridePass?: string) => {
    const u = overrideUser || username;
    const p = overridePass || password;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const userProfile = await authApi.login(u, p);
      setIsUnlocked(true);
      setTimeout(() => {
        onSuccess(userProfile);
        setIsUnlocked(false);
      }, 700);
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.detail || 'Invalid spatial token handshake. Access denied.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const selectPersona = (p: typeof personas[0]) => {
    setUsername(p.user);
    setPassword(p.pass);
    handleLogin(p.user, p.pass);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030712]/80 backdrop-blur-2xl">
        {/* Spatial Holographic Portal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className={`relative w-full max-w-lg p-7 rounded-2xl spatial-glass border border-white/[0.12] shadow-2xl overflow-hidden ${
            errorMessage ? 'animate-shake border-rose-500/50' : ''
          }`}
        >
          {/* Cosmic Glow Aurora Accent */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Modal Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-500/40 shadow-glow-cyan">
                {isUnlocked ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 animate-bounce" />
                ) : (
                  <Fingerprint className="w-6 h-6 text-noc-cyan animate-pulse" />
                )}
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-wide flex items-center space-x-2">
                  <span>Gatekeeper Spatial HUD</span>
                  <span className="px-2 py-0.5 text-[10px] font-mono bg-cyan-950 text-noc-cyan border border-cyan-800 rounded-full">
                    Zero-Trust RBAC
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Cryptographic HttpOnly Authentication Gateway
                </p>
              </div>
            </div>

            {onClose && (
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white text-xs font-mono px-2 py-1 rounded bg-white/[0.05]"
              >
                ESC
              </button>
            )}
          </div>

          {/* Role Elevation Warning if triggered by 403 */}
          {requiredRole && (
            <div className="mt-4 p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-xs text-amber-200 flex items-center space-x-2">
              <AlertOctagon className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Privilege elevation required: Action mandates <strong>{requiredRole}</strong> authority.</span>
            </div>
          )}

          {/* Error Message Feedback */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 rounded-xl bg-rose-950/50 border border-rose-500/50 text-xs text-rose-300 flex items-center space-x-2"
            >
              <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </motion.div>
          )}

          {/* Quick Demo Persona Access Matrix */}
          <div className="mt-5 space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>1-Click Biometric Persona Switch:</span>
            </span>

            <div className="grid grid-cols-1 gap-2">
              {personas.map((p) => (
                <button
                  key={p.role}
                  onClick={() => selectPersona(p)}
                  disabled={isLoading}
                  className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between group ${p.color}`}
                >
                  <div className="flex items-center space-x-2.5">
                    <UserCheck className="w-4 h-4 shrink-0 group-hover:scale-110 transition-transform" />
                    <div>
                      <div className="text-xs font-bold text-white">{p.name}</div>
                      <div className="text-[10px] opacity-75 font-mono">{p.badge}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/[0.08] text-white">
                    Authenticate
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Manual Credential Fallback */}
          <div className="mt-5 pt-4 border-t border-white/[0.08] space-y-3">
            <div className="space-y-2 text-xs font-mono">
              <div>
                <label className="text-slate-400 block mb-1">Username Identifier</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/[0.1] text-slate-200 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Cryptographic Secret</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/[0.1] text-slate-200 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <button
              onClick={() => handleLogin()}
              disabled={isLoading}
              className="w-full py-2.5 mt-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl text-xs shadow-glow-cyan transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Key className="w-3.5 h-3.5" />
                  <span>Verify Credentials & Issue HttpOnly JWTs</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
