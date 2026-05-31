export interface User {
  id: number;
  email: string;
  nombres: string;
  apellidos: string;
  rol: 'familia' | 'cuidadora';
}

const API = `${import.meta.env.VITE_API_URL || ''}/api/auth`;

export const authService = {
  async login(email: string, password: string): Promise<User | null> {
    const res = await fetch(`${API}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Error al iniciar sesión');
    }
    const user = await res.json();
    sessionStorage.setItem('certinanas_session', JSON.stringify(user));
    return user;
  },

  async register(data: {
    email: string;
    password: string;
    nombres: string;
    apellidos: string;
    rol: 'familia' | 'cuidadora';
  }): Promise<User> {
    const res = await fetch(`${API}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Error al registrarse');
    }
    const user = await res.json();
    sessionStorage.setItem('certinanas_session', JSON.stringify(user));
    return user;
  },

  logout(): void {
    sessionStorage.removeItem('certinanas_session');
  },

  getSession(): User | null {
    try {
      const data = sessionStorage.getItem('certinanas_session');
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },
};
