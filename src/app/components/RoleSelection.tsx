import { motion } from 'motion/react';
import { Users, Shield, ChevronRight, Heart, Sparkles } from 'lucide-react';

interface RoleSelectionProps {
  onSelect: (role: 'familia' | 'cuidadora') => void;
  onLogin: () => void;
}

export function RoleSelection({ onSelect, onLogin }: RoleSelectionProps) {
  return (
    <div className="p-5">
      <div className="text-center mb-5">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[rgba(246,165,192,0.15)] border border-[rgba(255,255,255,0.1)] mb-3">
          <Sparkles className="w-6 h-6 text-[#F6A5C0]" />
        </div>
        <h2 className="text-lg font-bold text-white">Bienvenido a CERTINANAS</h2>
        <p className="text-xs text-[#6667AB] mt-1">Antes de comenzar, dinos quién eres</p>
      </div>

      <div className="space-y-3">
        {/* Familia */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-[rgba(255,255,255,0.08)] backdrop-blur-sm border border-[rgba(255,255,255,0.15)] rounded-2xl p-4 hover:bg-[rgba(255,255,255,0.12)] transition-all group"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[rgba(102,103,171,0.25)] flex items-center justify-center shrink-0 border border-[rgba(255,255,255,0.1)]">
              <Users className="w-5 h-5 text-[#F5D5E0]" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-white">Soy una Familia</h3>
              <p className="text-[10px] text-[#6667AB] mt-0.5 leading-relaxed">
                Busco una cuidadora profesional y certificada para el bienestar de mis hijos.
              </p>
              <button
                onClick={() => onSelect('familia')}
                className="mt-2.5 w-full py-2 bg-[#F6A5C0] text-[#210635] text-xs font-bold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-[#F6A5C0]/20"
              >
                Buscar cuidadora <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Cuidadora */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-[rgba(255,255,255,0.08)] backdrop-blur-sm border border-[rgba(255,255,255,0.15)] rounded-2xl p-4 hover:bg-[rgba(255,255,255,0.12)] transition-all group"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[rgba(246,165,192,0.2)] flex items-center justify-center shrink-0 border border-[rgba(255,255,255,0.1)]">
              <Shield className="w-5 h-5 text-[#F6A5C0]" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-white">Soy una Cuidadora</h3>
              <p className="text-[10px] text-[#6667AB] mt-0.5 leading-relaxed">
                Soy profesional certificada y quiero postular para cuidar niños neurodivergentes.
              </p>
              <button
                onClick={() => onSelect('cuidadora')}
                className="mt-2.5 w-full py-2 bg-[#F6A5C0] text-[#210635] text-xs font-bold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-[#F6A5C0]/20"
              >
                Postular como cuidadora <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-4 text-center">
        <p className="text-[10px] text-[#6667AB]">
          ¿Ya tienes cuenta?{' '}
          <button onClick={onLogin} className="font-bold text-[#CC8DB3] hover:text-[#F6A5C0] transition-colors">
            Iniciar sesión
          </button>
        </p>
      </div>
    </div>
  );
}
