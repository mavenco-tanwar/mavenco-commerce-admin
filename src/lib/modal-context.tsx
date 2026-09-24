'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { AlertTriangle, Trash2, Info, CheckCircle2, AlertCircle, X } from 'lucide-react';

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  type?: 'danger' | 'warning' | 'info';
}

export interface AlertOptions {
  title?: string;
  message: string;
  okLabel?: string;
  type?: 'info' | 'warning' | 'error' | 'success';
}

interface ModalContextType {
  confirm: (options: ConfirmOptions | string) => Promise<boolean>;
  alert: (options: AlertOptions | string) => Promise<void>;
}

const ModalContext = createContext<ModalContextType>({
  confirm: () => Promise.resolve(false),
  alert: () => Promise.resolve(),
});

let globalConfirmHandler: ((opts: ConfirmOptions | string) => Promise<boolean>) | null = null;
let globalAlertHandler: ((opts: AlertOptions | string) => Promise<void>) | null = null;

export const showConfirmModal = (options: ConfirmOptions | string): Promise<boolean> => {
  if (globalConfirmHandler) {
    return globalConfirmHandler(options);
  }
  return Promise.resolve(false);
};

export const showAlertModal = (options: AlertOptions | string): Promise<void> => {
  if (globalAlertHandler) {
    return globalAlertHandler(options);
  }
  return Promise.resolve();
};

export function ModalProvider({ children }: { children: React.ReactNode }) {
  // Confirm state
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    options: ConfirmOptions;
    resolve: (val: boolean) => void;
  } | null>(null);

  // Alert state
  const [alertState, setAlertState] = useState<{
    isOpen: boolean;
    options: AlertOptions;
    resolve: () => void;
  } | null>(null);

  const confirm = useCallback((options: ConfirmOptions | string): Promise<boolean> => {
    const opts: ConfirmOptions = typeof options === 'string' ? { message: options } : options;
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        options: opts,
        resolve,
      });
    });
  }, []);

  const alert = useCallback((options: AlertOptions | string): Promise<void> => {
    const opts: AlertOptions = typeof options === 'string' ? { message: options } : options;
    return new Promise((resolve) => {
      setAlertState({
        isOpen: true,
        options: opts,
        resolve,
      });
    });
  }, []);

  useEffect(() => {
    globalConfirmHandler = confirm;
    globalAlertHandler = alert;

    if (typeof window !== 'undefined') {
      (window as any).alert = (msg: string) => {
        alert(msg);
      };
    }

    return () => {
      globalConfirmHandler = null;
      globalAlertHandler = null;
    };
  }, [confirm, alert]);

  const handleConfirmClose = (result: boolean) => {
    if (confirmState) {
      confirmState.resolve(result);
      setConfirmState(null);
    }
  };

  const handleAlertClose = () => {
    if (alertState) {
      alertState.resolve();
      setAlertState(null);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (confirmState?.isOpen) {
        if (e.key === 'Escape') handleConfirmClose(false);
        if (e.key === 'Enter') handleConfirmClose(true);
      } else if (alertState?.isOpen) {
        if (e.key === 'Escape' || e.key === 'Enter') handleAlertClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [confirmState, alertState]);

  return (
    <ModalContext.Provider value={{ confirm, alert }}>
      {children}

      {/* ─── Custom Confirmation Modal ────────────────────────────────────── */}
      {confirmState?.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl bg-[#131622] border border-slate-800 p-6 shadow-2xl shadow-black/80 flex flex-col gap-5 animate-in zoom-in-95 duration-150">
            {/* Top row with content on left and close button strictly on the right */}
            <div className="flex items-start justify-between gap-3 w-full">
              <div className="flex items-start gap-3.5 flex-1 pr-2">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
                    confirmState.options.isDestructive !== false || confirmState.options.type === 'danger'
                      ? 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                      : confirmState.options.type === 'warning'
                      ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                      : 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400'
                  }`}
                >
                  {confirmState.options.isDestructive !== false || confirmState.options.type === 'danger' ? (
                    <Trash2 className="w-5 h-5" />
                  ) : confirmState.options.type === 'warning' ? (
                    <AlertTriangle className="w-5 h-5" />
                  ) : (
                    <Info className="w-5 h-5" />
                  )}
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white tracking-tight">
                    {confirmState.options.title || 'Are you sure?'}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                    {confirmState.options.message}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleConfirmClose(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors shrink-0 -mt-1 -mr-1"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Bottom action buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800/80 mt-1">
              <button
                type="button"
                onClick={() => handleConfirmClose(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-all"
              >
                {confirmState.options.cancelLabel || 'Cancel'}
              </button>
              <button
                type="button"
                autoFocus
                onClick={() => handleConfirmClose(true)}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg transition-all ${
                  confirmState.options.isDestructive !== false || confirmState.options.type === 'danger'
                    ? 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 shadow-rose-950/40 hover:scale-[1.02]'
                    : 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-indigo-950/40 hover:scale-[1.02]'
                }`}
              >
                {confirmState.options.confirmLabel || (confirmState.options.isDestructive !== false ? 'Confirm Delete' : 'Confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Custom Alert Modal ───────────────────────────────────────────── */}
      {alertState?.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl bg-[#131622] border border-slate-800 p-6 shadow-2xl shadow-black/80 flex flex-col gap-5 animate-in zoom-in-95 duration-150">
            {/* Top row with content on left and close button strictly on the right */}
            <div className="flex items-start justify-between gap-3 w-full">
              <div className="flex items-start gap-3.5 flex-1 pr-2">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
                    alertState.options.type === 'error'
                      ? 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                      : alertState.options.type === 'warning'
                      ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                      : alertState.options.type === 'success'
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                      : 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400'
                  }`}
                >
                  {alertState.options.type === 'error' && <AlertCircle className="w-5 h-5" />}
                  {alertState.options.type === 'warning' && <AlertTriangle className="w-5 h-5" />}
                  {alertState.options.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
                  {(!alertState.options.type || alertState.options.type === 'info') && <Info className="w-5 h-5" />}
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white tracking-tight">
                    {alertState.options.title || 'Attention'}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                    {alertState.options.message}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAlertClose}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors shrink-0 -mt-1 -mr-1"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-slate-800/80 mt-1">
              <button
                type="button"
                autoFocus
                onClick={handleAlertClose}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 hover:border-slate-600 transition-all shadow-md"
              >
                {alertState.options.okLabel || 'Understand & Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
}

export function useConfirm() {
  const { confirm } = useContext(ModalContext);
  return confirm;
}

export function useAlert() {
  const { alert } = useContext(ModalContext);
  return alert;
}

export function useModal() {
  return useContext(ModalContext);
}
