import { supabase } from "@/utils/supabase/browser";
import { type SupabaseClient } from "@supabase/supabase-js";
import { useQueries, useQuery } from "@tanstack/react-query";

import { useMe } from "./useMe";

export type FileObject = {
  name: string;
  id: string;
  metadata: {
    mimetype?: string;
  };
  accessUrl?: string;
  accessUrlBase64?: string | null;
};

/**
 * Base hook for fetching user's files from Supabase storage
 * Files are stored in user-specific folders using their authSub ID
 * Now accepts an optional userId for admins to fetch specific users' files
 */
export const useMyFiles = (userId?: string) => {
  const user = useMe();
  // Use the singleton supabase client
// const supabase = createClient();

  const targetUserId = userId && user?.isAdmin ? userId : user.data?.authSub;

  return useQuery({
    queryKey: ["user-files", targetUserId],
    queryFn: async () => {
      if (!targetUserId) {
        throw new Error("No authenticated user or target user ID provided");
      }

      const { data, error } = await supabase.storage
        .from("attachments")
        .list(targetUserId, {
          sortBy: { column: "name", order: "asc" },
        });

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!targetUserId,
  });
};

/**
 * Hook to get a single file with signed URL
 * Accepts an optional userId for admins to fetch specific users' files
 * Signed URL expires after 60 seconds for security
 */
export const useMyIndividualFileFull = (name: string, userId?: string) => {
  const user = useMe();
  // Use the singleton supabase client
// const supabase = createClient();

  const targetUserId = userId && user?.isAdmin ? userId : user.data?.authSub;

  return useQuery({
    queryKey: ["user-file-with-url", targetUserId, name],
    queryFn: () => _fetchFileWithUrl(name, targetUserId, supabase),
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 24,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
    enabled: !!targetUserId && !!name,
  });
};

/**
 * Hook to get multiple files with signed URLs
 * Accepts an optional userId for admins to fetch specific users' files
 */
export const useMultipleFilesWithUrl = (names: string[], userId?: string) => {
  const user = useMe();
  // Use the singleton supabase client
// const supabase = createClient();

  const targetUserId = userId && user?.isAdmin ? userId : user.data?.authSub;

  const queries = useQueries({
    queries: names.map((name) => ({
      queryKey: ["user-file-with-url", targetUserId, name],
      queryFn: () => _fetchFileWithUrl(name, targetUserId, supabase),
      staleTime: 1000 * 60 * 60 * 24, // 24 hours
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchInterval: Infinity,
      enabled: !!targetUserId && !!name,
    })),
    combine: (results) => {
      return {
        data:
          results.length > 0
            ? results
                .map((result) => ({
                  ...result.data,
                  isPending: result.isLoading,
                  refetch: result.refetch,
                }))
                .filter((file) => !!file?.name)
            : [],
        isPending: results.some((result) => result.isPending),
        isError: results.some((result) => result.isError),
      };
    },
  });

  return queries;
};

/**
 * Extended hook that includes signed URLs for each file
 * Accepts an optional userId for admins to fetch specific users' files
 */
export const useMyFilesFull = (userId?: string) => {
  const user = useMe();
  // Use the singleton supabase client
// const supabase = createClient();
  const { data: files } = useMyFiles(userId);

  const targetUserId = userId && user?.isAdmin ? userId : user.data?.authSub;

  const queries = useQueries({
    queries: (files ?? []).map((file) => ({
      queryKey: ["user-file-with-url", targetUserId, file.name],
      queryFn: () => _fetchFileWithUrl(file.name, targetUserId, supabase),
      staleTime: 1000 * 60 * 60 * 24, // 24 hours
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchInterval: Infinity,
      enabled: !!targetUserId && files && files.length > 0,
    })),
    combine: (results) => {
      return {
        data: results.map((result) => result.data),
        isPending: results.some((result) => result.isPending),
        isError: results.some((result) => result.isError),
      };
    },
  });

  return queries;
};

/**
 * Helper function consumed by useMyIndividualFileFull and useMultipleFilesWithUrl
 * Now accepts targetUserId instead of user object
 */
const _fetchFileWithUrl = async (
  name: string,
  targetUserId: string,
  supabase: SupabaseClient,
) => {
  if (!targetUserId) {
    throw new Error("No authenticated user or target user ID provided");
  }

  const { data: files, error } = await supabase.storage
    .from("attachments")
    .list(targetUserId, {
      search: name,
    });

  // may be able to optimize by going direct to info
  // const { data: files, error } = await supabase.storage
  // .from("attachments").info().then(r=>r.data.)

  if (error) throw error;

  const file = files[0];
  if (!file) return null;

  const accessTimeInSeconds = 120;
  const { data: accessData, error: accessError } = await supabase.storage
    .from("attachments")
    .createSignedUrl(`${targetUserId}/${file.name}`, accessTimeInSeconds);
  const receivedTime = new Date();
  const expiresTime = new Date(
    receivedTime.getTime() + accessTimeInSeconds * 1000 - 1000,
  );

  if (!accessData?.signedUrl) return null;

  let accessUrlBase64 = null;
  if (file.metadata.mimetype?.startsWith("image/")) {
    // Only fetch and convert to base64 if it's an image
    const response = await fetch(accessData.signedUrl);
    const blob = await response.blob();
    const base64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
    accessUrlBase64 = base64;
  }

  return {
    ...file,
    accessUrl: accessData.signedUrl,
    accessUrlBase64,
    expiresTime,
  };
};
