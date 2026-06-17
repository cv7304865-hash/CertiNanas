import { motion } from 'motion/react';
import { useState } from 'react';
import { House, BookHeart, Heart, TreePine, ArrowLeft, ShieldCheck } from 'lucide-react';

interface SecurityVerificationProps {
  onSuccess: () => void;
  onBack: () => void;
}

const OPTIONS = [
  { id: 'house', icon: House, label: 'Casa' },
  { id: 'books', icon: BookHeart, label: 'Libros' },
  { id: 'heart', icon: Heart, label: 'Corazón' },
  { id: 'tree', icon: TreePine, label: 'Árbol' },
];

const TARGET_ID = 'heart';

export function SecurityVerification({ onSuccess, onBack }: SecurityVerificationProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState(false);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setError(false);

    if (id === TARGET_ID) {
      setTimeout(() => onSuccess(), 400);
    } else {
      setError(true);
      setTimeout(() => setSelectedId(null), 600);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="bg-[rgba(66,13,75,0.4)] backdrop-blur-sm rounded-2xl p-5 mb-6 border border-[rgba(255,255,255,0.08)] text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <ShieldCheck className="w-4 h-4 text-[#6667AB]" />
          <span className="text-xs font-semibold text-[#6667AB] uppercase tracking-wide">Verificación de seguridad</span>
        </div>
        <p className="text-lg font-bold text-white mt-2">
          Selecciona el <span className="text-[#CC8DB3]">corazón</span> <span className="inline-block">🤍</span>
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const isSelected = selectedId === opt.id;
          const isWrong = error && isSelected;
          const isCorrect = isSelected && opt.id === TARGET_ID;

          return (
            <motion.button
              key={opt.id}
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleSelect(opt.id)}
              className={`
                relative flex flex-col items-center justify-center gap-3 p-8 rounded-2xl
                bg-[rgba(255,255,255,0.1)] backdrop-blur-sm
                border-2 transition-all duration-200 cursor-pointer
                ${isCorrect ? 'border-emerald-400 bg-emerald-400/10 shadow-lg shadow-emerald-400/20' : ''}
                ${isWrong ? 'border-red-400 bg-red-400/10 shadow-lg shadow-red-400/20' : ''}
                ${!isSelected ? 'border-[rgba(255,255,255,0.15)] hover:border-[#F6A5C0] hover:bg-[rgba(255,255,255,0.15)]' : ''}
              `}
            >
              <Icon className={`w-10 h-10 ${isCorrect ? 'text-emerald-300' : isWrong ? 'text-red-300' : 'text-[#CC8DB3]'}`} />
              <span className={`text-sm font-semibold ${isCorrect ? 'text-emerald-300' : isWrong ? 'text-red-300' : 'text-white/70'}`}>
                {opt.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Error feedback */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-300 text-sm text-center mb-4"
        >
          Opción incorrecta. Intenta de nuevo.
        </motion.p>
      )}

      {/* Back */}
      <button
        type="button"
        onClick={onBack}
        className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-semibold text-[#F5D5E0] hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Volver
      </button>
    </div>
  );
}
