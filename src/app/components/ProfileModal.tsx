import { motion, AnimatePresence } from 'motion/react';
import { X, Star, GraduationCap, Award, MessageSquare, Briefcase, Heart, Calendar } from 'lucide-react';

export interface NanaProfile {
  id: number;
  name: string;
  photo: string;
  rating: number;
  reviews: number;
  specialties: string[];
  areas: string[];
  experienceYears: number;
  experienceText: string;
  rate: number;
  shortDescription: string;
  longDescription: string;
  education: string[];
  certifications: string[];
  reviewsList: {
    author: string;
    rating: number;
    text: string;
    date: string;
  }[];
}

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  nana: NanaProfile | null;
  onRequestInterview: (nanaName: string) => void;
}

export function ProfileModal({ isOpen, onClose, nana, onRequestInterview }: ProfileModalProps) {
  if (!isOpen) return null;

  if (!nana) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-[#210635]/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] rounded-3xl p-8"
          >
            <div className="w-10 h-10 border-2 border-[#CC8DB3] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-[#6667AB] mt-4 text-sm">Cargando perfil...</p>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 bg-[#210635]/50 backdrop-blur-sm overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 30 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-3xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh] my-auto relative"
        >
          {/* Close Button (Floating) */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2.5 bg-[rgba(33,6,53,0.5)] backdrop-blur-md text-[#6667AB] hover:text-white hover:bg-[rgba(33,6,53,0.4)] rounded-full transition-all shadow-sm"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header Section */}
          <div className="bg-[rgba(33,6,53,0.4)] text-white px-8 pt-12 pb-8 relative shrink-0 overflow-hidden">
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-64 h-64 bg-[#f6a5c0]/20 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start relative z-10">
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl">
                  <img src={nana.photo} alt={nana.name} className="w-full h-full object-cover" />
                </div>
                <div className="absolute bottom-0 right-0 bg-[#cc8db3] p-1.5 rounded-full border-2 border-white" title="Perfil 100% Verificado">
                  <Award className="w-5 h-5 text-white" />
                </div>
              </div>

              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-3xl font-bold mb-2">{nana.name}</h2>
                
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mb-4 text-blue-100">
                  <div className="flex items-center bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
                    <Star className="w-4 h-4 text-[#CC8DB3] fill-[#CC8DB3] mr-1.5" />
                    <span className="font-semibold text-white">{nana.rating}</span>
                    <span className="text-sm ml-1">({nana.reviews} reseñas)</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Briefcase className="w-4 h-4 mr-1.5 opacity-80" />
                    {nana.experienceText}
                  </div>
                  <div className="flex items-center text-sm font-semibold bg-[#F5D5E0] text-[#210635] px-3 py-1 rounded-full">
                    S/ {nana.rate} / hora
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  {nana.specialties.map((spec, i) => (
                    <span key={i} className="px-3 py-1 bg-white/15 text-white text-xs font-medium rounded-lg border border-white/20">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Scrollable Body */}
          <div className="p-8 overflow-y-auto custom-scrollbar bg-[rgba(33,6,53,0.4)] backdrop-blur-sm flex-1">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column (Main Info) */}
              <div className="lg:col-span-2 space-y-8">
                {/* About Me */}
                <section className="bg-[rgba(33,6,53,0.4)] backdrop-blur-sm border border-[rgba(255,255,255,0.15)] rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-[#cc8db3]" /> Sobre Mí
                  </h3>
                  <p className="text-[#6667AB] leading-relaxed">
                    {nana.longDescription}
                  </p>
                </section>

                {/* Education & Certs */}
                <section className="grid sm:grid-cols-2 gap-6">
                  <div className="bg-[rgba(33,6,53,0.4)] backdrop-blur-sm border border-[rgba(255,255,255,0.15)] rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-[#cc8db3]" /> Formación
                    </h3>
                    <ul className="space-y-3">
                      {nana.education.map((edu, i) => (
                        <li key={i} className="text-sm text-[#6667AB] flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#CC8DB3] mt-1.5 shrink-0" />
                          <span className="leading-tight">{edu}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-[rgba(33,6,53,0.4)] backdrop-blur-sm border border-[rgba(255,255,255,0.15)] rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <Award className="w-5 h-5 text-[#cc8db3]" /> Certificaciones
                    </h3>
                    <ul className="space-y-3">
                      {nana.certifications.map((cert, i) => (
                        <li key={i} className="text-sm text-[#6667AB] flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#cc8db3] mt-1.5 shrink-0" />
                          <span className="leading-tight">{cert}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>

                {/* Reviews */}
                <section className="bg-[rgba(33,6,53,0.4)] backdrop-blur-sm border border-[rgba(255,255,255,0.15)] rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-[#cc8db3]" /> Reseñas de Familias
                  </h3>
                  <div className="space-y-4">
                    {nana.reviewsList.map((review, i) => (
                      <div key={i} className="bg-[rgba(33,6,53,0.4)] backdrop-blur-sm border border-[rgba(255,255,255,0.15)] rounded-xl p-4">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-bold text-[#F5D5E0]">{review.author}</span>
                          <span className="text-xs text-[#6667AB] font-medium">{review.date}</span>
                        </div>
                        <div className="flex mb-2">
                          {[...Array(5)].map((_, j) => (
                            <Star key={j} className={`w-3.5 h-3.5 ${j < review.rating ? 'text-[#CC8DB3] fill-[#CC8DB3]' : 'text-[#6667AB]'}`} />
                          ))}
                        </div>
                        <p className="text-sm text-[#6667AB] italic">"{review.text}"</p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              {/* Right Column (Sidebar Summary) */}
              <div className="space-y-6">
                <div className="bg-[rgba(33,6,53,0.4)] backdrop-blur-sm border border-[rgba(255,255,255,0.15)] rounded-2xl p-6 sticky top-0">
                  <h4 className="font-bold text-[#F5D5E0] mb-4 border-b border-[rgba(255,255,255,0.1)] pb-3">Áreas de Dedicación</h4>
                  <div className="flex flex-col gap-3 mb-8">
                    {nana.areas.map((area, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-[#6667AB] font-medium">
                        <CheckCircleIcon className="w-4 h-4 text-[#cc8db3]" />
                        {area}
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      onClose();
                      onRequestInterview(nana.name);
                    }}
                    className="w-full py-4 bg-[#CC8DB3] text-[#210635] rounded-xl font-bold hover:bg-[#b07a9a] transition-all shadow-lg shadow-black/30 flex items-center justify-center gap-2 group"
                  >
                    <Calendar className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    Agendar Entrevista
                  </button>
                  <p className="text-center text-xs text-[#6667AB] mt-3 font-medium">
                    15 min de videollamada sin costo
                  </p>
                </div>
              </div>

            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Helper icon
function CheckCircleIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  );
}
