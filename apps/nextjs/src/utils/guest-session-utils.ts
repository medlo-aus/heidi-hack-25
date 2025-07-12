const GUEST_SESSION_KEY = "guest-session";

// --- Guest Session ---
export const getGuestSession = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(GUEST_SESSION_KEY);
};

export const setGuestSession = (sessionData: string): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(GUEST_SESSION_KEY, sessionData);
};

export const clearGuestSession = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(GUEST_SESSION_KEY);
};

export const guestSessionExists = (): boolean => {
  if (typeof window === "undefined") return false;
  return getGuestSession() !== null;
};
