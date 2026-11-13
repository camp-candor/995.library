import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AuthContextType {
  authToken: string | null;
  setAuthToken: (token: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authToken, setAuthToken] = useState<string | null>(null);

  return <AuthContext.Provider value={{ authToken, setAuthToken }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
