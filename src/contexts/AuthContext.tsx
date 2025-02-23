
import React, { createContext, useContext, useEffect, useState } from "react";
import { AuthState, User } from "@/types/auth";

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mockUsers = [
  { username: "s", password: "s", role: "sales", name: "Sales Team Member" },
  { username: "p", password: "p", role: "manager", name: "Praful" },
  { username: "c", password: "c", role: "common", name: "Common User" },
] as const;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>(() => {
    const storedUser = localStorage.getItem("user");
    return {
      user: storedUser ? JSON.parse(storedUser) : null,
      isAuthenticated: !!storedUser,
    };
  });

  const login = async (username: string, password: string) => {
    const user = mockUsers.find(
      (u) => u.username === username && u.password === password
    );

    if (user) {
      const userData: User = {
        username: user.username,
        role: user.role as User["role"],
        name: user.name,
      };
      localStorage.setItem("user", JSON.stringify(userData));
      setAuthState({ user: userData, isAuthenticated: true });
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem("user");
    setAuthState({ user: null, isAuthenticated: false });
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
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
