"use client";

import { useState, useEffect, useCallback } from "react";
import { getAuth, setAuth, clearAuth, AuthUser } from "@/lib/auth";

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    setUser(auth);
    setIsLoading(false);
  }, []);

  const login = useCallback((email?: string) => {
    const newUser = setAuth(email);
    setUser(newUser);
    return newUser;
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    setUser(null);
  }, []);

  return {
    user,
    isLoggedIn: user?.isLoggedIn === true,
    isLoading,
    login,
    logout,
  };
}
