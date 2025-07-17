"use client";
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useRef,
} from "react"; // useRef importado aqui

interface ToastMessage {
  id: number;
  message: string;
  type: "success" | "error";
}

interface ToastContextType {
  addToast: (message: string, type: "success" | "error") => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  const addToast = useCallback(
    (message: string, type: "success" | "error" = "success") => {
      // Limpa o timer anterior para que a notificação antiga desapareça imediatamente
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }

      const id = Date.now();
      setToast({ id, message, type });

      // Define um novo timer para remover a notificação atual
      toastTimerRef.current = setTimeout(() => {
        setToast(null);
      }, 3000);
    },
    []
  );

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center space-y-2">
        {toast && (
          <div
            key={toast.id}
            className={`px-4 py-3 rounded-lg shadow-lg text-white font-semibold animate-fade-in-down ${
              toast.type === "success" ? "bg-emerald-500" : "bg-red-500"
            }`}
          >
            {toast.message}
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
