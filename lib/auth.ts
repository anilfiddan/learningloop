const AUTH_KEY = "ll_auth";

export interface AuthUser {
  isLoggedIn: boolean;
  email?: string;
  createdAt: string;
}

export function getAuth(): AuthUser | null {
  if (typeof window === "undefined") return null;
  
  try {
    const stored = localStorage.getItem(AUTH_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as AuthUser;
  } catch {
    return null;
  }
}

export function setAuth(email?: string): AuthUser {
  const user: AuthUser = {
    isLoggedIn: true,
    email: email || undefined,
    createdAt: new Date().toISOString(),
  };
  
  if (typeof window !== "undefined") {
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  }
  
  return user;
}

export function clearAuth(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(AUTH_KEY);
  }
}

export function isAuthenticated(): boolean {
  const auth = getAuth();
  return auth?.isLoggedIn === true;
}
