import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import type { DashboardData } from "../types/dashboard";
import { generateDashboard } from "../services/openrouter";

const LS_DASHBOARD_KEY = "learnarena_dashboard";
const LS_KEY_KEY = "learnarena_openrouter_key";

interface DashboardContextValue {
  dashboardData: DashboardData | null;
  isLoading: boolean;
  error: string | null;
  showApiKeyModal: boolean;
  showNotesModal: boolean;
  generateFromNotes: (notes: string) => Promise<void>;
  resetDashboard: () => void;
  exportDashboard: () => void;
  setApiKey: (key: string) => void;
  dismissNotesModal: () => void;
  showNotesInput: () => void;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);

  // On mount: check localStorage for saved data and API key
  useEffect(() => {
    const hasKey = localStorage.getItem(LS_KEY_KEY);
    if (!hasKey) {
      setShowApiKeyModal(true);
      return;
    }

    // Try to load saved dashboard
    const saved = localStorage.getItem(LS_DASHBOARD_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as DashboardData;
        if (parsed.moduleTitle && parsed.synthesis) {
          setDashboardData(parsed);
          return; // Skip notes modal if we have a dashboard
        }
      } catch {
        // Corrupted data — clear it silently
        localStorage.removeItem(LS_DASHBOARD_KEY);
      }
    }

    // No saved dashboard — show notes modal
    setShowNotesModal(true);
  }, []);

  const setApiKey = useCallback((key: string) => {
    localStorage.setItem(LS_KEY_KEY, key);
    setShowApiKeyModal(false);
    // After saving key, show notes modal
    const saved = localStorage.getItem(LS_DASHBOARD_KEY);
    if (!saved) {
      setShowNotesModal(true);
    }
  }, []);

  const generateFromNotes = useCallback(async (notes: string) => {
    setIsLoading(true);
    setError(null);
    setShowNotesModal(false);

    try {
      const data = await generateDashboard(notes);
      setDashboardData(data);
      localStorage.setItem(LS_DASHBOARD_KEY, JSON.stringify(data));
    } catch (err: any) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(message);
      // Show notes modal again so user can retry
      setShowNotesModal(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetDashboard = useCallback(() => {
    setDashboardData(null);
    setError(null);
    localStorage.removeItem(LS_DASHBOARD_KEY);
    setShowNotesModal(true);
  }, []);

  const exportDashboard = useCallback(() => {
    if (!dashboardData) return;

    const json = JSON.stringify(dashboardData, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `learnarena-dashboard-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [dashboardData]);

  const dismissNotesModal = useCallback(() => {
    setShowNotesModal(false);
  }, []);

  const showNotesInput = useCallback(() => {
    setShowNotesModal(true);
  }, []);

  return (
    <DashboardContext.Provider
      value={{
        dashboardData,
        isLoading,
        error,
        showApiKeyModal,
        showNotesModal,
        generateFromNotes,
        resetDashboard,
        exportDashboard,
        setApiKey,
        dismissNotesModal,
        showNotesInput,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard(): DashboardContextValue {
  const ctx = useContext(DashboardContext);
  if (!ctx) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return ctx;
}