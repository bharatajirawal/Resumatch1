"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  user_type: string;
  is_verified: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { data: user, isLoading, refetch } = useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => {
      const token = localStorage.getItem("access_token");
      if (!token) return null;
      try {
        const response = await apiClient.get("/users/profile/");
        return response.data;
      } catch (error) {
        return null;
      }
    },
    enabled: isClient && !!(typeof window !== "undefined" && localStorage.getItem("access_token")),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  const logout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
