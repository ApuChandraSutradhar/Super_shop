import { createContext, useCallback, useContext, useRef, useState } from "react";
import { FiCheckCircle, FiLogIn, FiX } from "react-icons/fi";

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const loginActionRef = useRef(null);
  const dismissTimerRef = useRef(null);

  const dismissToast = useCallback(() => {
    window.clearTimeout(dismissTimerRef.current);
    setToast(null);
  }, []);

  const showToast = useCallback((nextToast) => {
    window.clearTimeout(dismissTimerRef.current);
    setToast(nextToast);
    dismissTimerRef.current = window.setTimeout(() => setToast(null), 3000);
  }, []);

  const showLoginRequired = useCallback(() => {
    showToast({ type: "login-required", message: "Please log in to add items to your cart!" });
  }, [showToast]);

  const showLoginSuccess = useCallback(() => {
    showToast({ type: "success", message: "Welcome Back! Login Successful." });
  }, [showToast]);

  const setLoginAction = useCallback((action) => {
    loginActionRef.current = action;
  }, []);

  const handleLogin = () => {
    dismissToast();
    loginActionRef.current?.();
  };

  return (
    <ToastContext.Provider value={{ showLoginRequired, showLoginSuccess, setLoginAction }}>
      {children}
      {toast && (
        <div className="fixed top-5 right-5 z-[100] w-[calc(100%-2.5rem)] max-w-sm animate-[toast-in_220ms_ease-out]" role="status" aria-live="polite">
          <div className="flex items-start gap-3 rounded-2xl border border-emerald-100 bg-white p-4 shadow-xl shadow-emerald-950/15">
            <FiCheckCircle className="mt-0.5 shrink-0 text-xl text-emerald-600" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold leading-5 text-[#064e3b]">{toast.message}</p>
              {toast.type === "login-required" && (
                <button type="button" onClick={handleLogin} className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#064e3b] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2">
                  <FiLogIn /> Login
                </button>
              )}
            </div>
            <button type="button" onClick={dismissToast} aria-label="Dismiss notification" className="shrink-0 rounded-md p-1 text-gray-400 transition hover:bg-emerald-50 hover:text-[#064e3b]">
              <FiX />
            </button>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
