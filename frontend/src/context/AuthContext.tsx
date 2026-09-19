import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRahatStore } from '../store/useRahatStore';
import type { Role, UserProfile } from '../types/rahat';

interface AuthContextType {
  isLoading: boolean;
  isAuthenticated: boolean;
  currentUser: UserProfile | null;
  userRole: Role | null;
  login: (email: string, password: string) => Promise<string>;
  signup: (input: { name: string; email: string; phone: string; password: string; role: 'citizen' | 'volunteer' }) => Promise<string>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function portalForRole(role: Role): string {
  switch (role) {
    case 'citizen':
      return '/citizen';
    case 'volunteer':
      return '/volunteer';
    case 'coordinator':
      return '/admin';
    default:
      return '/login';
  }
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const initialize = useRahatStore((s) => s.initialize);
  const setCurrentUser = useRahatStore((s) => s.setCurrentUser);
  const findUserByEmail = useRahatStore((s) => s.findUserByEmail);
  const createAccount = useRahatStore((s) => s.createAccount);
  const getCurrentUser = useRahatStore((s) => s.getCurrentUser);
  const currentUserId = useRahatStore((s) => s.currentUserId);
  const users = useRahatStore((s) => s.users);
  const initialized = useRahatStore((s) => s.initialized);

  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUserState] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (initialized) {
      setCurrentUserState(getCurrentUser());
    }
  }, [initialized, currentUserId, users, getCurrentUser]);

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      await initialize();

      if (!mounted) return;

      const persistedId = localStorage.getItem('rahat_current_user_id');
      if (persistedId && !currentUserId) {
        await setCurrentUser(persistedId);
      }

      setIsLoading(false);
    };

    bootstrap();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<string> => {
      if (!email || !email.includes('@')) {
        throw new Error('Invalid email address');
      }

      if (!password || password.trim().length === 0) {
        throw new Error('Password cannot be empty');
      }

      const found = findUserByEmail(email);
      if (!found || found.password !== password) {
        throw new Error('Invalid credentials');
      }

      await setCurrentUser(found.id);
      return portalForRole(found.role);
    },
    [findUserByEmail, setCurrentUser]
  );

  const signup = useCallback(async (input: { name: string; email: string; phone: string; password: string; role: 'citizen' | 'volunteer' }) => {
    const result = createAccount(input);
    if (!result.ok || !result.userId) throw new Error(result.error || 'Unable to create account');
    await setCurrentUser(result.userId);
    return portalForRole(input.role);
  }, [createAccount, setCurrentUser]);

  const logout = useCallback(async (): Promise<void> => {
    await setCurrentUser(null);
  }, [setCurrentUser]);

  const userRole = currentUser ? currentUser.role : null;

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        isAuthenticated: currentUser != null,
        currentUser,
        userRole,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
