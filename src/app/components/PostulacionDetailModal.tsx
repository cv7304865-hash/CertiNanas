import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { X, Eye, Clock, FileText, Shield, AlertTriangle } from 'lucide-react';
import { DocumentPreviewModal } from './DocumentPreviewModal';

type DocumentoVerificacion = {
  id: number;
  nombre: string;
  estado: 'por verificar' | 'verificado' | 'rechazado';
  archivo?: string;
  motivoRechazo?: string;
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
  estado: string;
  documentos: DocumentoVerificacion[];
  motivoRechazo?: string;
  documentosRechazados?: { nombre: string; motivo: string }[];
};

type PostulacionDetailModalProps = {
  isOpen: boolean;
  onClose: () => void;
  postulante: PostulanteData | null;
  onAprobar: (id: number) => void;
  onRechazar: (id: number, motivo: string, listaNegra: boolean) => void;
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
  estado: 'Pendiente',
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
  const [previewDoc, setPreviewDoc] = useState<string | null>(null);
  const [documentosState, setDocumentosState] = useState<DocumentoVerificacion[]>(data.documentos);
  const [showRechazoForm, setShowRechazoForm] = useState(false);
  const [motivoRechazoInput, setMotivoRechazoInput] = useState('');
  const [listaNegra, setListaNegra] = useState(false);
  const allVerified = documentosState.every(d => d.estado === 'verificado');

  const handleDocVerificar = (docName: string) => {
    setDocumentosState(prev => prev.map(d => d.nombre === docName ? { ...d, estado: 'verificado' as const } : d));
  };

  const handleDocMarcarInvalido = (docName: string, motivo: string) => {
    setDocumentosState(prev => prev.map(d => d.nombre === docName ? { ...d, estado: 'rechazado' as const, motivoRechazo: motivo } : d));
  };

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
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[rgba(20,5,35,0.85)] backdrop-blur-[25px] border border-[rgba(255,255,255,0.2)] shadow-2xl shadow-black/50 rounded-3xl p-0"
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

              {/* Rejection reason (for rejected postulations) */}
              {data.motivoRechazo && (
                <div className="bg-[rgba(209,66,66,0.12)] border border-[#D14242]/30 rounded-2xl p-4 space-y-2">
                  <h4 className="text-sm font-bold text-[#D14242] flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" /> Motivo de rechazo
                  </h4>
                  <p className="text-sm text-[#F5D5E0] leading-relaxed">{data.motivoRechazo}</p>
                  {data.documentosRechazados && data.documentosRechazados.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <p className="text-xs font-semibold text-[#D14242]/80">Documentos rechazados:</p>
                      {data.documentosRechazados.map((doc, i) => (
                        <div key={i} className="flex items-start gap-2 pl-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#D14242] mt-1.5 flex-shrink-0" />
                          <div>
                            <span className="text-xs font-bold text-[#D14242]">{doc.nombre}:</span>{' '}
                            <span className="text-xs text-[#F5D5E0]/70">{doc.motivo}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Documents to verify */}
              <div>
                <h3 className="text-base font-bold text-white mb-3">Documentos a verificar</h3>
                <div className="space-y-2">
                  {documentosState.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center gap-3 bg-[rgba(255,255,255,0.04)] backdrop-blur-sm rounded-xl px-4 py-3 border border-[rgba(255,255,255,0.06)]"
                    >
                      <div className="w-9 h-9 rounded-lg bg-[rgba(33,6,53,0.4)] flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4 text-[#6667AB]" />
                      </div>
                      <span className="flex-1 text-sm font-medium text-[#F5D5E0]">{doc.nombre}</span>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          doc.estado === 'por verificar'
                            ? 'bg-[#F5D5E0] text-[#210635]'
                            : doc.estado === 'verificado'
                            ? 'bg-[#cc8db3]/20 text-[#cc8db3]'
                            : 'bg-[#D14242]/20 text-[#D14242]'
                        }`}>
                          {doc.estado === 'por verificar' ? 'Por verificar' : doc.estado === 'verificado' ? 'Verificado' : 'Rechazado'}
                        </span>
                        {doc.estado === 'rechazado' && doc.motivoRechazo && (
                          <span className="text-[9px] text-[#D14242]/80 text-right max-w-[140px] leading-tight">{doc.motivoRechazo}</span>
                        )}
                      </div>
                      <button
                        onClick={() => setPreviewDoc(doc.nombre)}
                        className="px-3 py-1 rounded-full bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.18)] text-white text-xs font-medium transition-colors flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" /> Ver
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* External verification info */}
              <div className="bg-[rgba(66,13,75,0.5)] backdrop-blur-sm rounded-2xl p-4 border border-[rgba(255,255,255,0.06)] relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#F6A5C0] rounded-l" />
                <div className="flex items-start gap-3 pl-2">
                  <div className="w-8 h-8 rounded-lg bg-[rgba(33,6,53,0.4)] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Shield className="w-4 h-4 text-[#CC8DB3]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#F5D5E0] mb-1">Sistema externo de verificación</h4>
                    <p className="text-xs text-[#F5D5E0] leading-relaxed opacity-80">
                      Al aprobar, el sistema valida automáticamente con la API de la PNP (antecedentes penales), MINEDU (títulos profesionales) y colegios profesionales. Tras la decisión, la cuidadora recibe una notificación SMS automatizada en su teléfono.
                    </p>
                  </div>
                </div>
              </div>

              {/* Rejection reason form */}
              {showRechazoForm && (
                <div className="bg-[rgba(209,66,66,0.1)] border border-[#D14242]/30 rounded-2xl p-4 space-y-3">
                  <h4 className="text-sm font-bold text-[#D14242] flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" /> Motivo de rechazo
                  </h4>
                  <textarea
                    value={motivoRechazoInput}
                    onChange={e => setMotivoRechazoInput(e.target.value)}
                    placeholder="Ej: No se encuentra capacitada, documentos vencidos, no cumple con los requisitos..."
                    className="w-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] rounded-xl px-3 py-2 text-sm text-white placeholder-[#6667AB] resize-none focus:outline-none focus:border-[#D14242] transition-colors min-h-[70px]"
                  />
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={listaNegra}
                      onChange={e => setListaNegra(e.target.checked)}
                      className="w-4 h-4 rounded border-[rgba(255,255,255,0.2)] bg-[rgba(255,255,255,0.06)] accent-[#D14242]"
                    />
                    <span className="text-sm text-[#F5D5E0]">Agregar a lista negra (no podrá volver a postular)</span>
                  </label>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => { setShowRechazoForm(false); setMotivoRechazoInput(''); setListaNegra(false); }}
                      className="px-3 py-1.5 text-xs font-semibold text-[#F5D5E0]/70 hover:text-[#F5D5E0] transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => { onRechazar(data.id, motivoRechazoInput, listaNegra); setShowRechazoForm(false); setMotivoRechazoInput(''); setListaNegra(false); }}
                      disabled={!motivoRechazoInput.trim()}
                      className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                        motivoRechazoInput.trim()
                          ? 'bg-[#D14242] hover:bg-[#D14242]/80 text-white'
                          : 'bg-[rgba(255,255,255,0.08)] text-[#6667AB] cursor-not-allowed'
                      }`}
                    >
                      Confirmar rechazo
                    </button>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-[rgba(255,255,255,0.08)]">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-semibold text-[#F5D5E0] hover:text-white transition-colors"
                >
                  Cerrar
                </button>
                {data.estado === 'Pendiente' && (
                  <>
                    <button
                      onClick={() => setShowRechazoForm(!showRechazoForm)}
                      className="px-5 py-2 rounded-xl bg-[#D14242] hover:bg-[#D14242]/80 text-white text-sm font-bold transition-colors"
                    >
                      Rechazar
                    </button>
                    <button
                      onClick={() => onAprobar(data.id)}
                      disabled={!allVerified}
                      className={`px-5 py-2 rounded-xl text-sm font-bold transition-all shadow-lg ${
                        allVerified
                          ? 'bg-gradient-to-r from-[#7B337E] to-[#F6A5C0] hover:from-[#7B337E]/90 hover:to-[#F6A5C0]/90 shadow-[#7B337E]/30 text-white'
                          : 'bg-[rgba(255,255,255,0.08)] text-[#6667AB] cursor-not-allowed'
                      }`}
                    >
                      Aprobar
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Document Preview Modal (second layer) */}
      <DocumentPreviewModal
        isOpen={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        documentName={previewDoc || ''}
        postulanteName={`${data.nombres} ${data.apellidos}`}
        onVerificar={handleDocVerificar}
        onMarcarInvalido={handleDocMarcarInvalido}
      />
    </AnimatePresence>
  );
}
