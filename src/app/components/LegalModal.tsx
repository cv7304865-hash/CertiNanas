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
        <div className="space-y-4 text-gray-600 leading-relaxed">
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
      title: 'Términos de Servicio',
      icon: <FileText className="w-6 h-6 text-[#250e2c]" />,
      text: (
        <div className="space-y-4 text-gray-600 leading-relaxed">
          <p>
            Al utilizar esta plataforma, usted acepta que <strong>CERTINANAS</strong> actúa como un intermediario tecnológico de confianza.
          </p>
          <p>
            <strong className="text-gray-800">Sistema de Pagos:</strong> Todos los pagos se realizan mediante un mecanismo de Retención Segura (Escrow). El dinero se carga al inicio del acuerdo, pero solo se libera a la cuidadora una vez que la familia confirme la finalización satisfactoria del servicio.
          </p>
          <p>
            <strong className="text-gray-800">Verificación:</strong> Aunque realizamos filtros rigurosos de antecedentes penales, policiales y certificaciones profesionales, la selección final y contratación es responsabilidad exclusiva de la familia tras la respectiva 'Cita de Conocimiento' virtual.
          </p>
          <p>
            <strong className="text-gray-800">Uso del Servicio:</strong> Queda estrictamente prohibido el intercambio de datos de contacto externos (teléfonos, correos personales) antes de la confirmación del pago en la plataforma. Esta medida se implementa para garantizar la seguridad financiera y física de ambas partes.
          </p>
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
        className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${type === 'privacy' ? 'bg-[#f6a5c0]/30' : 'bg-[#9d85b6]/30'}`}>
                {icon}
              </div>
              <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1">
            {text}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-100 bg-gray-50 shrink-0">
            <button
              onClick={onClose}
              className="w-full py-3.5 bg-[#250e2c] text-white rounded-xl font-bold hover:bg-[#1e40af] transition-all shadow-lg shadow-blue-900/20"
            >
              Entendido y Cerrar
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

