import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "@/utils/api";
import { useAuth } from "@/contexts/auth-context";
import {
  getConsultId,
  storeConsultId,
  clearAllConsultData,
} from "@/utils/patient-consult-utils";

type ConsultationStatus = "WAITING" | "ACTIVE" | "COMPLETE" | "NONE";

type ConsultationContextType = {
  status: ConsultationStatus;
  consultationId: string | null;
  isLoading: boolean;
  startPolling: () => void;
  stopPolling: () => void;
  killConsultation: () => Promise<void>;
  refreshStatus: () => Promise<void>;
  checkConsultationStatus: () => Promise<void>;
};

const ConsultationContext = createContext<ConsultationContextType | undefined>(undefined);

export const ConsultationProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, isGuest, isLoading: authLoading } = useAuth();
  const [status, setStatus] = useState<ConsultationStatus>("NONE");
  const [consultationId, setConsultationId] = useState<string | null>(getConsultId());
  const [isPolling, setIsPolling] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Set mounted state to prevent hydration mismatches
  useEffect(() => {
    setMounted(true);
  }, []);

  // Primary query: Check status of stored consultation ID if it exists
  const consultationQuery = api.consultation.getStatus.useQuery(
    { consultationId: consultationId! },
    {
      enabled: !!consultationId && mounted,
      refetchInterval: isPolling ? 5000 : false,
      staleTime: 30000,
      retry: false,
    }
  );

  const ongoingQuery = api.consultation.getOngoingConsultation.useQuery(
    undefined,
    {
      enabled: !!user && !consultationId && mounted,
      refetchOnWindowFocus: false,
      refetchInterval: false,
      staleTime: Infinity,
    }
  );  

  const endConsultationMutation = api.consultation.endConsultation.useMutation();

  // Determine loading state
  const isLoading = !mounted || authLoading || 
    (!!consultationId && consultationQuery.isPending) ||
    (!consultationId && !!user && ongoingQuery.isPending);

  useEffect(() => {
    if (!mounted || authLoading) return;

    let newStatus: ConsultationStatus = "NONE";
    let newConsultationId: string | null = null;

    // Priority 1: Use stored consultation ID if available and valid
    if (consultationId && consultationQuery.data) {
      const queryStatus = consultationQuery.data.status;
      setStatus(queryStatus as ConsultationStatus);

      // Consult done, finish up
      if (queryStatus === "COMPLETE") {
        clearAllConsultData();
        setConsultationId(null);
        setStatus("NONE");
        return;
      }
      return;
    }

    // Priority 2: Check for existing consultations when no stored ID
    if (!consultationId && user && ongoingQuery.data) {
      if (ongoingQuery.data.status === "ACTIVE") {
        newStatus = "ACTIVE";
        newConsultationId = ongoingQuery.data.consultationId;
      } else if (ongoingQuery.data.status === "WAITING") {
        newStatus = "WAITING";
        newConsultationId = ongoingQuery.data.consultationId;
      }

      // Update state if we found a consultation
      if (newConsultationId) {
        setStatus(newStatus);
        setConsultationId(newConsultationId);
        storeConsultId(newConsultationId);
        return;
      }

      // No consultation found - set to NONE only if query has loaded
      if (!ongoingQuery.isPending) {
        setStatus("NONE");
      }
    }
  }, [
    mounted,
    authLoading,
    user,
    consultationId,
    consultationQuery.data,
    ongoingQuery.data,
    ongoingQuery.isPending,
  ]);

  const startPolling = useCallback(() => setIsPolling(true), []);
  const stopPolling = useCallback(() => setIsPolling(false), []);

  useEffect(() => {
    if (status === "WAITING") startPolling();
    else stopPolling();
  }, [status, startPolling, stopPolling]);

  const refreshStatus = useCallback(async () => {
    /* Update consultation ID from localStorage in case it changed */
    const currentConsultId = getConsultId();
    if (currentConsultId !== consultationId) {
      setConsultationId(currentConsultId);
    }

    /* Trigger refetch of enabled queries */
    if (consultationId || currentConsultId) {
      await consultationQuery.refetch();
    } else if (user) {
      await ongoingQuery.refetch();
    }
  }, [
    consultationId,
    consultationQuery,
    ongoingQuery,
    user,
  ]);

  const killConsultation = useCallback(async () => {
    if (!consultationId) return;
    
    // End the consult by setting status to COMPLETE
    try {
      await endConsultationMutation.mutateAsync({ consultationId });
    } catch (err) {
      console.error(err);
      return;
    }
    
    // Reset all active consultation states
    clearAllConsultData();
    setStatus("NONE");
    setConsultationId(null);
    stopPolling();
  }, [consultationId, endConsultationMutation, stopPolling]);

  // Check for ongoing consultations
  const checkConsultationStatus = useCallback(async (): Promise<void> => {
    try {
      const result = await ongoingQuery.refetch();
      if (result.data?.consultationId) {
        setStatus(result.data.status as ConsultationStatus);
        setConsultationId(result.data.consultationId);
      }
      console.log("[ConsultationContext] Consultation status checked:", result.data?.status, "with ID:", result.data?.consultationId);
    } catch (error) {
      console.error("Error checking ongoing consultation:", error);
    }
  }, [ongoingQuery]);

  return (
    <ConsultationContext.Provider
      value={{
        status,
        consultationId,
        isLoading,
        startPolling,
        stopPolling,
        killConsultation,
        refreshStatus,
        checkConsultationStatus,
      }}
    >
      {children}
    </ConsultationContext.Provider>
  );
};

export const useConsultation = () => {
  const context = useContext(ConsultationContext);
  if (!context) throw new Error("useConsultation must be used within ConsultationProvider");
  return context;
};
