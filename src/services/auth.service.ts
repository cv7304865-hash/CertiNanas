export interface User {
  id: number;
  email: string;
  nombres: string;
  apellidos: string;
  fotoPerfil?: string | null;
  rol: 'admin' | 'familia' | 'cuidadora';
}

const API = `${import.meta.env.VITE_API_URL || ''}/api/auth`;

export const authService = {
  async login(email: string, password: string): Promise<User | null> {
    let res;
    try {
      res = await fetch(`${API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
    } catch {
      throw new Error('No se pudo conectar con el servidor. ¿Está corriendo el backend?');
    }
    if (!res.ok) {
      let errMsg = 'Error al iniciar sesión (sin respuesta del servidor)';
      try { const data = await res.json(); errMsg = data.error || 'Error al iniciar sesión'; } catch {}
      throw new Error(errMsg);
    }
    const text = await res.text();
    if (!text) throw new Error('El servidor respondió vacío. Verifica que el backend esté corriendo.');
    const user = JSON.parse(text);
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
    let res;
    try {
      res = await fetch(`${API}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } catch {
      throw new Error('No se pudo conectar con el servidor.');
    }
    if (!res.ok) {
      try { const err = await res.json(); throw new Error(err.error || 'Error al registrarse'); }
      catch { throw new Error('Error al registrarse'); }
    }
    const text = await res.text();
    if (!text) throw new Error('El servidor respondió vacío.');
    const user = JSON.parse(text);
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
