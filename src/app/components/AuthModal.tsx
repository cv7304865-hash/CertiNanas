import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User, Users, Shield, AlertCircle, KeyRound, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { SecurityVerification } from './SecurityVerification';

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

  const [showVerification, setShowVerification] = useState(false);
  const [pendingCredentials, setPendingCredentials] = useState<{ email: string; password: string } | null>(null);

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
        setShowVerification(false);
        setPendingCredentials(null);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!loginEmail || !loginPassword) { setError('Todos los campos son obligatorios.'); return; }
    setPendingCredentials({ email: loginEmail, password: loginPassword });
    setShowVerification(true);
  };

  const handleVerifiedLogin = async () => {
    if (!pendingCredentials) return;
    const err = await login(pendingCredentials.email, pendingCredentials.password);
    if (err) { setError(err); setShowVerification(false); setPendingCredentials(null); }
    else { setShowVerification(false); setPendingCredentials(null); onClose(); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!nombre || !email || !password) { setError('Todos los campos son obligatorios.'); return; }
    const parts = nombre.trim().split(' ');
    const nombres = parts[0] || '';
    const apellidos = parts.slice(1).join(' ') || '';
    if (!apellidos) { setError('Ingresa nombre y apellido completo.'); return; }
    setPendingCredentials({ email, password });
    setShowVerification(true);
  };

  const handleVerifiedRegister = async () => {
    if (!pendingCredentials) return;
    const parts = nombre.trim().split(' ');
    const nombres = parts[0] || '';
    const apellidos = parts.slice(1).join(' ') || '';
    const err = await register({ email: pendingCredentials.email, password: pendingCredentials.password, nombres, apellidos, rol: registerRole });
    if (err) { setError(err); setShowVerification(false); setPendingCredentials(null); }
    else { setShowVerification(false); setPendingCredentials(null); onClose(); }
  };

  const handleVerificationSuccess = () => {
    if (currentMode === 'login') handleVerifiedLogin();
    else handleVerifiedRegister();
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
          className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] backdrop-saturate-[1.4] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-3xl w-full max-w-md overflow-hidden relative my-8"
        >
          <button onClick={onClose} className="absolute top-4 right-4 p-2 text-[#6667AB] hover:text-white hover:bg-[rgba(33,6,53,0.4)] rounded-full transition-colors z-10">
            <X className="w-5 h-5" />
          </button>

          {showVerification ? (
            <SecurityVerification
              onSuccess={handleVerificationSuccess}
              onBack={() => { setShowVerification(false); setError(''); }}
            />
          ) : (
            <div className="p-8">
              {error && (
                <div className="mb-4 p-3 bg-[rgba(255,0,0,0.15)] border border-[rgba(255,0,0,0.3)] backdrop-blur-sm rounded-xl flex items-start gap-2 text-sm text-[#FF9999]">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />{error}
                </div>
              )}

              {/* Tabs */}
              <div className="bg-[rgba(33,6,53,0.4)] backdrop-blur-sm rounded-full p-1 inline-flex mb-8">
                <button
                  onClick={() => setCurrentMode('login')}
                  className={`py-2 px-5 text-sm font-bold transition-all rounded-full ${
                    currentMode === 'login' ? 'bg-[#F6A5C0] text-[#210635] shadow-sm' : 'text-[#6667AB] hover:text-white'
                  }`}
                >
                  Iniciar sesión
                </button>
                <button
                  onClick={() => setCurrentMode('register')}
                  className={`py-2 px-5 text-sm font-bold transition-all rounded-full ${
                    currentMode === 'register' ? 'bg-[#F6A5C0] text-[#210635] shadow-sm' : 'text-[#6667AB] hover:text-white'
                  }`}
                >
                  Registrarme
                </button>
              </div>

              {currentMode === 'login' ? (
                <form className="space-y-5" onSubmit={handleLogin}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-[rgba(33,6,53,0.5)] backdrop-blur-sm flex items-center justify-center border border-[rgba(255,255,255,0.1)]">
                      <KeyRound className="w-5 h-5 text-[#F5D5E0]" />
                    </div>
                    <h2 className="text-xl font-bold text-white">Iniciar sesión</h2>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#F5D5E0] mb-2">Correo electrónico *</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6667AB]" />
                      <input type="email" placeholder="ejemplo@correo.com" value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-[rgba(33,6,53,0.5)] border border-[rgba(255,255,255,0.3)] text-white placeholder:text-[#6667AB] backdrop-blur-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7B337E] focus:border-[#7B337E] transition-all" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#F5D5E0] mb-2">Contraseña *</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6667AB]" />
                      <input type="password" placeholder="••••••••" value={loginPassword} onChange={e => setLoginPassword(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-[rgba(33,6,53,0.5)] border border-[rgba(255,255,255,0.3)] text-white placeholder:text-[#6667AB] backdrop-blur-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7B337E] focus:border-[#7B337E] transition-all" />
                    </div>
                  </div>

                  {/* Demo Accounts */}
                  <div className="bg-[rgba(66,13,75,0.4)] backdrop-blur-sm rounded-xl p-4 border border-[rgba(255,255,255,0.08)]">
                    <p className="text-xs font-semibold text-[#F5D5E0] mb-3 uppercase tracking-wide">Cuentas de prueba</p>
                    <div className="space-y-2">
                      {[
                        { label: 'Admin', email: 'admin@certinanas.pe', pass: '123456' },
                        { label: 'Familia', email: 'familia@test.com', pass: '123456' },
                        { label: 'Cuidadora', email: 'cuidadora@test.com', pass: '123456' },
                      ].map((acc) => (
                        <button
                          key={acc.label}
                          type="button"
                          onClick={() => { setLoginEmail(acc.email); setLoginPassword(acc.pass); }}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-[rgba(33,6,53,0.3)] hover:bg-[rgba(33,6,53,0.5)] transition-colors text-left"
                        >
                          <div className="flex items-center gap-2">
                            {acc.label === 'Admin' ? <Shield className="w-3.5 h-3.5 text-[#F5D5E0]" /> :
                             acc.label === 'Familia' ? <Users className="w-3.5 h-3.5 text-[#F5D5E0]" /> :
                             <User className="w-3.5 h-3.5 text-[#F5D5E0]" />}
                            <span className="text-sm font-semibold text-[#F5D5E0]">{acc.label}</span>
                          </div>
                          <span className="text-xs text-[#6667AB] font-mono">{acc.email}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Footer Buttons */}
                  <div className="flex items-center justify-between gap-3 pt-2">
                    <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm font-semibold text-[#F5D5E0] hover:text-white transition-colors">
                      Cancelar
                    </button>
                    <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-[#7B337E] to-[#F6A5C0] text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg hover:opacity-90 text-sm flex items-center justify-center gap-2">
                      Ingresar <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              ) : (
                <form className="space-y-5" onSubmit={handleRegister}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-[rgba(33,6,53,0.5)] backdrop-blur-sm flex items-center justify-center border border-[rgba(255,255,255,0.1)]">
                      <User className="w-5 h-5 text-[#F5D5E0]" />
                    </div>
                    <h2 className="text-xl font-bold text-white">Registrarme</h2>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#F5D5E0] mb-2">Nombre completo *</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6667AB]" />
                      <input type="text" placeholder="Ej: María Pérez" value={nombre} onChange={e => setNombre(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-[rgba(33,6,53,0.5)] border border-[rgba(255,255,255,0.3)] text-white placeholder:text-[#6667AB] backdrop-blur-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7B337E] focus:border-[#7B337E] transition-all" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#F5D5E0] mb-2">Correo electrónico *</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6667AB]" />
                      <input type="email" placeholder="ejemplo@correo.com" value={email} onChange={e => setEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-[rgba(33,6,53,0.5)] border border-[rgba(255,255,255,0.3)] text-white placeholder:text-[#6667AB] backdrop-blur-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7B337E] focus:border-[#7B337E] transition-all" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#F5D5E0] mb-2">Contraseña *</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6667AB]" />
                      <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-[rgba(33,6,53,0.5)] border border-[rgba(255,255,255,0.3)] text-white placeholder:text-[#6667AB] backdrop-blur-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7B337E] focus:border-[#7B337E] transition-all" />
                    </div>
                  </div>

                  {/* Selector de tipo de cuenta */}
                  <div>
                    <label className="block text-sm font-semibold text-[#F5D5E0] mb-2">Tipo de cuenta</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button type="button" onClick={() => setRegisterRole('familia')}
                        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-all ${
                          registerRole === 'familia'
                            ? 'bg-[#CC8DB3]/20 backdrop-blur-sm border-[#CC8DB3]'
                            : 'bg-[rgba(33,6,53,0.4)] border-[rgba(255,255,255,0.2)] text-[#6667AB] hover:border-[rgba(255,255,255,0.4)]'
                        }`}>
                        <Users className={`w-5 h-5 ${registerRole === 'familia' ? 'text-[#CC8DB3]' : 'text-[#6667AB]'}`} />
                        <span className={`text-sm font-semibold ${registerRole === 'familia' ? 'text-white' : 'text-[#6667AB]'}`}>Familia</span>
                      </button>
                      <button type="button" onClick={() => setRegisterRole('cuidadora')}
                        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-all ${
                          registerRole === 'cuidadora'
                            ? 'bg-[#CC8DB3]/20 backdrop-blur-sm border-[#CC8DB3]'
                            : 'bg-[rgba(33,6,53,0.4)] border-[rgba(255,255,255,0.2)] text-[#6667AB] hover:border-[rgba(255,255,255,0.4)]'
                        }`}>
                        <Shield className={`w-5 h-5 ${registerRole === 'cuidadora' ? 'text-[#CC8DB3]' : 'text-[#6667AB]'}`} />
                        <span className={`text-sm font-semibold ${registerRole === 'cuidadora' ? 'text-white' : 'text-[#6667AB]'}`}>Cuidadora</span>
                      </button>
                    </div>
                  </div>

                  {/* Footer Buttons */}
                  <div className="flex items-center justify-between gap-3 pt-2">
                    <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm font-semibold text-[#F5D5E0] hover:text-white transition-colors">
                      Cancelar
                    </button>
                    <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-[#7B337E] to-[#F6A5C0] text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg hover:opacity-90 text-sm flex items-center justify-center gap-2">
                      Crear cuenta <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-center text-xs text-[#6667AB] pt-2">
                    Al registrarte aceptas nuestros{' '}
                    <button type="button" onClick={() => onOpenLegal('terms')} className="font-bold hover:underline text-[#CC8DB3]">Términos</button>
                    {' '}y{' '}
                    <button type="button" onClick={() => onOpenLegal('privacy')} className="font-bold hover:underline text-[#CC8DB3]">Política de Privacidad</button>
                  </p>
                </form>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
