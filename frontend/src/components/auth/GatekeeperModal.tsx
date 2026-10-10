import React, { useState } from 'react';
import { Shield, Key, Lock, CheckCircle2, AlertOctagon, UserCheck } from 'lucide-react';
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
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);

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
        err.response?.data?.detail || 'Authentication failed. Please check credentials.'
      );
    } finally {
      setIsLoading(false);
    }
  };



  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div
        className={`relative w-full max-w-lg p-7 rounded-xl bg-white border shadow-2xl overflow-hidden ${
          errorMessage ? 'border-red-300 animate-shake' : 'border-slate-200'
        }`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded bg-nms-primary/10 border border-nms-primary/20">
              {isUnlocked ? (
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              ) : (
                <Shield className="w-6 h-6 text-nms-primary" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 tracking-wide flex items-center space-x-2">
                <span>System Authentication</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Login to access secure actions
              </p>
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 text-xs font-mono px-2 py-1 rounded"
            >
              Close
            </button>
          )}
        </div>

        {/* Role Elevation Warning if triggered by 403 */}
        {requiredRole && (
          <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center space-x-2">
            <AlertOctagon className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Privilege elevation required: Action mandates <strong>{requiredRole}</strong> authority.</span>
          </div>
        )}

        {/* Error Message Feedback */}
        {errorMessage && (
          <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800 flex items-center space-x-2">
            <AlertOctagon className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}



        {/* Manual Credential Fallback */}
        <div className="mt-5 pt-4 border-t border-slate-100 space-y-3">
          <div className="space-y-2 text-xs font-mono">
            <div>
              <label className="text-slate-600 font-bold block mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-800 focus:outline-none focus:border-nms-primary focus:ring-1 focus:ring-nms-primary"
              />
            </div>

            <div>
              <label className="text-slate-600 font-bold block mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-800 focus:outline-none focus:border-nms-primary focus:ring-1 focus:ring-nms-primary"
              />
            </div>
          </div>

          <button
            onClick={() => handleLogin()}
            disabled={isLoading}
            className="w-full py-2.5 mt-2 bg-nms-primary hover:bg-nms-primaryHover text-white font-bold rounded-lg text-sm transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Key className="w-4 h-4" />
                <span>Verify Credentials</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
