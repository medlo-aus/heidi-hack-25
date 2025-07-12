import { useRouter } from "next/router";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/utils/api";
import { getPatientMedicalForm } from "@/utils/patient-consult-utils";
import { toast } from "sonner";
import { useCallback } from "react";
/**
 * Hook for joining active video call consultations
 * Handles token generation and navigation to video call page
 * 
 * @returns Object with joinCall function and loading state
 */
export function useJoinActiveCall() {
  const router = useRouter();
  const { user, isGuest } = useAuth();
  
  /* 
   * Get user names based on user type:
   * - Registered users: from User table via tRPC
   * - Guest users: from consultation record or form data
   */
  const userProfileQuery = api.user.getBasicDetails.useQuery(undefined, {
    enabled: !!user?.id && !isGuest,
  });

  const createTokenMutation = api.daily.createToken.useMutation();

  const getUserDisplayName = useCallback((consultationId: string) => {
    if (!isGuest && userProfileQuery.data) {
      /* Registered user: use data from User table */
      return `${userProfileQuery.data.firstName || ''} ${userProfileQuery.data.lastName || ''}`.trim();
    }
    
    if (isGuest) {
      /* Guest user: try to get names from patient medical form in localStorage */
      const formData = getPatientMedicalForm();
      if (formData?.firstName && formData?.lastName) {
        return `${formData.firstName} ${formData.lastName}`.trim();
      }
      
      /* 
       * Fallback: Guest user without form data (shouldn't happen in normal flow)
       * You could also fetch from consultation record here if needed
       */
      return "Guest User";
    }
    
    /* 
     * Fallback for any other cases - try user metadata first,
     * then email, then generic name
     */
    const metadataName = user?.user_metadata?.first_name && user?.user_metadata?.last_name 
      ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`.trim()
      : null;
      
    return metadataName || user?.email || "User";
  }, [isGuest, userProfileQuery.data, user]);

  const joinCall = useCallback(async (consultationId: string) => {
    if (!user?.id) {
      return;
    }

    const roomUrl = `${process.env.NEXT_PUBLIC_DAILY_VIDEO_URL}/consultation-${consultationId}`;
    const displayName = getUserDisplayName(consultationId);
    
    try {
      const { token } = await createTokenMutation.mutateAsync({
        roomUrl,
        authSubId: user.id,
        properties: {
          user_name: displayName,
        },
      });

      void router.push(`/video-call?roomUrl=${encodeURIComponent(roomUrl)}&t=${encodeURIComponent(token)}`);
    } catch (error) {
      toast.error("Failed to join video call");
      console.error("Failed to generate meeting token:", error);
    }
  }, [user?.id, getUserDisplayName, createTokenMutation.mutateAsync, router]);

  return {
    joinCall,
    isLoading: createTokenMutation.isPending,
  };
}
