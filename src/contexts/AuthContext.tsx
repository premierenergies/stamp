import React, { createContext, useContext, useEffect, useState } from "react";
import { AuthState, User } from "@/types/auth";

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Updated users array based on provided credentials
const users = [
  { id: "1", username: "s", password: "s", role: "sales", name: "Sales Team Member" },
  { id: "2", username: "p", password: "p", role: "manager", name: "Praful" },
  { id: "3", username: "a", password: "a", role: "common", name: "Common User 1" },
  { id: "4", username: "b", password: "b", role: "common", name: "Common User 2" },
  { id: "5", username: "c", password: "c", role: "common", name: "Common User 3" },
  { id: "6", username: "d", password: "d", role: "common", name: "Common User 4" },
  { id: "7", username: "e", password: "e", role: "common", name: "Common User 5" },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>(() => {
    const storedUser = localStorage.getItem("user");
    return {
      user: storedUser ? JSON.parse(storedUser) : null,
      isAuthenticated: !!storedUser,
    };
  });

  const login = async (username: string, password: string) => {
    const user = users.find(
      (u) => u.username === username && u.password === password
    );

    if (user) {
      const userData: User = {
        id: user.id,
        username: user.username,
        role: user.role,
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
