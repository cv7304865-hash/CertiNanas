import { motion, AnimatePresence } from 'motion/react';
import { Star, Shield, Lock, Search, ShieldPlus, ChevronRight, Briefcase, FileText, CheckCircle, SearchX, LayoutDashboard, MessageSquare, LogOut, UserCircle } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { AuthModal } from './components/AuthModal';
import { InterviewModal } from './components/InterviewModal';
import { FloatingSupport } from './components/FloatingSupport';
import { LegalModal } from './components/LegalModal';
import { ProfileModal, NanaProfile } from './components/ProfileModal';
import { Dashboard } from './components/Dashboard';
import { AdminLayout } from './components/AdminLayout';
import { CaregiverPanel } from './components/CaregiverPanel';
import { SearchPage } from './components/SearchPage';
import { FamilyPanel } from './components/FamilyPanel';
import { ContractPage } from './components/ContractPage';
import { PaymentPage } from './components/PaymentPage';
import { MessagesPage } from './components/MessagesPage';
import { ReviewFormPage } from './components/ReviewFormPage';
import { Messages } from './components/Messages';
import { Checkout } from './components/Checkout';
import { NotificationsBell } from './components/NotificationsBell';
import { WelcomePage } from './components/WelcomePage';
import { AuthProvider, useAuth } from '../context/AuthContext';

type View = 'home' | 'dashboard' | 'messages' | 'checkout' | 'admin' | 'cuidadora';

function AppContent() {
  const { user, logout, loading } = useAuth();
  const [view, setView] = useState<View>('home');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedExperience, setSelectedExperience] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  
  const [authModalConfig, setAuthModalConfig] = useState<{ isOpen: boolean; mode: 'login' | 'register' }>({
    isOpen: false,
    mode: 'login',
  });

  // Redirigir al panel correspondiente según el rol al iniciar sesión
  useEffect(() => {
    if (loading) return;
    if (!user) {
      setView('home');
      return;
    }
    if (user.rol === 'cuidadora') setView('cuidadora');
    else if (user.rol === 'admin') setView('admin');
    else setView('search');
  }, [loading, user?.id]);

  const isFamily = user?.rol === 'familia';
  const [contractOrderId, setContractOrderId] = useState<number | null>(null);
  const [interviewModal, setInterviewModal] = useState<{ isOpen: boolean; nanaName: string }>({
    isOpen: false,
    nanaName: '',
  });
  const [legalModalConfig, setLegalModalConfig] = useState<{ isOpen: boolean; type: 'terms' | 'privacy' | null }>({
    isOpen: false,
    type: null,
  });
  const [profileModalConfig, setProfileModalConfig] = useState<{ isOpen: boolean; nana: NanaProfile | null }>({
    isOpen: false,
    nana: null,
  });

  const handleOpenLegal = (type: 'terms' | 'privacy') => {
    setLegalModalConfig({ isOpen: true, type });
  };

  const handleRequestInterview = (nanaName: string) => {
    setInterviewModal({ isOpen: true, nanaName });
  };

  const allNanas: NanaProfile[] = [
    {
      id: 1,
      name: 'María González',
      photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
      rating: 4.9,
      reviews: 47,
      specialties: ['TDAH', 'TEA', 'Primeros Auxilios'],
      areas: ['Cuidado domiciliario', 'Acompañamiento escolar'],
      experienceYears: 4,
      experienceText: '4 años de exp.',
      rate: 25,
      shortDescription: 'Especialista en rutinas estructuradas y refuerzo positivo para niños con TDAH y TEA.',
      longDescription: 'Soy licenciada en Educación Especial con 4 años de experiencia en el manejo de crisis y desarrollo de rutinas para niños neurodivergentes. Mi enfoque se basa en el refuerzo positivo y la comunicación empática, creando un entorno seguro y estimulante para el aprendizaje diario de sus pequeños.',
      education: ['Licenciatura en Educación Especial - UNMSM (2018)', 'Diplomado en Neuropsicología Infantil'],
      certifications: ['Certificación en RCP y Primeros Auxilios - Cruz Roja (2023)', 'Manejo conductual en TDAH'],
      reviewsList: [
        { author: 'Familia Pérez', rating: 5, text: 'María ha sido una bendición. Mi hijo ha mejorado mucho su concentración y sus rabietas han disminuido.', date: 'Marzo 2026' }
      ]
    },
    {
      id: 2,
      name: 'Carmen Rodríguez',
      photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
      rating: 5.0,
      reviews: 82,
      specialties: ['TEA', 'Discapacidad Motriz'],
      areas: ['Cuidado domiciliario', 'Terapias de estimulación'],
      experienceYears: 8,
      experienceText: '8 años de exp.',
      rate: 30,
      shortDescription: 'Terapeuta ocupacional enfocada en autonomía y estimulación sensorial profunda.',
      longDescription: 'A lo largo de mis 8 años de carrera como terapeuta ocupacional, he desarrollado programas de estimulación sensorial y motriz para niños dentro del espectro autista y con discapacidades motoras. Trabajo de la mano con las familias para asegurar la transferencia de habilidades en casa.',
      education: ['Tecnología Médica en Terapia Ocupacional - UPCH (2015)', 'Especialización en Integración Sensorial'],
      certifications: ['Estimulación Temprana Avanzada', 'Soporte Vital Básico Pediátrico'],
      reviewsList: [
        { author: 'Mamá de Leo', rating: 5, text: 'Carmen tiene una paciencia infinita. Las terapias en casa son un éxito rotundo.', date: 'Febrero 2026' },
        { author: 'Familia Torres', rating: 5, text: 'Excelente profesional. Muy recomendada para niños no verbales.', date: 'Enero 2026' }
      ]
    },
    {
      id: 3,
      name: 'Sofía Martínez',
      photo: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400',
      rating: 4.8,
      reviews: 35,
      specialties: ['Síndrome de Down', 'Primeros Auxilios'],
      areas: ['Acompañamiento escolar', 'Cuidado domiciliario'],
      experienceYears: 2,
      experienceText: '2 años de exp.',
      rate: 22,
      shortDescription: 'Joven pedagoga con enfoque lúdico y acompañamiento escolar personalizado.',
      longDescription: 'Recién graduada en Pedagogía Inclusiva, mi pasión es hacer que el aprendizaje sea divertido. Me especializo en niños con Síndrome de Down, utilizando juegos interactivos y material visual para fortalecer su área cognitiva y social en el día a día.',
      education: ['Bachiller en Pedagogía Inclusiva - PUCP (2024)'],
      certifications: ['Primeros Auxilios Pediátricos', 'Lenguaje de Señas Básico'],
      reviewsList: [
        { author: 'Familia Castro', rating: 4, text: 'Muy enérgica y alegre. A mi hija le encanta pasar tiempo con ella.', date: 'Marzo 2026' }
      ]
    },
    {
      id: 4,
      name: 'Ana Torres',
      photo: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400',
      rating: 4.9,
      reviews: 61,
      specialties: ['TEA', 'TDAH', 'Primeros Auxilios'],
      areas: ['Cuidado domiciliario', 'Acompañamiento escolar', 'Terapias de estimulación'],
      experienceYears: 10,
      experienceText: '10+ años de exp.',
      rate: 35,
      shortDescription: 'Experta Senior en intervención conductual temprana y manejo integral en casa.',
      longDescription: 'Con más de una década apoyando a familias extraordinarias. Ofrezco un servicio integral que abarca desde el cuidado básico hasta la intervención conductual temprana y la implementación de sistemas de comunicación alternativa (PECS).',
      education: ['Licenciada en Psicología Clínica - Ulima (2012)', 'Maestría en Intervención en Trastornos del Neurodesarrollo'],
      certifications: ['Certificación Oficial PECS Nivel 1', 'Instructor RCP AHA'],
      reviewsList: [
        { author: 'Papá de Mateo', rating: 5, text: 'Ana es una institución. El progreso de Mateo en su comunicación es evidente.', date: 'Diciembre 2025' }
      ]
    },
  ];

  // Logic to filter the catalog
  const filteredNanas = useMemo(() => {
    return allNanas.filter((nana) => {
      // Filter by Specialty
      if (selectedSpecialty) {
        if (!nana.specialties.includes(selectedSpecialty)) return false;
      }
      
      // Filter by Experience
      if (selectedExperience) {
        if (selectedExperience === '0-2' && nana.experienceYears > 2) return false;
        if (selectedExperience === '3-5' && (nana.experienceYears <= 2 || nana.experienceYears > 5)) return false;
        if (selectedExperience === '5+' && nana.experienceYears <= 5) return false;
      }

      // Filter by Area of Dedication
      if (selectedArea) {
        if (!nana.areas.includes(selectedArea)) return false;
      }
      
      return true;
    });
  }, [selectedSpecialty, selectedExperience, selectedArea, allNanas]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  };

  // Mostrar contenido completo solo si hay sesion o no estamos en home
  const showFullContent = user || view !== 'home';

  const handleCloseAuth = () => {
    setAuthModalConfig({ ...authModalConfig, isOpen: false });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#210635] via-[#420D4B] to-[#7B337E] font-['Inter',system-ui,sans-serif] selection:bg-[#CC8DB3] selection:text-white overflow-x-hidden">
      {/* Header - solo cuando hay contenido completo y modal cerrado */}
      {showFullContent && !authModalConfig.isOpen && view !== 'admin' && view !== 'cuidadora' && view !== 'familia' && view !== 'search' && view !== 'messages' && view !== 'contract' && view !== 'payment' && (
      <header className="bg-[#210635]/80 backdrop-blur-[20px] border-b border-[rgba(255,255,255,0.1)] sticky top-0 z-40 transition-all duration-300 shadow-lg shadow-black/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Custom SVG Logo */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => { setView('home'); setTimeout(() => scrollToSection('inicio'), 50); }}
            >
              <div className="relative flex items-center justify-center">
                <div className="w-11 h-11 overflow-hidden">
                  <img src="/logo.png" alt="CertiNanas" className="w-full h-full object-cover mix-blend-multiply" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-[26px] font-extrabold tracking-[-0.03em] text-white uppercase leading-none mt-1" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                  CERTINANAS
                </span>
                <span className="text-[10px] font-bold tracking-[0.2em] text-[#6667AB] uppercase mt-1">
                  Cuidado Seguro
                </span>
              </div>
            </motion.div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <button onClick={() => { setView('home'); setTimeout(() => scrollToSection('inicio'), 50); }} className={`text-sm font-semibold transition-colors ${view === 'home' ? 'text-[#F5D5E0]' : 'text-[#6667AB] hover:text-[#F5D5E0]'}`}>
                Inicio
              </button>
              <button onClick={() => { setView('home'); setTimeout(() => scrollToSection('catalogo'), 50); }} className="text-sm font-semibold text-[#6667AB] hover:text-[#F5D5E0] transition-colors">
                Catálogo
              </button>
              {user?.rol !== 'familia' && (
              <button onClick={() => setView('dashboard')} className={`text-sm font-semibold inline-flex items-center gap-1.5 transition-colors ${view === 'dashboard' ? 'text-[#F5D5E0]' : 'text-[#6667AB] hover:text-[#F5D5E0]'}`}>
                <LayoutDashboard className="w-4 h-4" /> Mi Panel
              </button>
              )}
              <button onClick={() => setView('messages')} className={`text-sm font-semibold inline-flex items-center gap-1.5 transition-colors ${view === 'messages' ? 'text-[#F5D5E0]' : 'text-[#6667AB] hover:text-[#F5D5E0]'}`}>
                <MessageSquare className="w-4 h-4" /> Mensajes
              </button>
            </nav>

            {/* Auth Buttons / User Menu */}
            <div className="flex items-center space-x-3">
              {user ? (
                <>
                  {user.rol === 'admin' && (
                    <button onClick={() => setView('admin')} className={`text-sm font-semibold inline-flex items-center gap-1.5 transition-colors ${view === 'admin' ? 'text-[#CC8DB3]' : 'text-[#6667AB] hover:text-[#F6A5C0]'}`}>
                      <Shield className="w-4 h-4" /> Admin
                    </button>
                  )}
                  {user.rol === 'cuidadora' && (
                    <button onClick={() => setView('cuidadora')} className={`text-sm font-semibold inline-flex items-center gap-1.5 transition-colors ${view === 'cuidadora' ? 'text-[#CC8DB3]' : 'text-[#6667AB] hover:text-[#F6A5C0]'}`}>
                      <UserCircle className="w-4 h-4" /> Mi Perfil
                    </button>
                  )}
                  <NotificationsBell />
                  <div className="flex items-center gap-3 pl-3 border-l border-[rgba(255,255,255,0.2)]">
                    <div className="flex items-center gap-2 text-sm">
                      <UserCircle className="w-5 h-5 text-[#F5D5E0]" />
                      <span className="font-semibold text-white">{user.nombres}</span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#F5D5E0] text-[#210635]">{user.rol}</span>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={logout}
                      className="p-2 text-[#6667AB] hover:text-red-500 hover:bg-[#F6A5C0]/20 rounded-xl transition-all"
                      title="Cerrar sesión"
                    >
                      <LogOut className="w-4 h-4" />
                    </motion.button>
                  </div>
                </>
              ) : (
                <>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setAuthModalConfig({ isOpen: true, mode: 'login' })}
                    className="px-5 py-2.5 text-sm font-semibold text-white border-2 border-transparent hover:border-gray-200 rounded-xl transition-all"
                  >
                    Iniciar Sesión
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setAuthModalConfig({ isOpen: true, mode: 'register' })}
                    className="px-6 py-2.5 bg-[#CC8DB3] text-[#210635] rounded-xl text-sm font-bold hover:bg-[#B07A9A] transition-all shadow-lg shadow-[#CC8DB3]/25 flex items-center gap-2"
                  >
                    Regístrate <ChevronRight className="w-4 h-4" />
                  </motion.button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
      )}

      {view === 'dashboard' && (
        <Dashboard onOpenMessages={() => setView('messages')} onOpenCheckout={() => setView('checkout')} />
      )}
      {view === 'admin' && user?.rol === 'admin' && (
        <AdminLayout />
      )}
      {view === 'cuidadora' && user?.rol === 'cuidadora' && (
        <CaregiverPanel onNavigate={setView} />
      )}

      {view === 'search' && (
        <SearchPage onNavigate={setView} />
      )}

      {view === 'familia' && (
        <FamilyPanel onNavigate={setView} onViewContract={(id) => { setContractOrderId(id); setView('contract'); }} onReview={(id) => { setContractOrderId(id); setView('review'); }} />
      )}
      {view === 'contract' && contractOrderId && (
        <ContractPage orderId={contractOrderId} onBack={() => setView('familia')} onProceedToPayment={() => setView('payment')} />
      )}
      {view === 'payment' && contractOrderId && (
        <PaymentPage orderId={contractOrderId} onBack={() => setView('familia')} />
      )}
      {view === 'review' && contractOrderId && (
        <ReviewFormPage orderId={contractOrderId} onBack={() => setView('familia')} />
      )}
      {view === 'messages' && (
        <MessagesPage onNavigate={setView} />
      )}
      {view === 'checkout' && <Checkout onBack={() => setView('dashboard')} />}

      {view === 'home' && (
      <WelcomePage
        onRegister={() => setAuthModalConfig({ isOpen: true, mode: 'register' })}
        onLogin={() => setAuthModalConfig({ isOpen: true, mode: 'login' })}
      />
      )}

      {/* Hidden old sections kept for reference */}
      {false && (
      <section id="inicio-old" className="hidden">
        {/* Soft Decorative Background */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#CC8DB3]/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#210635]/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-center">
            
            {/* Left Content (Copy & CTA) */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="max-w-2xl"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F5D5E0] text-[#210635] text-sm font-bold tracking-wide mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F6A5C0]"></span>
                </span>
                La plataforma #1 en cuidado neurodivergente
              </div>
              
              <h1 className="text-[3.5rem] lg:text-[4.5rem] font-extrabold text-white leading-[1.05] tracking-tight mb-6">
                Cuidado experto para <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#CC8DB3] to-[#F6A5C0]">quienes más amas</span>
              </h1>
              
              <p className="text-xl lg:text-2xl text-[#6667AB] mb-10 font-light leading-relaxed max-w-lg">
                Conectamos a tu familia con cuidadoras certificadas y rigurosamente verificadas. Tu tranquilidad es nuestra prioridad.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 mb-12">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => scrollToSection('catalogo')}
                  className="w-full sm:w-auto px-8 py-4 bg-[#F6A5C0] text-[#210635] rounded-2xl text-lg font-bold hover:shadow-xl hover:shadow-[#F6A5C0]/30 transition-all flex items-center justify-center gap-2 group"
                >
                  Buscar Nana Ideal
                  <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </motion.button>
                
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => scrollToSection('seguridad')}
                  className="w-full sm:w-auto px-8 py-4 bg-[rgba(33,6,53,0.4)] backdrop-blur-sm text-white border-2 border-[rgba(255,255,255,0.2)] rounded-2xl text-lg font-bold hover:bg-[rgba(33,6,53,0.6)] hover:border-white/50 transition-all flex items-center justify-center"
                >
                  Cómo Funciona
                </motion.button>
              </div>

              {/* Security Badges */}
              <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-white/20">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#F6A5C0]/20 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-[#F5D5E0]" />
                  </div>
                  <span className="text-sm font-semibold text-[#6667AB]">Perfiles 100% Verificados</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#F6A5C0]/20 flex items-center justify-center">
                    <Lock className="w-4 h-4 text-[#CC8DB3]" />
                  </div>
                  <span className="text-sm font-semibold text-[#6667AB]">Pago Seguro Escrow</span>
                </div>
              </div>
            </motion.div>

            {/* Right Content (Rich Visual Composition) */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="relative w-full aspect-[4/5] lg:aspect-auto lg:h-[650px]"
            >
              {/* Main Image */}
              <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/30 border-8 border-white">
                <img 
                  src="https://images.unsplash.com/photo-1534224563519-fea04849cadf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXJlZ2l2ZXIlMjBjaGlsZCUyMGhhcHB5fGVufDF8fHx8MTc3NjU3NTQ1MHww&ixlib=rb-4.1.0&q=80&w=1080" 
                  alt="Cuidadora feliz con niño" 
                  className="w-full h-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#210635]/80 to-transparent"></div>
              </div>

              {/* Floating Card 1: Verification */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="absolute top-10 -left-6 lg:-left-12 bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 p-4 rounded-2xl flex items-center gap-4"
              >
                <div className="bg-[#F6A5C0]/30 p-2.5 rounded-full text-[#CC8DB3]">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-white">Perfil Verificado</p>
                  <p className="text-xs text-[#6667AB] font-medium">Filtros rigurosos</p>
                </div>
              </motion.div>

              {/* Floating Card 2: Rating */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="absolute bottom-16 -right-6 lg:-right-8 bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 p-5 rounded-2xl flex flex-col gap-2"
              >
                <div className="flex items-center gap-1.5">
                  <Star className="w-5 h-5 text-[#CC8DB3] fill-[#CC8DB3]" />
                  <span className="font-black text-xl text-white">4.9/5</span>
                </div>
                <p className="text-xs font-semibold text-[#6667AB]">Calificación Promedio</p>
                <div className="flex -space-x-2 mt-1">
                  <img className="w-7 h-7 rounded-full border-2 border-white object-cover shadow-sm" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop" alt="User" />
                  <img className="w-7 h-7 rounded-full border-2 border-white object-cover shadow-sm" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" alt="User" />
                  <img className="w-7 h-7 rounded-full border-2 border-white object-cover shadow-sm" src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop" alt="User" />
                  <div className="w-7 h-7 rounded-full border-2 border-white bg-[rgba(33,6,53,0.4)] flex items-center justify-center text-[9px] font-bold text-[#6667AB] shadow-sm">+80</div>
                </div>
              </motion.div>

            </motion.div>
          </div>
        </div>
      </section>
      )}

      {/* Main Content Area - solo en home con sesion */}
      {showFullContent && view === 'home' && (
      <main className="relative z-20 pb-20 pt-16">
        
        {/* Search/Filter Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-3xl p-6 md:p-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
              <div>
                <label className="block text-sm font-bold text-[#F5D5E0] mb-2">
                  Especialización
                </label>
                <div className="relative">
                  <select
                    value={selectedSpecialty}
                    onChange={(e) => setSelectedSpecialty(e.target.value)}
                    className="w-full pl-4 pr-10 py-3.5 bg-[rgba(33,6,53,0.5)] border-[rgba(255,255,255,0.3)] backdrop-blur-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7B337E] focus:border-[#7B337E] transition-all appearance-none font-medium text-white placeholder:text-[#6667AB]"
                  >
                    <option value="">Todas las especialidades</option>
                    <option value="TEA">TEA</option>
                    <option value="TDAH">TDAH</option>
                    <option value="Síndrome de Down">Síndrome de Down</option>
                    <option value="Primeros Auxilios">Primeros Auxilios</option>
                    <option value="Discapacidad Motriz">Discapacidad Motriz</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <ChevronRight className="w-5 h-5 text-white/50 rotate-90" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#F5D5E0] mb-2">
                  Años de Experiencia
                </label>
                <div className="relative">
                  <select
                    value={selectedExperience}
                    onChange={(e) => setSelectedExperience(e.target.value)}
                    className="w-full pl-4 pr-10 py-3.5 bg-[rgba(33,6,53,0.5)] border-[rgba(255,255,255,0.3)] backdrop-blur-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7B337E] focus:border-[#7B337E] transition-all appearance-none font-medium text-white placeholder:text-[#6667AB]"
                  >
                    <option value="">Cualquier experiencia</option>
                    <option value="0-2">0 - 2 años</option>
                    <option value="3-5">3 - 5 años</option>
                    <option value="5+">Más de 5 años</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <ChevronRight className="w-5 h-5 text-white/50 rotate-90" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#F5D5E0] mb-2">
                  Área de Dedicación
                </label>
                <div className="relative">
                  <select 
                    value={selectedArea}
                    onChange={(e) => setSelectedArea(e.target.value)}
                    className="w-full pl-4 pr-10 py-3.5 bg-[rgba(33,6,53,0.5)] border-[rgba(255,255,255,0.3)] backdrop-blur-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7B337E] focus:border-[#7B337E] transition-all appearance-none font-medium text-white placeholder:text-[#6667AB]"
                  >
                    <option value="">Cualquier área</option>
                    <option value="Cuidado domiciliario">Cuidado domiciliario</option>
                    <option value="Acompañamiento escolar">Acompañamiento escolar</option>
                    <option value="Terapias de estimulación">Terapias de estimulación</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <ChevronRight className="w-5 h-5 text-white/50 rotate-90" />
                  </div>
                </div>
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setSelectedSpecialty('');
                  setSelectedExperience('');
                  setSelectedArea('');
                  scrollToSection('catalogo');
                }}
                className="w-full py-3.5 bg-[rgba(33,6,53,0.4)] backdrop-blur-sm text-white border-2 border-[rgba(255,255,255,0.2)] rounded-xl font-bold hover:bg-[rgba(33,6,53,0.6)] transition-all flex items-center justify-center space-x-2"
              >
                <span>Limpiar Filtros</span>
              </motion.button>
            </div>
          </motion.div>
        </section>

        {/* Catalog Section */}
        <section id="catalogo" className="pt-24 pb-16 scroll-mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight"
              >
                Nuestras Cuidadoras
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-xl text-[#6667AB] font-medium"
              >
                Profesionales verificadas listas para ayudar a tu familia
              </motion.p>
            </div>

            {filteredNanas.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20 bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-3xl"
              >
                <div className="w-20 h-20 bg-[rgba(33,6,53,0.4)] backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6">
                  <SearchX className="w-10 h-10 text-[#6667AB]" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">No encontramos cuidadoras</h3>
                <p className="text-[#6667AB] max-w-md mx-auto">No hay perfiles que coincidan exactamente con estos criterios específicos. Intenta ajustar tus filtros para ver más resultados.</p>
                <button 
                  onClick={() => { setSelectedSpecialty(''); setSelectedExperience(''); setSelectedArea(''); }}
                  className="mt-8 px-8 py-3 bg-[#CC8DB3] text-[#210635] font-bold rounded-xl hover:bg-[#B07A9A] transition-all shadow-lg"
                >
                  Limpiar Filtros
                </button>
              </motion.div>
            ) : (
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
              >
                <AnimatePresence>
                  {filteredNanas.map((nana) => (
                    <motion.div
                      key={nana.id}
                      variants={itemVariants}
                      layout
                      className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col h-full"
                    >
                      {/* Photo Container */}
                      <div className="relative h-56 overflow-hidden bg-gray-100">
                        <img
                          src={nana.photo}
                          alt={nana.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#210635]/80 via-black/20 to-transparent opacity-80"></div>
                        
                        <div className="absolute top-4 right-4 bg-[rgba(33,6,53,0.65)] backdrop-blur-sm rounded-full p-2 shadow-lg flex items-center justify-center border-2 border-[#CC8DB3] group-hover:scale-110 transition-transform" title="Perfil Verificado">
                          <CheckCircle className="w-4 h-4 text-[#CC8DB3]" />
                        </div>

                        <div className="absolute bottom-4 left-4 right-4 text-white">
                          <h3 className="text-2xl font-bold drop-shadow-md leading-tight mb-1">{nana.name}</h3>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center">
                              <Star className="w-4 h-4 text-[#CC8DB3] fill-[#CC8DB3] mr-1" />
                              <span className="font-semibold text-sm">{nana.rating}</span>
                            </div>
                            <span className="text-white/60 text-xs">|</span>
                            <div className="flex items-center text-sm">
                              <Briefcase className="w-4 h-4 mr-1 text-white/80" />
                              {nana.experienceText}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6 flex-1 flex flex-col bg-white">
                        {/* Specialties */}
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {nana.specialties.slice(0, 3).map((specialty, index) => (
                            <span
                              key={index}
                              className="px-2.5 py-1 bg-[#F6A5C0]/20 text-[#210635] text-[11px] font-bold rounded-md border border-blue-100"
                            >
                              {specialty}
                            </span>
                          ))}
                          {nana.specialties.length > 3 && (
                            <span className="px-2.5 py-1 bg-[rgba(33,6,53,0.4)] text-[#6667AB] text-[11px] font-bold rounded-md border border-[rgba(255,255,255,0.2)]">
                              +{nana.specialties.length - 3}
                            </span>
                          )}
                        </div>

                        {/* Short Description */}
                        <p className="text-[#F5D5E0]/70 text-sm leading-relaxed mb-6 line-clamp-2 flex-1">
                          {nana.shortDescription}
                        </p>

                        <div className="mt-auto space-y-3">
                          <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setProfileModalConfig({ isOpen: true, nana })}
                            className="w-full py-2.5 bg-white text-[#210635] border border-blue-200 rounded-xl hover:bg-[#F6A5C0]/20 transition-colors text-sm font-bold flex items-center justify-center gap-2"
                          >
                            <FileText className="w-4 h-4" />
                            Ver Perfil Completo
                          </motion.button>

                          <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleRequestInterview(nana.name)}
                            className="w-full py-3 bg-[#CC8DB3] text-[#210635] rounded-xl hover:bg-[#B07A9A] transition-all duration-300 font-bold tracking-wide flex items-center justify-center gap-2 group/btn"
                          >
                            Solicitar Cita 
                            <ChevronRight className="w-4 h-4 text-white/70 group-hover/btn:text-white group-hover/btn:translate-x-1 transition-all" />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </section>

        {/* Security Section */}
        <section id="seguridad" className="py-24 bg-[#210635]/80 backdrop-blur-[20px] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-4xl md:text-5xl font-bold mb-4"
              >
                Tu tranquilidad es nuestra prioridad
              </motion.h2>
              <p className="text-xl text-[#F6A5C0]/80">
                Garantizamos un entorno seguro y confiable para tu familia
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <ShieldPlus className="w-10 h-10 text-white" />,
                  title: "Verificación Rigurosa",
                  desc: "Antecedentes penales, certificados de salud y referencias comprobadas exhaustivamente.",
                  color: "from-[#837AB6] to-[#9D85B6]"
                },
                {
                  icon: <Lock className="w-10 h-10 text-white" />,
                  title: "Pagos Seguros Escrow",
                  desc: "Tu dinero se retiene de forma segura hasta que el servicio culmine satisfactoriamente.",
                  color: "from-[#CC8DB3] to-[#9D85B6]"
                },
                {
                  icon: <Star className="w-10 h-10 text-white" />,
                  title: "Reseñas Verídicas",
                  desc: "Sistema de calificaciones basado únicamente en experiencias reales de otras familias.",
                  color: "from-[#9D85B6] to-[#F6A5C0]"
                }
              ].map((item, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] rounded-3xl p-8 border border-[rgba(255,255,255,0.2)] hover:bg-[rgba(33,6,53,0.75)] transition-colors shadow-lg shadow-black/30"
                >
                  <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br ${item.color} shadow-lg mb-6`}>
                    {item.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                  <p className="text-[#F6A5C0]/80 leading-relaxed">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>
      )}

      {/* Footer - solo en contenido completo y no admin */}
      {showFullContent && view !== 'admin' && (
      <footer className="bg-[rgba(33,6,53,0.85)] backdrop-blur-[20px] text-white py-16 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-[#CC8DB3] p-2 rounded-lg">
                  <ShieldPlus className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-black tracking-tight uppercase">
                  CERTINANAS
                </span>
              </div>
              <p className="text-[#6667AB] max-w-sm leading-relaxed">
                La plataforma líder en Perú que conecta familias con cuidadoras especializadas en niños neurodivergentes de manera segura y confiable.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-lg">Plataforma</h4>
              <ul className="space-y-4 text-white/60">
                <li><a href="#" className="hover:text-[#F6A5C0] transition-colors">¿Cómo funciona?</a></li>
                <li><a href="#" className="hover:text-[#F6A5C0] transition-colors">Seguridad y Confianza</a></li>
                <li><a href="#" className="hover:text-[#F6A5C0] transition-colors">Para Familias</a></li>
                <li><a href="#" className="hover:text-[#F6A5C0] transition-colors">Postular como Cuidadora</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-lg">Soporte</h4>
              <ul className="space-y-4 text-white/60">
                <li><span className="block text-sm text-white/50 mb-1">Email</span> contacto@certinanas.pe</li>
                <li><span className="block text-sm text-white/50 mb-1">WhatsApp</span> +51 987 654 321</li>
                <li><span className="block text-sm text-white/50 mb-1">Oficina</span> Lima, Perú</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/50 text-sm">
              &copy; 2026 CERTINANAS. Todos los derechos reservados.
            </p>
            <div className="flex gap-6 text-sm text-[#6667AB]">
              <button onClick={() => handleOpenLegal('terms')} className="hover:text-white transition-colors">Términos de Servicio</button>
              <button onClick={() => handleOpenLegal('privacy')} className="hover:text-white transition-colors">Política de Privacidad</button>
            </div>
          </div>
        </div>
      </footer>
      )}

      {/* Modals & Support */}
      <AuthModal 
        isOpen={authModalConfig.isOpen}
        mode={authModalConfig.mode}
        onClose={handleCloseAuth}
        onOpenLegal={handleOpenLegal}
      />
      
      <InterviewModal
        isOpen={interviewModal.isOpen}
        nanaName={interviewModal.nanaName}
        onClose={() => setInterviewModal({ ...interviewModal, isOpen: false })}
      />

      <ProfileModal
        isOpen={profileModalConfig.isOpen}
        nana={profileModalConfig.nana}
        onClose={() => setProfileModalConfig({ ...profileModalConfig, isOpen: false })}
        onRequestInterview={handleRequestInterview}
      />

      <LegalModal
        isOpen={legalModalConfig.isOpen}
        type={legalModalConfig.type}
        onClose={() => setLegalModalConfig({ ...legalModalConfig, isOpen: false })}
      />

      {showFullContent && view !== 'admin' && <FloatingSupport />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
