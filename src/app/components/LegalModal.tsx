import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck, FileText } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'terms' | 'privacy' | null;
}

export function LegalModal({ isOpen, onClose, type }: LegalModalProps) {
  if (!isOpen || !type) return null;

  const content = {
    privacy: {
      title: 'Política de Privacidad',
      icon: <ShieldCheck className="w-6 h-6 text-[#cc8db3]" />,
      text: (
        <div className="space-y-4 text-[#F5D5E0] leading-relaxed">
          <p>
            En <strong>CERTINANAS</strong>, la seguridad de su familia es nuestra prioridad. En cumplimiento con la <strong>Ley N° 29733 (Ley de Protección de Datos Personales de Perú)</strong>, informamos que los datos sobre diagnósticos de menores (TEA, TDAH, Síndrome de Down, etc.) y los antecedentes policiales y médicos de las cuidadoras son tratados como Datos Sensibles.
          </p>
          <p>
            Esta información se encuentra protegida bajo estrictos protocolos de encriptación de nivel bancario y su uso está estrictamente limitado a la facilitación del servicio de intermediación y conexión entre familias y especialistas.
          </p>
          <p>
            No compartimos información con terceros sin su consentimiento explícito y usted tiene el derecho irrevocable a la rectificación, actualización o supresión de sus datos en cualquier momento a través de nuestro canal de soporte.
          </p>
        </div>
      )
    },
    terms: {
      title: 'Términos del Servicio',
      icon: <FileText className="w-6 h-6 text-white" />,
      text: (
        <div className="space-y-4 text-[#F5D5E0] leading-relaxed">
          <div>
            <h3 className="text-white font-bold text-sm mb-1">1. Aceptación</h3>
            <p>
              Al usar CERTINANAS aceptas estos términos. La plataforma actúa como intermediaria entre familias y cuidadoras especializadas.
            </p>
          </div>
          <div>
            <h3 className="text-white font-bold text-sm mb-1">2. Verificación</h3>
            <p>
              Todas las cuidadoras pasan por un proceso de validación documental (DNI, antecedentes penales, certificaciones de salud y educación) antes de ser aprobadas.
            </p>
          </div>
          <div>
            <h3 className="text-white font-bold text-sm mb-1">3. Sistema Escrow</h3>
            <p>
              Los pagos se retienen en una cuenta Escrow y solo se liberan cuando el servicio es confirmado por la familia. La plataforma retiene el 8% de comisión.
            </p>
          </div>
          <div>
            <h3 className="text-white font-bold text-sm mb-1">4. Tarifa de consulta</h3>
            <p>
              Para agendar una entrevista virtual se cobra una tarifa de S/ 25 por adelantado. Si la familia contrata el servicio, este monto se descuenta del primer pago.
            </p>
          </div>
        </div>
      )
    }
  };

  const { title, icon, text } = content[type];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-[#210635]/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-3xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="p-6 border-b border-[rgba(255,255,255,0.1)] flex justify-between items-center bg-[rgba(33,6,53,0.4)] shrink-0">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${type === 'privacy' ? 'bg-[#f6a5c0]/30' : 'bg-[#9d85b6]/30'}`}>
                {icon}
              </div>
              <h2 className="text-2xl font-bold text-white">{title}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-[#6667AB] hover:text-white hover:bg-[rgba(33,6,53,0.4)] rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1">
            {text}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-[rgba(255,255,255,0.1)] bg-[rgba(33,6,53,0.4)] shrink-0">
            <button
              onClick={onClose}
              className="w-full py-3.5 bg-[#CC8DB3] text-[#210635] rounded-xl font-bold hover:bg-[#b07a9a] transition-all shadow-lg shadow-black/30"
            >
              Entendido y Cerrar
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
