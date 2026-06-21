import { motion, AnimatePresence } from 'motion/react';
import { X, Eye, Clock, FileText, Shield, AlertTriangle } from 'lucide-react';

type DocumentoVerificacion = {
  id: number;
  nombre: string;
  estado: 'por verificar' | 'verificado' | 'rechazado';
  archivo?: string;
};

type PostulanteData = {
  id: number;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  experiencia: number;
  especialidades: string[];
  avatarLetras: string;
  horasTranscurridas: number;
  horasMaximas: number;
  documentos: DocumentoVerificacion[];
};

type PostulacionDetailModalProps = {
  isOpen: boolean;
  onClose: () => void;
  postulante: PostulanteData | null;
  onAprobar: (id: number) => void;
  onRechazar: (id: number) => void;
};

const defaultPostulante: PostulanteData = {
  id: 1,
  nombres: 'Lucia',
  apellidos: 'Ramirez',
  email: 'lucia.ramirez@email.com',
  telefono: '+51 987 654 321',
  experiencia: 8,
  especialidades: ['TDAH', 'Primeros Auxilios', 'Estimulación Temprana'],
  avatarLetras: 'LR',
  horasTranscurridas: 8.1,
  horasMaximas: 24,
  documentos: [
    { id: 1, nombre: 'DNI', estado: 'por verificar' },
    { id: 2, nombre: 'Antecedentes penales', estado: 'por verificar' },
    { id: 3, nombre: 'Certificado de salud', estado: 'por verificar' },
    { id: 4, nombre: 'Título profesional', estado: 'por verificar' },
  ],
};

export function PostulacionDetailModal({ isOpen, onClose, postulante, onAprobar, onRechazar }: PostulacionDetailModalProps) {
  const data = postulante || defaultPostulante;
  const progressPct = Math.min((data.horasTranscurridas / data.horasMaximas) * 100, 100);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[rgba(33,6,53,0.92)] backdrop-blur-[25px] border border-[rgba(255,255,255,0.2)] shadow-2xl shadow-black/50 rounded-3xl p-0"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.2)] flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-[#F5D5E0]" />
            </button>

            {/* Profile header */}
            <div className="bg-[rgba(255,255,255,0.05)] backdrop-blur-sm p-6 pb-5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[rgba(33,6,53,0.5)] border-2 border-[#CC8DB3] flex items-center justify-center text-[#F6A5C0] font-bold text-xl flex-shrink-0">
                  {data.avatarLetras}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold text-white truncate">{data.nombres} {data.apellidos}</h2>
                  <p className="text-sm text-[#F5D5E0] mt-0.5">{data.email}</p>
                  <p className="text-sm text-[#F5D5E0]">{data.telefono}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-2xl font-bold text-[#F6A5C0]">{data.experiencia}</p>
                  <p className="text-xs text-[#6667AB] font-medium">años exp.</p>
                </div>
              </div>
              {/* Specialties */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {data.especialidades.map((esp, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-full bg-[#7B337E] text-white text-[11px] font-semibold">
                    {esp}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Review time section */}
              <div className="bg-[rgba(255,255,255,0.04)] rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-[#F5D5E0] flex items-center gap-1.5">
                    <Clock className="w-4 h-4" /> Tiempo de revisión
                  </span>
                  <span className="text-sm font-bold text-[#F6A5C0]">
                    {data.horasTranscurridas}h / {data.horasMaximas}h max
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-[rgba(255,255,255,0.08)] overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPct}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full rounded-full bg-gradient-to-r from-[#7B337E] to-[#CC8DB3]"
                    style={{ boxShadow: '0 0 8px rgba(204,141,179,0.5)' }}
                  />
                </div>
              </div>

              {/* Documents to verify */}
              <div>
                <h3 className="text-base font-bold text-white mb-3">Documentos a verificar</h3>
                <div className="space-y-2">
                  {data.documentos.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center gap-3 bg-[rgba(255,255,255,0.04)] backdrop-blur-sm rounded-xl px-4 py-3 border border-[rgba(255,255,255,0.06)]"
                    >
                      <div className="w-9 h-9 rounded-lg bg-[rgba(33,6,53,0.4)] flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4 text-[#6667AB]" />
                      </div>
                      <span className="flex-1 text-sm font-medium text-[#F5D5E0]">{doc.nombre}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        doc.estado === 'por verificar'
                          ? 'bg-[#F5D5E0] text-[#210635]'
                          : doc.estado === 'verificado'
                          ? 'bg-[#cc8db3]/20 text-[#cc8db3]'
                          : 'bg-[#D14242]/20 text-[#D14242]'
                      }`}>
                        {doc.estado === 'por verificar' ? 'Por verificar' : doc.estado === 'verificado' ? 'Verificado' : 'Rechazado'}
                      </span>
                      <button className="px-3 py-1 rounded-full bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.18)] text-white text-xs font-medium transition-colors flex items-center gap-1">
                        <Eye className="w-3 h-3" /> Ver
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* External verification info */}
              <div className="bg-[rgba(66,13,75,0.5)] backdrop-blur-sm rounded-2xl p-4 border border-[rgba(255,255,255,0.06)]">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[rgba(33,6,53,0.4)] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Shield className="w-4 h-4 text-[#CC8DB3]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#F5D5E0] mb-1">Sistema externo de verificación</h4>
                    <p className="text-xs text-[#F5D5E0] leading-relaxed opacity-80">
                      Al aprobar, el sistema valida automáticamente los documentos contra las bases de datos de la PNP (Policía Nacional del Perú) y MINEDU (Ministerio de Educación) para confirmar la autenticidad de antecedentes penales, certificados y títulos profesionales.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-[rgba(255,255,255,0.08)]">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-semibold text-[#F5D5E0] hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => onRechazar(data.id)}
                  className="px-5 py-2 rounded-xl bg-[#D14242] hover:bg-[#D14242]/80 text-white text-sm font-bold transition-colors"
                >
                  Rechazar
                </button>
                <button
                  onClick={() => onAprobar(data.id)}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#7B337E] to-[#F6A5C0] hover:from-[#7B337E]/90 hover:to-[#F6A5C0]/90 text-white text-sm font-bold transition-all shadow-lg shadow-[#7B337E]/30"
                >
                  Aprobar
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
