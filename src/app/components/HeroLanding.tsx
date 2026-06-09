import { motion } from 'motion/react';
import { Shield, Lock, FileText, CheckCircle2, Users, Sparkles, HeartHandshake, ArrowRight, Star, Award, BadgeCheck } from 'lucide-react';

type Props = {
  onRegisterFamily: () => void;
  onRegisterCaregiver: () => void;
  onScrollCatalog: () => void;
};

const trustBadges = [
  { icon: Shield, label: 'Perfiles Verificados', color: 'text-white' },
  { icon: Lock, label: 'Pago Seguro Escrow', color: 'text-[#CC8DB3]' },
  { icon: FileText, label: 'Ley 29733 Cumplida', color: 'text-white' },
];

const steps = [
  { n: 1, title: 'Crea tu cuenta', desc: 'Regístrate como familia o cuidadora con verificación rigurosa.', icon: Users, color: 'from-blue-500 to-[#210635]' },
  { n: 2, title: 'Matching inteligente', desc: 'Te conectamos con perfiles certificados según tus necesidades.', icon: Sparkles, color: 'from-emerald-400 to-[#CC8DB3]' },
  { n: 3, title: 'Cuidado seguro', desc: 'Pago Escrow retenido hasta que confirmes el servicio.', icon: HeartHandshake, color: 'from-[#210635] to-[#CC8DB3]' },
];

export function HeroLanding({ onRegisterFamily, onRegisterCaregiver, onScrollCatalog }: Props) {
  return (
    <section id="inicio" className="relative bg-gradient-to-br from-[#210635] via-[#420D4B] to-[#7B337E] overflow-hidden">
      {/* Background grid + glows */}
      <div
        className="absolute inset-0 opacity-[0.35] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(30,58,138,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(30,58,138,0.06) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
        }}
      />
      <div className="absolute top-[-15%] left-[-10%] w-[55%] h-[55%] bg-[#CC8DB3]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-15%] w-[55%] h-[55%] bg-[#210635]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 lg:pt-28 lg:pb-32">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-7"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F6A5C0]" />
            </span>
            <span className="text-xs font-bold tracking-wide text-[#F5D5E0]">La plataforma #1 en cuidado neurodivergente · Perú</span>
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-5xl mx-auto text-center text-[2.75rem] sm:text-5xl lg:text-[4.25rem] font-extrabold text-white leading-[1.05] tracking-tight"
        >
          Cuidado especializado y seguro{' '}
          <span className="relative inline-block">
            <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-[#CC8DB3] to-emerald-500">
              para quienes más amas
            </span>
            <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none" preserveAspectRatio="none">
              <path d="M2 9 Q 75 2 150 6 T 298 5" stroke="#CC8DB3" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.4" />
            </svg>
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-2xl mx-auto text-center mt-6 text-lg sm:text-xl text-[#F5D5E0] leading-relaxed font-light"
        >
          Conectamos familias con cuidadoras <strong className="font-semibold text-white">rigurosamente certificadas</strong> en condiciones neurodivergentes. Verificación clínica, pagos protegidos.
        </motion.p>

        {/* Trust badges row */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-10"
        >
          {trustBadges.map((b, i) => (
            <motion.div
              key={b.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}
              whileHover={{ y: -3 }}
              className="group inline-flex items-center gap-2.5 px-5 py-3 rounded-full bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 transition-all"
            >
              <span className="w-8 h-8 rounded-full bg-gradient-to-br from-[#210635] to-[#420D4B] border border-[rgba(255,255,255,0.2)] flex items-center justify-center shadow-inner">
                <b.icon className={`w-4 h-4 ${b.color}`} />
              </span>
              <span className="text-sm font-bold text-[#F5D5E0]">{b.label}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* SPLIT CARDS */}
        <div className="relative mt-20">
          {/* decorative orbs */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-32 h-32 bg-[#CC8DB3]/20 blur-3xl rounded-full" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-6 relative">
            {/* FAMILY CARD */}
            <motion.div
              initial={{ opacity: 0, x: -20, y: 20 }}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              whileHover={{ y: -6 }}
              className="relative group lg:translate-y-3"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-br from-[#CC8DB3]/30 to-[#210635]/20 rounded-[2.25rem] blur opacity-40 group-hover:opacity-70 transition-opacity" />
              <div className="relative bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl overflow-hidden">
                {/* image */}
                <div className="relative h-60 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1591084728795-1149f32d9866?w=1200&auto=format&fit=crop&q=80"
                    alt="Cuidadora con niño"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#210635] via-[#210635]/10 to-transparent" />

                  {/* Floating verified badge */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                    className="absolute top-4 right-4 bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl px-3 py-2 flex items-center gap-2"
                  >
                    <div className="w-7 h-7 rounded-full bg-[#F6A5C0]/30 flex items-center justify-center">
                      <BadgeCheck className="w-4 h-4 text-[#CC8DB3]" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-white leading-none">Verificado</p>
                      <p className="text-[9px] text-[#6667AB] leading-none mt-0.5">Clínicamente</p>
                    </div>
                  </motion.div>
                </div>

                {/* content */}
                <div className="p-7">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F6A5C0] text-[#210635] text-xs font-bold mb-4">
                    PARA FAMILIAS
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">Encuentra cuidado especializado para tu familia</h3>
                  <ul className="space-y-2.5 mb-7">
                    {[
                      'Cuidadoras certificadas en TEA, TDAH y Síndrome de Down',
                      'Filtros por experiencia y especialización clínica',
                      'Pago Escrow: tu dinero seguro hasta confirmar el servicio',
                    ].map((t) => (
                      <li key={t} className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-5 h-5 text-[#CC8DB3] shrink-0 mt-0.5" />
                        <span className="text-sm text-[#F5D5E0] leading-relaxed">{t}</span>
                      </li>
                    ))}
                  </ul>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onRegisterFamily}
                    className="w-full py-3.5 bg-[#CC8DB3] text-[#210635] rounded-xl text-base font-bold hover:shadow-xl hover:shadow-[#CC8DB3]/30 transition-all inline-flex items-center justify-center gap-2 group/btn"
                  >
                    Crear Cuenta de Familia
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </motion.button>
                </div>
              </div>

              {/* Floating mini card */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
                className="hidden lg:flex absolute -bottom-6 -left-6 bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl px-4 py-3 items-center gap-3"
              >
                <div className="flex -space-x-2">
                  <img className="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100" alt="" />
                  <img className="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100" alt="" />
                  <img className="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100" alt="" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white leading-none">+200 familias</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-3 h-3 text-[#CC8DB3] fill-[#CC8DB3]" />
                    <span className="text-[10px] font-bold text-[#6667AB]">4.9 confían en CERTINANAS</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* CAREGIVER CARD */}
            <motion.div
              initial={{ opacity: 0, x: 20, y: 20 }}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1 }}
              whileHover={{ y: -6 }}
              className="relative group lg:-translate-y-3"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-br from-[#210635]/30 to-[#CC8DB3]/20 rounded-[2.25rem] blur opacity-40 group-hover:opacity-70 transition-opacity" />
              <div className="relative bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl overflow-hidden">
                <div className="relative h-60 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=1200&auto=format&fit=crop&q=80"
                    alt="Cuidadora profesional con certificado"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#210635] via-[#210635]/10 to-transparent" />

                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 }}
                    className="absolute top-4 right-4 bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl px-3 py-2 flex items-center gap-2"
                  >
                    <div className="w-7 h-7 rounded-full bg-[#9d85b6]/30 flex items-center justify-center">
                      <Award className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-white leading-none">Certificación</p>
                      <p className="text-[9px] text-[#6667AB] leading-none mt-0.5">Reconocida</p>
                    </div>
                  </motion.div>
                </div>

                <div className="p-7">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#CC8DB3] text-[#210635] text-xs font-bold mb-4">
                    PARA CUIDADORAS
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">Únete a nuestra red de profesionales certificadas</h3>
                  <ul className="space-y-2.5 mb-7">
                    {[
                      'Accede a familias serias que valoran tu experiencia clínica',
                      'Pagos garantizados mediante sistema Escrow protegido',
                      'Construye reputación con reseñas verídicas y verificables',
                    ].map((t) => (
                      <li key={t} className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-5 h-5 text-[#CC8DB3] shrink-0 mt-0.5" />
                        <span className="text-sm text-[#F5D5E0] leading-relaxed">{t}</span>
                      </li>
                    ))}
                  </ul>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onRegisterCaregiver}
                    className="w-full py-3.5 bg-[#F6A5C0] text-[#210635] rounded-xl text-base font-bold hover:shadow-lg transition-all inline-flex items-center justify-center gap-2 group/btn"
                  >
                    Postular como Cuidadora
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </motion.button>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.7 }}
                className="hidden lg:flex absolute -top-5 -right-5 bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl px-4 py-3 items-center gap-3"
              >
                <div className="w-9 h-9 rounded-xl bg-[#F6A5C0]/20 flex items-center justify-center">
                  <Lock className="w-4 h-4 text-[#CC8DB3]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white leading-none">Pago garantizado</p>
                  <p className="text-[10px] text-[#6667AB] mt-0.5">Sistema Escrow seguro</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* TIMELINE: How it works */}
        <div className="mt-28 lg:mt-32">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="inline-block text-xs font-bold tracking-[0.2em] text-[#CC8DB3] uppercase mb-3"
            >
              ¿Cómo funciona?
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight"
            >
              Un proceso simple, seguro y fluido
            </motion.h2>
          </div>

          <div className="relative">
            {/* Curved connector */}
            <svg
              className="hidden lg:block absolute top-12 left-0 w-full h-32 pointer-events-none"
              viewBox="0 0 1000 100"
              fill="none"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="pathGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#210635" stopOpacity="0.6" />
                  <stop offset="50%" stopColor="#CC8DB3" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#210635" stopOpacity="0.6" />
                </linearGradient>
              </defs>
              <path
                d="M 160 50 Q 330 -20 500 50 T 840 50"
                stroke="url(#pathGrad)"
                strokeWidth="2.5"
                strokeDasharray="6 8"
                strokeLinecap="round"
                fill="none"
              />
            </svg>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 relative">
              {steps.map((s, i) => (
                <motion.div
                  key={s.n}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="relative flex flex-col items-center text-center"
                >
                  <div className={`relative w-24 h-24 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-xl shadow-blue-900/20 mb-6`}>
                    <s.icon className="w-10 h-10 text-white" strokeWidth={1.8} />
                    <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center text-xs font-extrabold text-[#210635]">
                      {s.n}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{s.title}</h3>
                  <p className="text-sm text-[#F5D5E0] leading-relaxed max-w-xs">{s.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="text-center mt-14">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onScrollCatalog}
              className="px-7 py-3.5 bg-[rgba(33,6,53,0.4)] backdrop-blur-sm border border-[rgba(255,255,255,0.2)] text-white rounded-xl font-bold hover:bg-[rgba(33,6,53,0.5)] hover:shadow-md transition-all inline-flex items-center gap-2"
            >
              Explorar catálogo de cuidadoras
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>
    </section>
  );
}
