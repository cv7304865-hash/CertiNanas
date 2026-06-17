import { motion } from 'motion/react';
import { Shield, Lock, Star, Heart, KeyRound } from 'lucide-react';

type Props = {
  onRegister: () => void;
  onLogin: () => void;
};

const features = [
  { icon: Shield, label: '100% Cuidadoras verificadas' },
  { icon: Lock, label: 'Pagos protegidos con Escrow' },
  { icon: Star, label: 'Especialistas en neurodivergencia' },
];

export function WelcomePage({ onRegister, onLogin }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#210635] via-[#420D4B] to-[#7B337E] flex items-center justify-center p-4">
      {/* Glows decorativos */}
      <div className="fixed top-[-15%] left-[-10%] w-[55%] h-[55%] bg-[#CC8DB3]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-[-15%] right-[-10%] w-[55%] h-[55%] bg-[#210635]/10 rounded-full blur-[140px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-3xl overflow-hidden"
      >
        <div className="h-1.5 bg-gradient-to-r from-[#F6A5C0] to-[#CC8DB3]" />

        <div className="p-8 sm:p-10">
          {/* Logo + Badge */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#210635] to-[#7B337E] flex items-center justify-center mb-5 shadow-lg">
              <Heart className="w-8 h-8 text-[#F5D5E0]" fill="#F5D5E0" />
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[rgba(33,6,53,0.7)] text-[#F6A5C0] text-xs font-bold tracking-wide mb-4">
              <Lock className="w-3 h-3" /> ACCESO RESTRINGIDO
            </span>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-3">
              Bienvenido a CERTINANAS
            </h1>

            <p className="text-[#F5D5E0]/80 text-sm leading-relaxed max-w-sm">
              Cuidado infantil especializado para niños con TEA, TDAH y otras condiciones. Conectamos familias con cuidadoras certificadas.
            </p>
          </div>

          {/* Botones */}
          <div className="space-y-3 mb-8">
            <button
              onClick={onRegister}
              className="w-full py-3.5 bg-gradient-to-r from-[#7B337E] to-[#F6A5C0] text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg hover:opacity-90 text-sm"
            >
              Registrarse
            </button>
            <button
              onClick={onLogin}
              className="w-full py-3.5 bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.15)] text-[#CC8DB3] font-bold rounded-xl transition-all border border-[rgba(255,255,255,0.15)] text-sm flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4" /> Iniciar sesion
            </button>
          </div>

          {/* Caracteristicas */}
          <div className="space-y-3 mb-6">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-3 bg-[rgba(33,6,53,0.35)] rounded-xl px-4 py-3">
                <f.icon className="w-5 h-5 text-[#F6A5C0] flex-shrink-0" />
                <span className="text-sm text-[#6667AB]">{f.label}</span>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-center gap-4 pt-2 border-t border-[rgba(255,255,255,0.08)]">
            <button className="text-xs text-[#F5D5E0]/60 hover:text-[#F5D5E0] transition-colors">
              Terminos y condiciones
            </button>
            <span className="text-[rgba(255,255,255,0.08)]">|</span>
            <button className="text-xs text-[#F5D5E0]/60 hover:text-[#F5D5E0] transition-colors">
              Politica de privacidad
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
