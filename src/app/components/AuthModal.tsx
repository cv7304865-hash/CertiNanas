import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User, Users, Shield, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'login' | 'register';
  onOpenLegal: (type: 'terms' | 'privacy') => void;
}

export function AuthModal({ isOpen, onClose, mode: initialMode, onOpenLegal }: AuthModalProps) {
  const { login, register } = useAuth();
  const [currentMode, setCurrentMode] = useState<'login' | 'register'>(initialMode);
  const [registerRole, setRegisterRole] = useState<'familia' | 'cuidadora'>('familia');
  const [error, setError] = useState('');

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    setCurrentMode(initialMode);
  }, [initialMode, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setRegisterRole('familia');
        setError('');
        setLoginEmail('');
        setLoginPassword('');
        setNombre('');
        setEmail('');
        setPassword('');
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!loginEmail || !loginPassword) { setError('Todos los campos son obligatorios.'); return; }
    const err = await login(loginEmail, loginPassword);
    if (err) setError(err); else onClose();
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!nombre || !email || !password) { setError('Todos los campos son obligatorios.'); return; }
    const parts = nombre.trim().split(' ');
    const nombres = parts[0] || '';
    const apellidos = parts.slice(1).join(' ') || '';
    if (!apellidos) { setError('Ingresa nombre y apellido completo.'); return; }
    const err = await register({ email, password, nombres, apellidos, rol: registerRole });
    if (err) setError(err); else onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#210635]/50 backdrop-blur-sm overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 30 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={e => e.stopPropagation()}
          className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-3xl w-full max-w-md overflow-hidden relative my-8"
        >
          <button onClick={onClose} className="absolute top-4 right-4 p-2 text-[#6667AB] hover:text-white hover:bg-[rgba(33,6,53,0.4)] rounded-full transition-colors z-10">
            <X className="w-5 h-5" />
          </button>

          <div className="p-8">
            {error && (
              <div className="mb-4 p-3 bg-[rgba(255,0,0,0.15)] border-[rgba(255,0,0,0.3)] backdrop-blur-sm rounded-xl flex items-start gap-2 text-sm text-[#FF9999]">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />{error}
              </div>
            )}

            {/* Tabs: Registrarme / Iniciar sesión */}
            <div className="bg-[rgba(33,6,53,0.4)] backdrop-blur-sm rounded-full p-1 inline-flex mb-8">
              <button
                onClick={() => setCurrentMode('register')}
                className={`py-2 px-4 text-sm font-bold transition-all rounded-full ${
                  currentMode === 'register' ? 'bg-[#F6A5C0] text-[#210635] shadow-sm' : 'text-[#6667AB] hover:text-white'
                }`}
              >
                Registrarme
              </button>
              <button
                onClick={() => setCurrentMode('login')}
                className={`py-2 px-4 text-sm font-bold transition-all rounded-full ${
                  currentMode === 'login' ? 'bg-[#F6A5C0] text-[#210635] shadow-sm' : 'text-[#6667AB] hover:text-white'
                }`}
              >
                Iniciar sesión
              </button>
            </div>

            {currentMode === 'login' ? (
              <form className="space-y-5" onSubmit={handleLogin}>
                <h2 className="text-2xl font-bold text-center text-white">
                  Bienvenido a <span className="text-[#CC8DB3]">CERTINANAS</span>
                </h2>
                <p className="text-[#6667AB] text-sm text-center">Ingresa a tu cuenta</p>

                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6667AB]" />
                  <input type="email" placeholder="Correo electrónico" value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-[rgba(33,6,53,0.5)] border-[rgba(255,255,255,0.3)] text-white placeholder:text-[#6667AB] backdrop-blur-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7B337E] focus:border-[#7B337E] transition-all" />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6667AB]" />
                  <input type="password" placeholder="Contraseña" value={loginPassword} onChange={e => setLoginPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-[rgba(33,6,53,0.5)] border-[rgba(255,255,255,0.3)] text-white placeholder:text-[#6667AB] backdrop-blur-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7B337E] focus:border-[#7B337E] transition-all" />
                </div>
                <button type="submit" className="w-full py-3.5 bg-[#F6A5C0] text-[#210635] rounded-xl font-bold transition-all shadow-md hover:brightness-110">
                  Iniciar sesión
                </button>
                <p className="text-center text-sm text-[#6667AB]">
                  ¿No tienes cuenta?{' '}
                  <button type="button" onClick={() => { setCurrentMode('register'); setError(''); }} className="font-bold hover:underline text-[#CC8DB3]">
                    Regístrate
                  </button>
                </p>
              </form>
            ) : (
              <form className="space-y-5" onSubmit={handleRegister}>
                <h2 className="text-2xl font-bold text-center text-white">
                  Únete a <span className="text-[#CC8DB3]">CERTINANAS</span>
                </h2>
                <p className="text-[#6667AB] text-sm text-center">Crea tu cuenta para comenzar</p>

                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6667AB]" />
                  <input type="text" placeholder="Nombre completo" value={nombre} onChange={e => setNombre(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-[rgba(33,6,53,0.5)] border-[rgba(255,255,255,0.3)] text-white placeholder:text-[#6667AB] backdrop-blur-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7B337E] focus:border-[#7B337E] transition-all" />
                </div>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6667AB]" />
                  <input type="email" placeholder="Correo electrónico" value={email} onChange={e => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-[rgba(33,6,53,0.5)] border-[rgba(255,255,255,0.3)] text-white placeholder:text-[#6667AB] backdrop-blur-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7B337E] focus:border-[#7B337E] transition-all" />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6667AB]" />
                  <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-[rgba(33,6,53,0.5)] border-[rgba(255,255,255,0.3)] text-white placeholder:text-[#6667AB] backdrop-blur-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7B337E] focus:border-[#7B337E] transition-all" />
                </div>

                {/* Selector de tipo de cuenta */}
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setRegisterRole('familia')}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-all ${
                      registerRole === 'familia'
                        ? 'bg-[#CC8DB3]/20 backdrop-blur-sm border-[#cc8db3]'
                        : 'bg-[rgba(33,6,53,0.4)] border-[rgba(255,255,255,0.2)] text-[#6667AB] hover:border-[rgba(255,255,255,0.4)]'
                    }`}>
                    <Users className={`w-5 h-5 ${registerRole === 'familia' ? 'text-[#CC8DB3]' : 'text-[#6667AB]'}`} />
                    <span className={`text-sm font-semibold ${registerRole === 'familia' ? 'text-white' : 'text-[#6667AB]'}`}>Familia</span>
                  </button>
                  <button type="button" onClick={() => setRegisterRole('cuidadora')}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-all ${
                      registerRole === 'cuidadora'
                        ? 'bg-[#CC8DB3]/20 backdrop-blur-sm border-[#cc8db3]'
                        : 'bg-[rgba(33,6,53,0.4)] border-[rgba(255,255,255,0.2)] text-[#6667AB] hover:border-[rgba(255,255,255,0.4)]'
                    }`}>
                    <Shield className={`w-5 h-5 ${registerRole === 'cuidadora' ? 'text-[#CC8DB3]' : 'text-[#6667AB]'}`} />
                    <span className={`text-sm font-semibold ${registerRole === 'cuidadora' ? 'text-white' : 'text-[#6667AB]'}`}>Cuidadora</span>
                  </button>
                </div>

                <button type="submit" className="w-full py-3.5 bg-[#F6A5C0] text-[#210635] rounded-xl font-bold transition-all shadow-md hover:brightness-110">
                  Crear cuenta
                </button>
                <p className="text-center text-sm text-[#6667AB]">
                  ¿Ya tienes cuenta?{' '}
                  <button type="button" onClick={() => { setCurrentMode('login'); setError(''); }} className="font-bold hover:underline text-[#CC8DB3]">
                    Inicia sesión
                  </button>
                </p>
              </form>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
