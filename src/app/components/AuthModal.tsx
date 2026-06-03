import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Mail, Lock, User, Heart, ShieldCheck, 
  IdCard, ArrowLeft, UploadCloud, FileText, CheckCircle2, AlertCircle 
} from 'lucide-react';
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
  const [registerRole, setRegisterRole] = useState<'selection' | 'family' | 'caregiver'>('selection');
  const [caregiverStep, setCaregiverStep] = useState<1 | 2 | 3>(1);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState('');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Family register form state
  const [familyNombres, setFamilyNombres] = useState('');
  const [familyApellidos, setFamilyApellidos] = useState('');
  const [familyDni, setFamilyDni] = useState('');
  const [familyEmail, setFamilyEmail] = useState('');
  const [familyPassword, setFamilyPassword] = useState('');

  // Caregiver register form state
  const [caregiverNombres, setCaregiverNombres] = useState('');
  const [caregiverApellidos, setCaregiverApellidos] = useState('');
  const [caregiverDni, setCaregiverDni] = useState('');
  const [caregiverEmail, setCaregiverEmail] = useState('');
  
  useEffect(() => {
    setCurrentMode(initialMode);
  }, [initialMode, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setRegisterRole('selection');
        setCaregiverStep(1);
        setAcceptedTerms(false);
        setError('');
        setLoginEmail('');
        setLoginPassword('');
        setFamilyNombres('');
        setFamilyApellidos('');
        setFamilyDni('');
        setFamilyEmail('');
        setFamilyPassword('');
        setCaregiverNombres('');
        setCaregiverApellidos('');
        setCaregiverDni('');
        setCaregiverEmail('');
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!loginEmail || !loginPassword) {
      setError('Todos los campos son obligatorios.');
      return;
    }
    const err = await login(loginEmail, loginPassword);
    if (err) {
      setError(err);
    } else {
      onClose();
    }
  };

  const handleFamilyRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!familyNombres || !familyApellidos || !familyEmail || !familyPassword) {
      setError('Todos los campos son obligatorios.');
      return;
    }
    const err = await register({ email: familyEmail, password: familyPassword, nombres: familyNombres, apellidos: familyApellidos, rol: 'familia' });
    if (err) {
      setError(err);
    } else {
      onClose();
    }
  };

  const handleCaregiverRegister = async () => {
    setError('');
    if (!caregiverNombres || !caregiverApellidos || !caregiverEmail) {
      setError('Todos los campos son obligatorios.');
      return;
    }
    const err = await register({ email: caregiverEmail, password: 'temporal123', nombres: caregiverNombres, apellidos: caregiverApellidos, rol: 'cuidadora' });
    if (err) {
      setError(err);
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  const viewVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 30 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative my-8"
        >
          <div className="h-2 bg-gradient-to-r from-[#1E3A8A] to-[#10B981]" />
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-8">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-sm text-red-700">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                {error}
              </div>
            )}

            <AnimatePresence mode="wait">
              {currentMode === 'login' && (
                <motion.div 
                  key="login" 
                  variants={viewVariants} 
                  initial="initial" 
                  animate="animate" 
                  exit="exit"
                  transition={{ duration: 0.2 }}
                >
                  <h2 className="text-3xl font-bold text-[#1E3A8A] mb-2">Bienvenido de vuelta</h2>
                  <p className="text-gray-500 mb-8">
                    Ingresa a tu cuenta para acceder a tu panel de control.
                  </p>

                  <form className="space-y-5" onSubmit={handleLogin}>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        placeholder="Correo electrónico"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all outline-none"
                      />
                    </div>

                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="password"
                        placeholder="Contraseña"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-4 bg-[#1E3A8A] text-white rounded-xl font-bold hover:bg-[#1e40af] transition-all duration-300 shadow-lg shadow-blue-900/20 transform hover:-translate-y-0.5"
                    >
                      Iniciar Sesión
                    </button>
                  </form>

                  <div className="mt-8 text-center text-gray-600">
                    <p>
                      ¿No tienes una cuenta?{' '}
                      <button
                        onClick={() => {
                          setCurrentMode('register');
                          setRegisterRole('selection');
                          setError('');
                        }}
                        className="text-[#10B981] font-bold hover:underline"
                      >
                        Regístrate
                      </button>
                    </p>
                  </div>
                </motion.div>
              )}

              {currentMode === 'register' && registerRole === 'selection' && (
                <motion.div 
                  key="register-selection" 
                  variants={viewVariants} 
                  initial="initial" 
                  animate="animate" 
                  exit="exit"
                  transition={{ duration: 0.2 }}
                >
                  <h2 className="text-3xl font-bold text-[#1E3A8A] mb-2 text-center">Únete a CERTINANAS</h2>
                  <p className="text-gray-500 mb-8 text-center font-medium">
                    ¿Qué tipo de cuenta deseas crear?
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setRegisterRole('family')} 
                      className="p-8 border-2 border-blue-100 rounded-2xl hover:border-[#1E3A8A] hover:bg-blue-50 transition-all flex flex-col items-center text-center gap-4 group"
                    >
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-[#1E3A8A] transition-colors shadow-inner">
                        <Heart className="w-8 h-8 text-[#1E3A8A] group-hover:text-white transition-colors" />
                      </div>
                      <div>
                        <h3 className="font-bold text-[#1E3A8A] text-lg">Soy Familia</h3>
                        <p className="text-sm text-gray-500 mt-2">Busco cuidado especializado y seguro para mi pequeño.</p>
                      </div>
                    </motion.button>

                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setRegisterRole('caregiver')} 
                      className="p-8 border-2 border-emerald-100 rounded-2xl hover:border-[#10B981] hover:bg-emerald-50 transition-all flex flex-col items-center text-center gap-4 group"
                    >
                      <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center group-hover:bg-[#10B981] transition-colors shadow-inner">
                        <ShieldCheck className="w-8 h-8 text-[#10B981] group-hover:text-white transition-colors" />
                      </div>
                      <div>
                        <h3 className="font-bold text-[#10B981] text-lg">Soy Cuidadora</h3>
                        <p className="text-sm text-gray-500 mt-2">Ofrezco mis servicios profesionales certificados.</p>
                      </div>
                    </motion.button>
                  </div>

                  <div className="mt-8 text-center text-gray-600">
                    <p>
                      ¿Ya tienes una cuenta?{' '}
                      <button
                        onClick={() => { setCurrentMode('login'); setError(''); }}
                        className="text-[#1E3A8A] font-bold hover:underline"
                      >
                        Inicia Sesión
                      </button>
                    </p>
                  </div>
                </motion.div>
              )}

              {currentMode === 'register' && registerRole === 'family' && (
                <motion.div 
                  key="register-family" 
                  variants={viewVariants} 
                  initial="initial" 
                  animate="animate" 
                  exit="exit"
                  transition={{ duration: 0.2 }}
                >
                  <button 
                    onClick={() => setRegisterRole('selection')}
                    className="flex items-center text-sm text-gray-500 hover:text-[#1E3A8A] mb-6 transition-colors font-medium"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" /> Volver a selección
                  </button>

                  <h2 className="text-3xl font-bold text-[#1E3A8A] mb-2">Registro para Familias</h2>
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-[#1E3A8A] shrink-0 mt-0.5" />
                    <p className="text-sm text-[#1E3A8A]/80 font-medium">
                      Realizamos una validación de identidad básica a todas las familias para proteger la integridad de nuestras cuidadoras.
                    </p>
                  </div>

                  <form className="space-y-4" onSubmit={handleFamilyRegister}>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative col-span-2 sm:col-span-1">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input type="text" placeholder="Nombres" value={familyNombres} onChange={(e) => setFamilyNombres(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent outline-none transition-all" />
                      </div>
                      <div className="relative col-span-2 sm:col-span-1">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input type="text" placeholder="Apellidos" value={familyApellidos} onChange={(e) => setFamilyApellidos(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent outline-none transition-all" />
                      </div>
                    </div>

                    <div className="relative">
                      <IdCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input type="text" placeholder="Número de DNI / CE" value={familyDni} onChange={(e) => setFamilyDni(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent outline-none transition-all" />
                    </div>

                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input type="email" placeholder="Correo electrónico" value={familyEmail} onChange={(e) => setFamilyEmail(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent outline-none transition-all" />
                    </div>

                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input type="password" placeholder="Crea una contraseña" value={familyPassword} onChange={(e) => setFamilyPassword(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent outline-none transition-all" />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Condición del menor (Opcional)</label>
                      <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent outline-none transition-all text-gray-600">
                        <option value="">Ninguna o prefiero no decirlo</option>
                        <option value="tea">TEA (Autismo)</option>
                        <option value="tdah">TDAH</option>
                        <option value="down">Síndrome de Down</option>
                        <option value="otros">Otra condición neurológica</option>
                      </select>
                    </div>

                    <div className="flex items-start gap-3 mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="flex items-center h-5">
                        <input
                          id="family-terms"
                          type="checkbox"
                          checked={acceptedTerms}
                          onChange={(e) => setAcceptedTerms(e.target.checked)}
                          className="w-4 h-4 border-gray-300 rounded text-[#1E3A8A] focus:ring-[#1E3A8A] cursor-pointer"
                        />
                      </div>
                      <label htmlFor="family-terms" className="text-sm text-gray-600 leading-snug cursor-pointer">
                        He leído y acepto los{' '}
                        <button type="button" onClick={(e) => { e.preventDefault(); onOpenLegal('terms'); }} className="text-[#1E3A8A] font-semibold hover:underline">Términos de Servicio</button>
                        {' '}y la{' '}
                        <button type="button" onClick={(e) => { e.preventDefault(); onOpenLegal('privacy'); }} className="text-[#1E3A8A] font-semibold hover:underline">Política de Privacidad</button>.
                      </label>
                    </div>

                    <button 
                      type="submit" 
                      disabled={!acceptedTerms}
                      className="w-full py-4 mt-2 bg-[#1E3A8A] text-white rounded-xl font-bold hover:bg-[#1e40af] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-blue-900/20 transform hover:-translate-y-0.5 disabled:hover:translate-y-0"
                    >
                      Crear Cuenta de Familia
                    </button>
                  </form>
                </motion.div>
              )}

              {currentMode === 'register' && registerRole === 'caregiver' && (
                <motion.div 
                  key="register-caregiver" 
                  variants={viewVariants} 
                  initial="initial" 
                  animate="animate" 
                  exit="exit"
                  transition={{ duration: 0.2 }}
                >
                  <button 
                    onClick={() => caregiverStep === 1 ? setRegisterRole('selection') : setCaregiverStep((prev) => (prev - 1) as 1|2|3)}
                    className="flex items-center text-sm text-gray-500 hover:text-[#10B981] mb-6 transition-colors font-medium"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" /> {caregiverStep === 1 ? 'Volver a selección' : 'Paso anterior'}
                  </button>

                  <h2 className="text-3xl font-bold text-[#10B981] mb-2">Postulación de Cuidadora</h2>
                  
                  <div className="flex items-center mb-6 mt-4 gap-2">
                    <div className={`h-2 flex-1 rounded-full transition-colors duration-300 ${caregiverStep >= 1 ? 'bg-[#10B981]' : 'bg-gray-200'}`} />
                    <div className={`h-2 flex-1 rounded-full transition-colors duration-300 ${caregiverStep >= 2 ? 'bg-[#10B981]' : 'bg-gray-200'}`} />
                    <div className={`h-2 flex-1 rounded-full transition-colors duration-300 ${caregiverStep >= 3 ? 'bg-[#10B981]' : 'bg-gray-200'}`} />
                  </div>

                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 mb-6 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#10B981] shrink-0 mt-0.5" />
                    <p className="text-sm text-[#059669] font-medium">
                      Tu perfil pasará por un <strong className="font-bold">estricto proceso de validación manual</strong> antes de ser publicado en el catálogo.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {caregiverStep === 1 && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                        <h3 className="font-bold text-gray-800 mb-4">Paso 1: Datos Personales</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="relative col-span-2 sm:col-span-1">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input type="text" placeholder="Nombres" value={caregiverNombres} onChange={(e) => setCaregiverNombres(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#10B981] focus:border-transparent outline-none transition-all" />
                          </div>
                          <div className="relative col-span-2 sm:col-span-1">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input type="text" placeholder="Apellidos" value={caregiverApellidos} onChange={(e) => setCaregiverApellidos(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#10B981] focus:border-transparent outline-none transition-all" />
                          </div>
                        </div>

                        <div className="relative">
                          <IdCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input type="text" placeholder="Número de DNI / CE" value={caregiverDni} onChange={(e) => setCaregiverDni(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#10B981] focus:border-transparent outline-none transition-all" />
                        </div>

                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input type="email" placeholder="Correo electrónico" value={caregiverEmail} onChange={(e) => setCaregiverEmail(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#10B981] focus:border-transparent outline-none transition-all" />
                        </div>
                      </motion.div>
                    )}

                    {caregiverStep === 2 && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                        <h3 className="font-bold text-gray-800 mb-4">Paso 2: Acreditación Profesional</h3>
                        
                        <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer group">
                          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-emerald-100 transition-colors">
                            <FileText className="w-6 h-6 text-gray-500 group-hover:text-[#10B981] transition-colors" />
                          </div>
                          <p className="text-sm font-semibold text-gray-700 mb-1">Certificado de Educación Especial</p>
                          <p className="text-xs text-gray-500">Haz clic para subir tu archivo (PDF, JPG, PNG)</p>
                        </div>

                        <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer group">
                          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-emerald-100 transition-colors">
                            <FileText className="w-6 h-6 text-gray-500 group-hover:text-[#10B981] transition-colors" />
                          </div>
                          <p className="text-sm font-semibold text-gray-700 mb-1">Certificado de Primeros Auxilios / RCP</p>
                          <p className="text-xs text-gray-500">Haz clic para subir tu archivo (PDF, JPG, PNG)</p>
                        </div>
                      </motion.div>
                    )}

                    {caregiverStep === 3 && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                        <h3 className="font-bold text-gray-800 mb-4">Paso 3: Verificación de Seguridad</h3>
                        
                        <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer group">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-emerald-100 transition-colors">
                            <UploadCloud className="w-8 h-8 text-gray-500 group-hover:text-[#10B981] transition-colors" />
                          </div>
                          <p className="text-base font-bold text-gray-800 mb-2">Antecedentes Policiales y Penales</p>
                          <p className="text-sm text-gray-500 mb-4">Obligatorio. El documento no debe tener una antigüedad mayor a 3 meses.</p>
                          <span className="inline-block px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 shadow-sm">
                            Seleccionar Archivo PDF
                          </span>
                        </div>

                        <div className="flex items-start gap-3 mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                          <div className="flex items-center h-5">
                            <input
                              id="caregiver-terms"
                              type="checkbox"
                              checked={acceptedTerms}
                              onChange={(e) => setAcceptedTerms(e.target.checked)}
                              className="w-4 h-4 border-gray-300 rounded text-[#10B981] focus:ring-[#10B981] cursor-pointer"
                            />
                          </div>
                          <label htmlFor="caregiver-terms" className="text-sm text-gray-600 leading-snug cursor-pointer">
                            He leído y acepto los{' '}
                            <button type="button" onClick={(e) => { e.preventDefault(); onOpenLegal('terms'); }} className="text-[#10B981] font-semibold hover:underline">Términos de Servicio</button>
                            {' '}y la{' '}
                            <button type="button" onClick={(e) => { e.preventDefault(); onOpenLegal('privacy'); }} className="text-[#10B981] font-semibold hover:underline">Política de Privacidad</button>.
                          </label>
                        </div>
                      </motion.div>
                    )}

                    <div className="pt-4 flex gap-3">
                      {caregiverStep < 3 ? (
                        <button 
                          type="button"
                          onClick={() => setCaregiverStep((prev) => (prev + 1) as 1|2|3)}
                          className="w-full py-4 bg-[#10B981] text-white rounded-xl font-bold hover:bg-[#059669] transition-all duration-300 shadow-lg shadow-emerald-500/20 transform hover:-translate-y-0.5"
                        >
                          Siguiente Paso
                        </button>
                      ) : (
                        <button 
                          type="button"
                          disabled={!acceptedTerms}
                          onClick={handleCaregiverRegister}
                          className="w-full py-4 bg-[#1E3A8A] text-white rounded-xl font-bold hover:bg-[#1e40af] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-blue-900/20 transform hover:-translate-y-0.5 disabled:hover:translate-y-0"
                        >
                          Enviar Postulación
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
