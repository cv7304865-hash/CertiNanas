import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User, Users, Shield, AlertCircle, KeyRound, ChevronRight, Check, ShieldCheck, House, BookHeart, Heart, TreePine } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { RoleSelection } from './RoleSelection';
import { RegistrationForm } from './RegistrationForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'login' | 'register';
  onOpenLegal: (type: 'terms' | 'privacy') => void;
}

const CAPTCHA_OPTIONS = [
  { id: 'house', icon: House, label: 'Casa' },
  { id: 'books', icon: BookHeart, label: 'Libros' },
  { id: 'heart', icon: Heart, label: 'Corazón' },
  { id: 'tree', icon: TreePine, label: 'Árbol' },
];

const TARGET_ID = 'heart';

function CaptchaChallenge({ onSuccess, onClose }: { onSuccess: () => void; onClose: () => void }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState(false);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setError(false);
    if (id === TARGET_ID) {
      setTimeout(() => onSuccess(), 300);
    } else {
      setError(true);
      setTimeout(() => setSelectedId(null), 600);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-30 flex items-center justify-center bg-[#210635]/70 backdrop-blur-sm rounded-3xl p-6"
      onClick={e => e.stopPropagation()}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-[rgba(33,6,53,0.9)] backdrop-blur-[20px] backdrop-saturate-[1.4] border border-[rgba(255,255,255,0.2)] rounded-2xl p-4 shadow-xl w-full max-w-[220px]"
      >
        <div className="flex items-center justify-center gap-1.5 mb-1">
          <ShieldCheck className="w-3 h-3 text-[#6667AB]" />
          <span className="text-[10px] font-semibold text-[#6667AB] uppercase tracking-wide">Verificación de seguridad</span>
        </div>
        <p className="text-sm font-bold text-white text-center mt-1.5 mb-3">
          Selecciona el <span className="text-[#CC8DB3]">corazón</span> <span className="inline-block">🤍</span>
        </p>

        <div className="grid grid-cols-2 gap-2 mb-3">
          {CAPTCHA_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isSelected = selectedId === opt.id;
            const isWrong = error && isSelected;
            const isCorrect = isSelected && opt.id === TARGET_ID;

            return (
              <motion.button
                key={opt.id}
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSelect(opt.id)}
                className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border-2 transition-all cursor-pointer ${
                  isCorrect
                    ? 'border-emerald-400 bg-emerald-400/10'
                    : isWrong
                      ? 'border-red-400 bg-red-400/10'
                      : 'bg-[rgba(255,255,255,0.1)] border-[rgba(255,255,255,0.15)] hover:border-[#F6A5C0] hover:bg-[rgba(255,255,255,0.15)]'
                }`}
              >
                <Icon className={`w-6 h-6 ${isCorrect ? 'text-emerald-300' : isWrong ? 'text-red-300' : 'text-[#CC8DB3]'}`} />
                <span className={`text-[10px] font-semibold ${isCorrect ? 'text-emerald-300' : isWrong ? 'text-red-300' : 'text-white/70'}`}>
                  {opt.label}
                </span>
              </motion.button>
            );
          })}
        </div>

        {error && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-300 text-[10px] text-center mb-1.5">
            Incorrecto. Intenta de nuevo.
          </motion.p>
        )}

        <button type="button" onClick={onClose} className="w-full text-[10px] text-[#6667AB] hover:text-[#F5D5E0] transition-colors">
          Cancelar
        </button>
      </motion.div>
    </motion.div>
  );
}

function RecaptchaCheckbox({ verified, onStartVerification }: { verified: boolean; onStartVerification: () => void }) {
  return (
    <div
      onClick={verified ? undefined : onStartVerification}
      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border cursor-pointer select-none transition-all group ${
        verified
          ? 'bg-[rgba(18,80,50,0.2)] border-emerald-500/40'
          : 'bg-[rgba(33,6,53,0.4)] border-[rgba(255,255,255,0.15)] hover:border-[#6667AB]'
      }`}
    >
      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all shrink-0 ${
        verified
          ? 'bg-emerald-500 border-emerald-500'
          : 'border-[#6667AB] group-hover:border-[#F5D5E0]'
      }`}>
        {verified && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
      </div>
      <div className="flex items-center gap-1.5 flex-1">
        <span className={`text-xs font-medium transition-colors ${verified ? 'text-emerald-300' : 'text-[#F5D5E0]'}`}>
          {verified ? 'Verificado' : 'No soy un robot'}
        </span>
        {verified ? (
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 ml-auto" />
        ) : (
          <ShieldCheck className="w-3.5 h-3.5 text-[#6667AB] ml-auto" />
        )}
      </div>
    </div>
  );
}

export function AuthModal({ isOpen, onClose, mode: initialMode, onOpenLegal }: AuthModalProps) {
  const { login } = useAuth();
  const [currentMode, setCurrentMode] = useState<'login' | 'register'>(initialMode);
  const [registerRole, setRegisterRole] = useState<'familia' | 'cuidadora'>('familia');
  const [registerView, setRegisterView] = useState<'select-role' | 'form'>('select-role');
  const [error, setError] = useState('');

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [showChallenge, setShowChallenge] = useState(false);

  useEffect(() => {
    setCurrentMode(initialMode);
  }, [initialMode, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setRegisterRole('familia');
        setRegisterView('select-role');
        setError('');
        setLoginEmail('');
        setLoginPassword('');
        setCaptchaVerified(false);
        setShowChallenge(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleCaptchaSuccess = useCallback(() => {
    setCaptchaVerified(true);
    setShowChallenge(false);
  }, []);

  const handleRoleSelect = (role: 'familia' | 'cuidadora') => {
    setRegisterRole(role);
    setRegisterView('form');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!loginEmail || !loginPassword) { setError('Todos los campos son obligatorios.'); return; }
    if (!captchaVerified) { setError('Por favor, completa la verificación de seguridad.'); return; }
    const err = await login(loginEmail, loginPassword);
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
          className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] backdrop-saturate-[1.4] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-3xl w-full max-w-sm overflow-hidden relative my-4"
        >
          <button onClick={onClose} className="absolute top-3 right-3 p-1.5 text-[#6667AB] hover:text-white hover:bg-[rgba(33,6,53,0.4)] rounded-full transition-colors z-10">
            <X className="w-4 h-4" />
          </button>

          <div className="p-5 relative">
            {error && (
              <div className="mb-4 p-3 bg-[rgba(255,0,0,0.15)] border border-[rgba(255,0,0,0.3)] backdrop-blur-sm rounded-xl flex items-start gap-2 text-sm text-[#FF9999]">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />{error}
              </div>
            )}

            {/* Tabs */}
            <div className="bg-[rgba(33,6,53,0.4)] backdrop-blur-sm rounded-full p-0.5 inline-flex mb-5">
              <button
                onClick={() => { setCurrentMode('login'); setCaptchaVerified(false); setShowChallenge(false); }}
                className={`py-1.5 px-4 text-xs font-bold transition-all rounded-full ${
                  currentMode === 'login' ? 'bg-[#F6A5C0] text-[#210635] shadow-sm' : 'text-[#6667AB] hover:text-white'
                }`}
              >
                Iniciar sesión
              </button>
              <button
                onClick={() => { setCurrentMode('register'); setRegisterView('select-role'); setCaptchaVerified(false); setShowChallenge(false); }}
                className={`py-1.5 px-4 text-xs font-bold transition-all rounded-full ${
                  currentMode === 'register' ? 'bg-[#F6A5C0] text-[#210635] shadow-sm' : 'text-[#6667AB] hover:text-white'
                }`}
              >
                Registrarme
              </button>
            </div>

            {/* Captcha Challenge Overlay */}
            <AnimatePresence>
              {showChallenge && (
                <CaptchaChallenge
                  onSuccess={handleCaptchaSuccess}
                  onClose={() => setShowChallenge(false)}
                />
              )}
            </AnimatePresence>

            {currentMode === 'login' ? (
              <form className="space-y-3" onSubmit={handleLogin}>
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-[rgba(33,6,53,0.5)] backdrop-blur-sm flex items-center justify-center border border-[rgba(255,255,255,0.1)]">
                    <KeyRound className="w-4 h-4 text-[#F5D5E0]" />
                  </div>
                  <h2 className="text-base font-bold text-white">Iniciar sesión</h2>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#F5D5E0] mb-1.5">Correo electrónico *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6667AB]" />
                    <input type="email" placeholder="ejemplo@correo.com" value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-[rgba(33,6,53,0.5)] border border-[rgba(255,255,255,0.3)] text-white placeholder:text-[#6667AB] backdrop-blur-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7B337E] focus:border-[#7B337E] transition-all" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#F5D5E0] mb-1.5">Contraseña *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6667AB]" />
                    <input type="password" placeholder="••••••••" value={loginPassword} onChange={e => setLoginPassword(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-[rgba(33,6,53,0.5)] border border-[rgba(255,255,255,0.3)] text-white placeholder:text-[#6667AB] backdrop-blur-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7B337E] focus:border-[#7B337E] transition-all" />
                  </div>
                </div>

                <RecaptchaCheckbox verified={captchaVerified} onStartVerification={() => setShowChallenge(true)} />

                <div className="bg-[rgba(66,13,75,0.4)] backdrop-blur-sm rounded-xl p-3 border border-[rgba(255,255,255,0.08)]">
                  <p className="text-[10px] font-semibold text-[#F5D5E0] mb-2 uppercase tracking-wide">Cuentas de prueba</p>
                  <div className="space-y-1.5">
                    {[
                      { label: 'Admin', email: 'admin@certinanas.pe', pass: '123456' },
                      { label: 'Familia', email: 'familia@test.com', pass: '123456' },
                      { label: 'Cuidadora', email: 'cuidadora@test.com', pass: '123456' },
                    ].map((acc) => (
                      <button key={acc.label} type="button"
                        onClick={() => { setLoginEmail(acc.email); setLoginPassword(acc.pass); }}
                        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[rgba(33,6,53,0.3)] hover:bg-[rgba(33,6,53,0.5)] transition-colors text-left"
                      >
                        <div className="flex items-center gap-1.5">
                          {acc.label === 'Admin' ? <Shield className="w-3 h-3 text-[#F5D5E0]" /> :
                           acc.label === 'Familia' ? <Users className="w-3 h-3 text-[#F5D5E0]" /> :
                           <User className="w-3 h-3 text-[#F5D5E0]" />}
                          <span className="text-xs font-semibold text-[#F5D5E0]">{acc.label}</span>
                        </div>
                        <span className="text-[10px] text-[#6667AB] font-mono">{acc.email}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <button type="button" onClick={onClose} className="px-3 py-2 text-xs font-semibold text-[#F5D5E0] hover:text-white transition-colors">
                    Cancelar
                  </button>
                  <button type="submit" className="flex-1 py-2.5 bg-gradient-to-r from-[#7B337E] to-[#F6A5C0] text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg hover:opacity-90 text-xs flex items-center justify-center gap-1.5">
                    Ingresar <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            ) : currentMode === 'register' ? (
              registerView === 'select-role' ? (
                <RoleSelection onSelect={handleRoleSelect} onLogin={() => setCurrentMode('login')} />
              ) : (
                <RegistrationForm
                  role={registerRole}
                  onChangeRole={() => setRegisterView('select-role')}
                  onClose={onClose}
                  onOpenLegal={onOpenLegal}
                  captchaVerified={captchaVerified}
                  onStartCaptcha={() => setShowChallenge(true)}
                />
              )
            ) : null}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
