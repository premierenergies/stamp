
export type UserRole = "sales" | "manager" | "common";

export interface User {
  username: string;
  role: UserRole;
  name: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
