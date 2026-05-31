import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authService, type User } from '../services/auth.service';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<string | null>;
  register: (data: { email: string; password: string; nombres: string; apellidos: string; rol: 'familia' | 'cuidadora' }) => Promise<string | null>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = authService.getSession();
    if (session) setUser(session);
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<string | null> => {
    try {
      const u = await authService.login(email, password);
      if (u) {
        setUser(u);
        return null;
      }
      return 'Correo o contraseña incorrectos.';
    } catch (e: any) {
      return e.message;
    }
  };

  const register = async (data: { email: string; password: string; nombres: string; apellidos: string; rol: 'familia' | 'cuidadora' }): Promise<string | null> => {
    try {
      const u = await authService.register(data);
      setUser(u);
      return null;
    } catch (e: any) {
      return e.message;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
