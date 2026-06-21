import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowLeft, Info, CheckCircle, XCircle } from 'lucide-react';

// ─── DNI ELECTRÓNICO ────────────────────────────
const DniTemplate = () => (
  <div className="rounded-xl overflow-hidden shadow-xl shadow-black/40 max-w-sm mx-auto border border-gray-300 relative">
    {/* Security background pattern */}
    <div className="absolute inset-0 bg-gradient-to-br from-[#E8F0FE] via-[#D6E8FA] to-[#B8D4F0] opacity-40" />
    <div className="absolute inset-0" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 12px, rgba(196,167,71,0.04) 12px, rgba(196,167,71,0.04) 13px), repeating-linear-gradient(90deg, transparent, transparent 12px, rgba(196,167,71,0.04) 12px, rgba(196,167,71,0.04) 13px)' }} />

    {/* Guilloche border */}
    <div className="absolute inset-1 rounded-xl border border-[rgba(196,167,71,0.15)]" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(196,167,71,0.06) 0%, transparent 50%), radial-gradient(circle at 70% 50%, rgba(196,167,71,0.06) 0%, transparent 50%)' }} />

    <div className="relative bg-[rgba(255,255,255,0.85)] backdrop-blur-sm">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#4A6585] via-[#5A7A9F] to-[#4A6585] px-3.5 py-2 flex items-center gap-2">
        <div className="w-6 h-6 rounded-full border-[1.5px] border-[#C4A747] flex items-center justify-center flex-shrink-0">
          <span className="text-[#C4A747] text-[7px] font-black">RP</span>
        </div>
        <div className="flex-1">
          <p className="text-white text-[9px] font-bold tracking-[0.12em] leading-tight">REPÚBLICA DEL PERÚ</p>
        </div>
        <div className="flex items-center gap-1 bg-[rgba(255,255,255,0.12)] rounded px-1.5 py-0.5">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" className="text-[#C4A747]"><rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M8 10h8M8 14h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          <span className="text-[#C4A747] text-[6px] font-bold tracking-wider">DNI ELECTRÓNICO</span>
        </div>
      </div>

      {/* Body */}
      <div className="p-3.5 flex gap-3">
        {/* Photo */}
        <div className="w-[82px] h-[98px] bg-gradient-to-b from-[#E8EFF7] to-[#D0DCEB] border border-gray-300 rounded flex flex-col items-center justify-center flex-shrink-0 overflow-hidden shadow-inner">
          <div className="w-11 h-11 rounded-full bg-[#CC8DB3] flex items-center justify-center text-white font-bold text-base">LR</div>
          <p className="text-[5px] text-gray-400 mt-1 tracking-wider">FOTO</p>
        </div>

        {/* Fields */}
        <div className="flex-1 space-y-1">
          <div className="border-b border-gray-200 pb-0.5">
            <span className="text-[6px] text-gray-400 font-semibold tracking-wide">APELLIDOS</span>
            <p className="text-[10px] font-bold text-[#1a1a2e] leading-tight">RAMIREZ GARCIA</p>
          </div>
          <div className="border-b border-gray-200 pb-0.5">
            <span className="text-[6px] text-gray-400 font-semibold tracking-wide">NOMBRES</span>
            <p className="text-[10px] font-bold text-[#1a1a2e] leading-tight">LUCIA FERNANDA</p>
          </div>
          <div className="border-b border-gray-200 pb-0.5 flex items-end justify-between">
            <div>
              <span className="text-[6px] text-gray-400 font-semibold tracking-wide">DNI</span>
              <p className="text-[12px] font-extrabold text-[#1a1a2e] tracking-widest">48 765 321</p>
            </div>
            <div className="w-[30px] h-[18px] bg-gradient-to-br from-[#C4A747] to-[#A08830] rounded-[2px] flex items-center justify-center">
              <span className="text-white text-[4px] font-bold tracking-wider">CHIP</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 pt-0.5">
            <div>
              <span className="text-[6px] text-gray-400 font-semibold tracking-wide">FECHA NAC.</span>
              <p className="text-[8px] font-bold text-gray-700">15/03/1992</p>
            </div>
            <div>
              <span className="text-[6px] text-gray-400 font-semibold tracking-wide">SEXO</span>
              <p className="text-[8px] font-bold text-gray-700">F</p>
            </div>
            <div>
              <span className="text-[6px] text-gray-400 font-semibold tracking-wide">EST. CIVIL</span>
              <p className="text-[8px] font-bold text-gray-700">SOLTERA</p>
            </div>
            <div>
              <span className="text-[6px] text-gray-400 font-semibold tracking-wide">GRUPO SANG.</span>
              <p className="text-[8px] font-bold text-gray-700">O+</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom security band */}
      <div className="border-t border-gray-200 px-3.5 py-1.5 flex items-center justify-between bg-gradient-to-r from-[rgba(74,101,133,0.04)] to-transparent">
        <div className="flex items-center gap-2">
          {/* Microtext barcode */}
          <div className="flex gap-[1px]">
            {[...Array(24)].map((_, i) => (
              <div key={i} className="w-[1px] h-[10px]" style={{ backgroundColor: `rgba(0,0,0,${0.15 + (i % 4) * 0.12})` }} />
            ))}
          </div>
          <span className="text-[5px] text-gray-400 font-mono tracking-[0.2em]">IDPER-48765321</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="text-[4px] text-gray-300 font-mono leading-none">∞</div>
          <span className="text-[5px] text-gray-400">MRZ</span>
        </div>
      </div>

      {/* Microtext line */}
      <div className="px-3.5 pb-1">
        <p className="text-[4px] text-gray-300 font-mono tracking-[0.3em] text-center">REPÚBLICA DEL PERÚ • DOCUMENTO NACIONAL DE IDENTIDAD • 48 765 321 • RAMIREZ GARCIA • LUCIA FERNANDA</p>
      </div>
    </div>
  </div>
);

// ─── ANTECEDENTES PENALES ──────────────────────
const AntecedentesTemplate = () => (
  <div className="bg-white rounded-xl overflow-hidden shadow-xl shadow-black/40 max-w-sm mx-auto border border-gray-200">
    {/* Header */}
    <div className="bg-[#0D2B4E] px-4 py-3 flex items-center gap-3">
      <svg viewBox="0 0 28 28" className="w-7 h-7 flex-shrink-0"><circle cx="14" cy="14" r="13" fill="none" stroke="#C4A747" strokeWidth="1.5"/><path d="M14 6 L18 12 L14 18 L10 12Z" fill="#C4A747"/></svg>
      <div>
        <p className="text-white text-[11px] font-bold tracking-wider">PODER JUDICIAL DEL PERÚ</p>
        <p className="text-[#7BA3C7] text-[8px] font-medium">Corte Suprema de Justicia — Registro Nacional</p>
      </div>
    </div>

    {/* Content */}
    <div className="p-4 space-y-3">
      {/* Data grid */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 bg-gray-50 rounded-lg p-3 border border-gray-100">
        {[
          ['APELLIDOS', 'RAMIREZ GARCIA'],
          ['NOMBRES', 'LUCIA FERNANDA'],
          ['DNI', '48 765 321'],
          ['FECHA CONSULTA', '18/06/2026'],
          ['N° CERTIFICADO', 'RAP-2026-0487-321'],
        ].map(([l, v]) => (
          <div key={l}>
            <span className="text-[7px] text-gray-400 font-semibold tracking-wide">{l}</span>
            <p className="text-[10px] font-bold text-gray-900">{v}</p>
          </div>
        ))}
        <div className="col-span-2">
          <span className="text-[7px] text-gray-400 font-semibold tracking-wide">FINALIDAD</span>
          <p className="text-[9px] text-gray-700">Evaluación para cuidado infantil — CertiNanas</p>
        </div>
      </div>

      {/* Result seal */}
      <div className="border-2 border-[#1B5E20] rounded-xl bg-gradient-to-b from-[#E8F5E9] to-[#C8E6C9] p-3 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]">
          <div className="w-full h-full" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 8px, #000 8px, #000 9px)' }} />
        </div>
        <CheckCircle className="w-7 h-7 text-[#2E7D32] mx-auto mb-1" />
        <p className="text-[11px] font-extrabold text-[#1B5E20] tracking-wider">NO REGISTRA ANTECEDENTES PENALES</p>
        <p className="text-[8px] text-[#558B2F] mt-0.5">Certificado válido para fines legales y administrativos</p>
        <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[rgba(27,94,32,0.12)]">
          <div className="w-1.5 h-1.5 rounded-full bg-[#2E7D32] animate-pulse" />
          <span className="text-[7px] font-bold text-[#2E7D32] tracking-wider">VERIFICADO</span>
        </div>
      </div>

      {/* Security footer */}
      <div className="flex items-center justify-between pt-1 border-t border-gray-100">
        <div className="flex items-center gap-1.5">
          <svg width="40" height="14" viewBox="0 0 40 14"><rect x="0" y="0" width="40" height="14" fill="none" stroke="#ccc" strokeWidth="0.5"/><line x1="2" y1="7" x2="38" y2="7" stroke="#ddd" strokeWidth="0.5"/><text x="20" y="10" fontSize="4" fill="#bbb" textAnchor="middle" fontFamily="monospace">RAP-2026-0487-321</text></svg>
          <span className="text-[6px] text-gray-400 font-mono tracking-wider">VER: rap.pj.gob.pe/0487-321</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center">
          <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-gray-300" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ─── CERTIFICADO DE SALUD ──────────────────────
const SaludTemplate = () => (
  <div className="bg-white rounded-xl overflow-hidden shadow-xl shadow-black/40 max-w-sm mx-auto border border-gray-200">
    {/* Header */}
    <div className="bg-gradient-to-r from-[#0D4F2B] to-[#1B7A42] px-4 py-3 flex items-center gap-3">
      <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center flex-shrink-0">
        <span className="text-[#0D4F2B] text-[8px] font-black">MS</span>
      </div>
      <div>
        <p className="text-white text-[10px] font-bold tracking-wider">MINISTERIO DE SALUD - MINSA</p>
        <p className="text-[#7CCD94] text-[8px] font-medium">Dirección General de Salud Ambiental</p>
      </div>
    </div>

    {/* Body */}
    <div className="p-4 space-y-3">
      {/* Subject data */}
      <div className="border-b border-gray-100 pb-2.5">
        <p className="text-[8px] text-gray-400 font-medium mb-1.5">DATOS DEL EVALUADO</p>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
          {[
            ['APELLIDOS', 'RAMIREZ GARCIA'],
            ['NOMBRES', 'LUCIA FERNANDA'],
            ['DNI', '48 765 321'],
            ['EDAD', '34 años'],
          ].map(([l, v]) => (
            <div key={l}>
              <span className="text-[7px] text-gray-400 font-semibold">{l}</span>
              <p className="text-[10px] font-bold text-gray-900">{v}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Medical checks */}
      <div>
        <p className="text-[8px] text-gray-400 font-medium mb-1.5">RESULTADOS DE EVALUACIÓN</p>
        <div className="space-y-1">
          {[
            ['Examen físico general', 'Normal', true],
            ['Evaluación oftalmológica', 'Normal', true],
            ['Evaluación psicológica', 'Normal', true],
            ['Vacunación completa', 'Sí', true],
            ['Radiografía de tórax', 'Normal', true],
            ['Hemograma completo', 'Dentro de parámetros', true],
          ].map(([exam, result, ok]) => (
            <div key={exam as string} className="flex items-center justify-between text-[10px] py-0.5">
              <span className="text-gray-600 font-medium">{exam as string}</span>
              <span className="flex items-center gap-1 text-gray-700 font-semibold">
                <CheckCircle className={`w-3 h-3 ${ok ? 'text-[#2E7D32]' : 'text-[#D14242]'}`} />
                {result as string}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Conclusion */}
      <div className="bg-gradient-to-r from-[#E8F5E9] to-[#C8E6C9] border border-[#4CAF50] rounded-lg p-3 text-center">
        <p className="text-[12px] font-extrabold text-[#1B5E20] tracking-wide">APTO PARA CUIDADO INFANTIL</p>
        <p className="text-[8px] text-[#558B2F]">Certificado de Salud Ocupacional — Válido 12 meses</p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-gray-100 text-[7px] text-gray-400">
        <span>Médico: Dra. María Torres M. — CMP 45821</span>
        <span>CSO-2026-0487</span>
      </div>
    </div>
  </div>
);

// ─── TÍTULO PROFESIONAL ─────────────────────────
const TituloTemplate = () => (
  <div className="bg-white rounded-xl overflow-hidden shadow-xl shadow-black/40 max-w-sm mx-auto border border-gray-200">
    {/* Ornate gold top border */}
    <div className="h-1 bg-gradient-to-r from-[#8B6914] via-[#C4A747] to-[#8B6914]" />

    {/* University crest + header */}
    <div className="px-4 pt-3 pb-1 text-center">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8B4513] to-[#5C2E0A] flex items-center justify-center mx-auto mb-1.5 shadow-md">
        <span className="text-[#C4A747] text-lg font-serif font-bold">U</span>
      </div>
      <p className="text-[10px] font-extrabold text-[#8B4513] tracking-[0.2em]">UNIVERSIDAD CÉSAR VALLEJO</p>
      <p className="text-[7px] text-gray-500 font-medium tracking-wider">LICENCIATURA EN EDUCACIÓN ESPECIAL</p>
    </div>

    {/* Decorative divider */}
    <div className="flex items-center gap-2 px-8 py-1.5">
      <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-[#C4A747] to-transparent" />
      <div className="w-1.5 h-1.5 rotate-45 bg-[#C4A747]" />
      <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-[#C4A747] to-transparent" />
    </div>

    {/* Proclamation */}
    <div className="px-5 pb-2 text-center">
      <p className="text-[8px] text-gray-500 italic leading-relaxed">
        El Rector de la Universidad César Vallejo, por cuanto:
      </p>
      <p className="text-[8px] text-gray-600 mt-1.5 leading-relaxed">
        Habiendo culminado satisfactoriamente los estudios y cumplido con los requisitos académicos establecidos,
      </p>
      <p className="text-[9px] text-gray-500 italic mt-1">Otorga el título de:</p>
    </div>

    {/* Name */}
    <div className="px-5 py-1.5 text-center border-t border-b border-[#C4A747]/30 mx-4">
      <p className="text-sm font-serif font-bold text-[#1a1a2e]">Lucia Fernanda Ramirez Garcia</p>
      <p className="text-[7px] text-gray-400">DNI: 48 765 321</p>
    </div>

    {/* Degree */}
    <div className="px-5 py-2 text-center">
      <p className="text-[11px] font-extrabold text-[#8B4513] tracking-wider">EDUCACIÓN ESPECIAL</p>
      <p className="text-[8px] text-gray-500 font-medium">Mención en Trastornos del Neurodesarrollo</p>
      <p className="text-[7px] text-gray-400 mt-1">Expedido el 15 de enero del 2020</p>
    </div>

    {/* Signatures */}
    <div className="flex justify-between items-end px-5 pb-3 pt-1 border-t border-gray-100 mx-4">
      <div className="text-center flex-1">
        <div className="w-20 h-8 mx-auto border-b border-gray-300 mb-0.5 flex items-center justify-center">
          <svg width="50" height="20" viewBox="0 0 50 20" className="opacity-40"><path d="M5 15 Q15 5 25 12 Q35 18 45 8" fill="none" stroke="#333" strokeWidth="1"/></svg>
        </div>
        <p className="text-[6px] font-bold text-gray-600">Dra. María E. Rodríguez</p>
        <p className="text-[5px] text-gray-400">RECTORA</p>
      </div>
      <div className="text-center flex-1">
        <div className="w-14 h-14 mx-auto rounded-full border-2 border-[#C4A747]/40 flex items-center justify-center">
          <div className="text-[6px] text-gray-400 leading-tight text-center">
            SELLO<br />SUNEDU
          </div>
        </div>
        <p className="text-[5px] text-gray-400 mt-0.5">Reg. 20-0487-EL</p>
      </div>
      <div className="text-center flex-1">
        <div className="w-20 h-8 mx-auto border-b border-gray-300 mb-0.5 flex items-center justify-center">
          <svg width="50" height="20" viewBox="0 0 50 20" className="opacity-40"><path d="M3 16 Q12 8 22 14 Q32 18 42 10" fill="none" stroke="#333" strokeWidth="1"/></svg>
        </div>
        <p className="text-[6px] font-bold text-gray-600">Dr. Carlos Mendoza L.</p>
        <p className="text-[5px] text-gray-400">DECANO</p>
      </div>
    </div>

    {/* Bottom gold border */}
    <div className="h-1 bg-gradient-to-r from-[#8B6914] via-[#C4A747] to-[#8B6914]" />
  </div>
);

// ─── TEMPLATE MAP ──────────────────────────────
const documentTemplates: Record<string, { title: string; render: () => React.ReactNode }> = {
  'DNI': { title: 'Vista previa - DNI', render: DniTemplate },
  'Antecedentes penales': { title: 'Vista previa - Antecedentes penales', render: AntecedentesTemplate },
  'Certificado de salud': { title: 'Vista previa - Certificado de salud', render: SaludTemplate },
  'Título profesional': { title: 'Vista previa - Título profesional', render: TituloTemplate },
};

type DocumentPreviewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  documentName: string;
  postulanteName: string;
  onVerificar: (documentName: string) => void;
  onMarcarInvalido: (documentName: string) => void;
};

export function DocumentPreviewModal({
  isOpen, onClose, documentName, postulanteName,
  onVerificar, onMarcarInvalido,
}: DocumentPreviewModalProps) {
  const template = documentTemplates[documentName];
  if (!template) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[rgba(20,5,35,0.85)] backdrop-blur-[30px] border border-[rgba(255,255,255,0.15)] shadow-2xl shadow-black/50 rounded-3xl p-0"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-3">
              <h2 className="text-white font-bold text-base">{template.title}</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.2)] flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-[#F5D5E0]" />
              </button>
            </div>

            {/* Document card */}
            <div className="px-6 pb-4">
              <template.render />
            </div>

            {/* Bottom action bar */}
            <div className="px-6 pb-5 space-y-3">
              {/* Info box */}
              <div className="bg-[rgba(66,13,75,0.5)] backdrop-blur-sm rounded-xl p-3 flex items-start gap-2.5 border border-[rgba(255,255,255,0.06)]">
                <div className="w-6 h-6 rounded-full bg-[#CC8DB3]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Info className="w-3.5 h-3.5 text-[#CC8DB3]" />
                </div>
                <p className="text-xs text-[#F5D5E0] leading-relaxed">
                  Documento enviado por <strong className="text-white">{postulanteName}</strong>. Verifica que la información sea legible, coincida con sus datos registrados y no presente alteraciones visibles.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={onClose}
                  className="flex items-center gap-1.5 text-sm font-semibold text-[#F5D5E0] hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Volver
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { onMarcarInvalido(documentName); onClose(); }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#D14242] hover:bg-[#D14242]/80 text-white text-xs font-bold transition-all"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Marcar inválido
                  </button>
                  <button
                    onClick={() => { onVerificar(documentName); onClose(); }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#10B981] hover:bg-[#10B981]/80 text-white text-xs font-bold transition-all shadow-lg shadow-black/20"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Verificar
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
