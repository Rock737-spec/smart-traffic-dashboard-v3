"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
} from "react";

import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Ambulance,
  Cpu,
  Database,
  Radio,
  Wifi,
  Bell,
  X,
} from "lucide-react";

export interface ToastItem {
  id: string;
  title: string;
  message: string;
  type:
    | "success"
    | "error"
    | "warning"
    | "info";
}

interface ContextType {
  showToast: (
    title: string,
    message: string,
    type?: ToastItem["type"]
  ) => void;
}

const ToastContext = createContext<ContextType>({
  showToast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

export default function ToastProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [toasts, setToasts] =
    useState<ToastItem[]>([]);

  const removeToast = useCallback(
    (id: string) => {
      setToasts((prev) =>
        prev.filter(
          (toast) => toast.id !== id
        )
      );
    },
    []
  );

  const showToast = useCallback(
    (
      title: string,
      message: string,
      type: ToastItem["type"] = "info"
    ) => {
      const id = crypto.randomUUID();

      setToasts((prev) => [
        ...prev,
        {
          id,
          title,
          message,
          type,
        },
      ]);

      setTimeout(() => {
        removeToast(id);
      }, 5000);
    },
    [removeToast]
  );

  function icon(
    title: string,
    type: ToastItem["type"]
  ) {
    if (title.includes("Ambulance"))
      return (
        <Ambulance
          size={26}
          className="text-cyan-400"
        />
      );

    if (title.includes("Firebase"))
      return (
        <Database
          size={26}
          className="text-orange-400"
        />
      );

    if (title.includes("Master"))
      return (
        <Cpu
          size={26}
          className="text-green-400"
        />
      );

    if (title.includes("Slave"))
      return (
        <Cpu
          size={26}
          className="text-blue-400"
        />
      );

    if (title.includes("NRF24"))
      return (
        <Radio
          size={26}
          className="text-violet-400"
        />
      );

    if (title.includes("WiFi"))
      return (
        <Wifi
          size={26}
          className="text-cyan-400"
        />
      );

    switch (type) {
      case "success":
        return (
          <CheckCircle2
            size={26}
            className="text-green-400"
          />
        );

      case "error":
        return (
          <XCircle
            size={26}
            className="text-red-400"
          />
        );

      case "warning":
        return (
          <AlertTriangle
            size={26}
            className="text-yellow-400"
          />
        );

      default:
        return (
          <Bell
            size={26}
            className="text-cyan-400"
          />
        );
    }
  }

  function borderColor(
    type: ToastItem["type"]
  ) {
    switch (type) {
      case "success":
        return "border-green-500";

      case "error":
        return "border-red-500";

      case "warning":
        return "border-yellow-500";

      default:
        return "border-cyan-500";
    }
  }

  return (
    <ToastContext.Provider
      value={{
        showToast,
      }}
    >
      {children}

      <div className="fixed top-5 right-5 z-[9999] space-y-4">

        {toasts.map((toast) => (

          <div
            key={toast.id}
            className={`relative overflow-hidden w-[380px]
            rounded-2xl border-l-4
            ${borderColor(
              toast.type
            )}
            bg-slate-900/95
            backdrop-blur-xl
            border border-slate-700
            shadow-[0_10px_35px_rgba(0,0,0,.45)]
            toast-enter`}
          >

            <div className="flex gap-4 p-5">

              <div className="mt-1">
                {icon(
                  toast.title,
                  toast.type
                )}
              </div>

              <div className="flex-1">

                <div className="flex justify-between items-center">

                  <h3 className="font-bold text-white text-base">
                    {toast.title}
                  </h3>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeToast(
                        toast.id
                      );
                    }}
                    className="rounded-full p-1 hover:bg-slate-700 transition"
                  >
                    <X
                      size={18}
                      className="text-slate-400 hover:text-white"
                    />
                  </button>

                </div>

                <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                  {toast.message}
                </p>

                <div className="mt-3 text-xs text-slate-500">
                  {new Date().toLocaleTimeString()}
                </div>

              </div>

            </div>

            <div className="absolute bottom-0 left-0 h-1 w-full bg-slate-800">

              <div
                className={`h-full ${
                  toast.type === "success"
                    ? "bg-green-500"
                    : toast.type === "error"
                    ? "bg-red-500"
                    : toast.type === "warning"
                    ? "bg-yellow-400"
                    : "bg-cyan-400"
                } toast-progress`}
              />

            </div>

          </div>

        ))}

      </div>

    </ToastContext.Provider>
  );
}