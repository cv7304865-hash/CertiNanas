import { motion, AnimatePresence } from 'motion/react';
import { X, Info, CheckCircle, XCircle, FileText, Shield, Download } from 'lucide-react';
import { useState, useEffect } from 'react';

type DocumentType = {
  id: string;
  label: string;
  estado: 'Verificado' | 'Pendiente';
  icon: any;
};

const documentTypes: DocumentType[] = [
  { id: 'dni', label: 'DNI Electrónico', estado: 'Verificado', icon: FileText },
  { id: 'antecedentes', label: 'Antecedentes Penales', estado: 'Verificado', icon: Shield },
  { id: 'salud', label: 'Certificado de Salud (MINSA)', estado: 'Verificado', icon: FileText },
  { id: 'titulo', label: 'Título Profesional', estado: 'Verificado', icon: FileText },
  { id: 'carta', label: 'Carta de Presentación', estado: 'Pendiente', icon: FileText },
];

// ─── DNI ELECTRÓNICO ────────────────────────────
const DniTemplate = () => (
  <div className="rounded-xl overflow-hidden shadow-xl shadow-black/40 max-w-sm mx-auto border border-gray-300 relative">
    <div className="absolute inset-0 bg-linear-to-br from-[#E8F0FE] via-[#D6E8FA] to-[#B8D4F0] opacity-40" />
    <div className="absolute inset-0" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 12px, rgba(196,167,71,0.04) 12px, rgba(196,167,71,0.04) 13px), repeating-linear-gradient(90deg, transparent, transparent 12px, rgba(196,167,71,0.04) 12px, rgba(196,167,71,0.04) 13px)' }} />
    <div className="absolute inset-1 rounded-xl border border-[rgba(196,167,71,0.15)]" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(196,167,71,0.06) 0%, transparent 50%), radial-gradient(circle at 70% 50%, rgba(196,167,71,0.06) 0%, transparent 50%)' }} />
    <div className="relative bg-[rgba(255,255,255,0.85)] backdrop-blur-sm">
      <div className="bg-linear-to-r from-[#4A6585] via-[#5A7A9F] to-[#4A6585] px-3.5 py-2 flex items-center gap-2">
        <div className="w-6 h-6 rounded-full border-[1.5px] border-[#C4A747] flex items-center justify-center flex-shrink-0">
          <span className="text-[#C4A747] text-[7px] font-black">RP</span>
        </div>
        <div className="flex-1">
          <p className="text-white text-[9px] font-bold tracking-[0.12em] leading-tight">REPÚBLICA DEL PERÚ</p>
          <p className="text-[#8BA4C7] text-[5px] font-semibold tracking-wider">RENIEC — REGISTRO NACIONAL DE IDENTIFICACIÓN</p>
        </div>
        <div className="flex items-center gap-1 bg-[rgba(255,255,255,0.12)] rounded px-1.5 py-0.5">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" className="text-[#C4A747]"><rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M8 10h8M8 14h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          <span className="text-[#C4A747] text-[6px] font-bold tracking-wider">DNI ELECTRÓNICO</span>
        </div>
      </div>
      <div className="p-3.5 flex gap-3">
        <div className="w-[82px] h-[98px] bg-linear-to-b from-[#E8EFF7] to-[#D0DCEB] border border-gray-300 rounded flex flex-col items-center justify-center flex-shrink-0 overflow-hidden shadow-inner">
          <div className="w-11 h-11 rounded-full bg-[#CC8DB3] flex items-center justify-center text-white font-bold text-base">LR</div>
          <p className="text-[5px] text-gray-400 mt-1 tracking-wider">FOTO</p>
        </div>
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
              <span className="text-[6px] text-gray-400 font-semibold tracking-wide">DNI / CUI</span>
              <p className="text-[12px] font-extrabold text-[#1a1a2e] tracking-widest">48 765 321</p>
            </div>
            <div className="w-[30px] h-[18px] bg-linear-to-br from-[#C4A747] to-[#A08830] rounded-[2px] flex items-center justify-center">
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
          <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 pt-1 border-t border-gray-200">
            <div>
              <span className="text-[6px] text-gray-400 font-semibold tracking-wide">FECHA EMISIÓN</span>
              <p className="text-[7px] font-bold text-gray-600">15/06/2018</p>
            </div>
            <div>
              <span className="text-[6px] text-gray-400 font-semibold tracking-wide">FECHA CADUCIDAD</span>
              <p className="text-[7px] font-bold text-[#D14242]">15/06/2030</p>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-200 px-3.5 py-1.5 flex items-center justify-between bg-linear-to-r from-[rgba(74,101,133,0.04)] to-transparent">
        <div className="flex gap-[1px]">
          {[...Array(24)].map((_, i) => (
            <div key={i} className="w-[1px] h-[10px]" style={{ backgroundColor: `rgba(0,0,0,${0.15 + (i % 4) * 0.12})` }} />
          ))}
        </div>
        <span className="text-[5px] text-gray-400 font-mono tracking-[0.2em]">IDPER-48765321</span>
      </div>
      <div className="px-3.5 pb-1">
        <p className="text-[4px] text-gray-300 font-mono tracking-[0.3em] text-center">REPÚBLICA DEL PERÚ • DOCUMENTO NACIONAL DE IDENTIDAD • 48 765 321 • RAMIREZ GARCIA • LUCIA FERNANDA</p>
      </div>
    </div>
  </div>
);

// ─── ANTECEDENTES PENALES ──────────────────────
const AntecedentesTemplate = () => (
  <div className="bg-white rounded-xl overflow-hidden shadow-xl shadow-black/40 max-w-sm mx-auto border border-gray-200">
    <div className="bg-[#0D2B4E] px-4 py-3 flex items-center gap-3">
      <svg viewBox="0 0 28 28" className="w-7 h-7 flex-shrink-0"><circle cx="14" cy="14" r="13" fill="none" stroke="#C4A747" strokeWidth="1.5"/><path d="M14 6 L18 12 L14 18 L10 12Z" fill="#C4A747"/></svg>
      <div>
        <p className="text-white text-[11px] font-bold tracking-wider">PODER JUDICIAL DEL PERÚ</p>
        <p className="text-[#7BA3C7] text-[8px] font-medium">Corte Suprema de Justicia — Registro Nacional</p>
      </div>
    </div>
    <div className="p-4 space-y-3">
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
      <div className="border-2 border-[#1B5E20] rounded-xl bg-linear-to-b from-[#E8F5E9] to-[#C8E6C9] p-3 text-center relative overflow-hidden">
        <CheckCircle className="w-7 h-7 text-[#2E7D32] mx-auto mb-1" />
        <p className="text-[11px] font-extrabold text-[#1B5E20] tracking-wider">NO REGISTRA ANTECEDENTES PENALES</p>
        <p className="text-[8px] text-[#558B2F] mt-0.5">Certificado válido para fines legales y administrativos</p>
      </div>
    </div>
  </div>
);

// ─── CERTIFICADO DE SALUD ──────────────────────
const SaludTemplate = () => (
  <div className="bg-white rounded-xl overflow-hidden shadow-xl shadow-black/40 max-w-sm mx-auto border border-gray-200">
    <div className="bg-linear-to-r from-[#0D4F2B] to-[#1B7A42] px-4 py-3 flex items-center gap-3">
      <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center flex-shrink-0">
        <span className="text-[#0D4F2B] text-[8px] font-black">MS</span>
      </div>
      <div>
        <p className="text-white text-[10px] font-bold tracking-wider">MINISTERIO DE SALUD - MINSA</p>
        <p className="text-[#7CCD94] text-[8px] font-medium">Dirección General de Salud Ambiental</p>
      </div>
    </div>
    <div className="p-4 space-y-3">
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
      <div className="bg-linear-to-r from-[#E8F5E9] to-[#C8E6C9] border border-[#4CAF50] rounded-lg p-3 text-center">
        <p className="text-[12px] font-extrabold text-[#1B5E20] tracking-wide">APTO PARA CUIDADO INFANTIL</p>
        <p className="text-[8px] text-[#558B2F]">Certificado de Salud Ocupacional — Válido 12 meses</p>
      </div>
    </div>
  </div>
);

// ─── TÍTULO PROFESIONAL ─────────────────────────
const TituloTemplate = () => (
  <div className="bg-white rounded-xl overflow-hidden shadow-xl shadow-black/40 max-w-sm mx-auto border border-gray-200">
    <div className="h-1 bg-linear-to-r from-[#8B6914] via-[#C4A747] to-[#8B6914]" />
    <div className="px-4 pt-3 pb-1 text-center">
      <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#8B4513] to-[#5C2E0A] flex items-center justify-center mx-auto mb-1.5 shadow-md">
        <span className="text-[#C4A747] text-lg font-serif font-bold">U</span>
      </div>
      <p className="text-[10px] font-extrabold text-[#8B4513] tracking-[0.2em]">UNIVERSIDAD CÉSAR VALLEJO</p>
      <p className="text-[7px] text-gray-500 font-medium tracking-wider">LICENCIATURA EN EDUCACIÓN ESPECIAL</p>
    </div>
    <div className="flex items-center gap-2 px-8 py-1.5">
      <div className="flex-1 h-[1px] bg-linear-to-r from-transparent via-[#C4A747] to-transparent" />
      <div className="w-1.5 h-1.5 rotate-45 bg-[#C4A747]" />
      <div className="flex-1 h-[1px] bg-linear-to-r from-transparent via-[#C4A747] to-transparent" />
    </div>
    <div className="px-5 pb-2 text-center">
      <p className="text-[8px] text-gray-500 italic leading-relaxed">El Rector de la Universidad César Vallejo, por cuanto:</p>
      <p className="text-[8px] text-gray-600 mt-1.5 leading-relaxed">Habiendo culminado satisfactoriamente los estudios y cumplido con los requisitos académicos establecidos,</p>
      <p className="text-[9px] text-gray-500 italic mt-1">Otorga el título de:</p>
    </div>
    <div className="px-5 py-1.5 text-center border-t border-b border-[#C4A747]/30 mx-4">
      <p className="text-sm font-serif font-bold text-[#1a1a2e]">Lucia Fernanda Ramirez Garcia</p>
      <p className="text-[7px] text-gray-400">DNI: 48 765 321</p>
    </div>
    <div className="px-5 py-2 text-center">
      <p className="text-[11px] font-extrabold text-[#8B4513] tracking-wider">EDUCACIÓN ESPECIAL</p>
      <p className="text-[8px] text-gray-500 font-medium">Mención en Trastornos del Neurodesarrollo</p>
      <p className="text-[7px] text-gray-400 mt-1">Expedido el 15 de enero del 2020</p>
    </div>
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
          <div className="text-[6px] text-gray-400 leading-tight text-center">SELLO<br />SUNEDU</div>
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
    <div className="h-1 bg-linear-to-r from-[#8B6914] via-[#C4A747] to-[#8B6914]" />
  </div>
);

// ─── CARTA DE PRESENTACIÓN ─────────────────────
const CartaTemplate = () => (
  <div className="bg-white rounded-xl overflow-hidden shadow-xl shadow-black/40 max-w-sm mx-auto border border-gray-200 p-5">
    <div className="text-center mb-4">
      <div className="w-12 h-12 rounded-full bg-linear-to-br from-[#CC8DB3] to-[#F6A5C0] flex items-center justify-center mx-auto mb-2">
        <span className="text-white text-lg font-bold">LR</span>
      </div>
      <p className="text-sm font-bold text-gray-800">Lucia Fernanda Ramirez Garcia</p>
      <p className="text-[10px] text-gray-500">Cuidadora Infantil Especializada</p>
      <p className="text-[9px] text-gray-400 mt-1">lucia.ramirez@email.com · +51 987 654 321</p>
    </div>
    <div className="border-t border-gray-200 pt-3">
      <p className="text-[10px] text-gray-600 italic leading-relaxed">
        "Me apasiona el cuidado de niños con necesidades especiales. Con más de 8 años de experiencia en el manejo de TEA y TDAH, ofrezco un enfoque basado en el respeto, la paciencia y la estimulación positiva. Mi objetivo es crear un entorno seguro y amoroso donde cada niño pueda desarrollar su máximo potencial."
      </p>
    </div>
    <div className="mt-3 pt-3 border-t border-gray-200 text-center">
      <p className="text-[9px] text-gray-400">Disponibilidad: Inmediata · Trujillo, La Libertad</p>
    </div>
  </div>
);

const templateMap: Record<string, { title: string; render: () => React.ReactNode; estado: 'Verificado' | 'Pendiente' }> = {
  dni: { title: 'DNI Electrónico', render: DniTemplate, estado: 'Verificado' },
  antecedentes: { title: 'Antecedentes Penales', render: AntecedentesTemplate, estado: 'Verificado' },
  salud: { title: 'Certificado de Salud (MINSA)', render: SaludTemplate, estado: 'Verificado' },
  titulo: { title: 'Título Profesional', render: TituloTemplate, estado: 'Verificado' },
  carta: { title: 'Carta de Presentación', render: CartaTemplate, estado: 'Pendiente' },
};

type DocumentPreviewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  cuidadoraId?: number;
  documentName?: string;
  postulanteName?: string;
  onVerificar?: (documentName: string) => void;
  onMarcarInvalido?: (documentName: string) => void;
};

export function DocumentPreviewModal({
  isOpen, onClose, cuidadoraId, documentName, postulanteName,
  onVerificar, onMarcarInvalido,
}: DocumentPreviewModalProps) {
  const [selectedDoc, setSelectedDoc] = useState<string>('dni');

  // If called with single documentName (admin mode), show that one directly
  const isSingleMode = !!documentName;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-[20px]" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl max-h-[90vh] bg-[rgba(20,5,35,0.85)] backdrop-blur-[30px] border border-[rgba(255,255,255,0.15)] shadow-2xl shadow-black/50 rounded-3xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[rgba(246,165,192,0.15)] flex items-center justify-center">
                  <FileText className="w-5 h-5 text-[#F6A5C0]" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-lg">Documentos de la Cuidadora</h2>
                  <p className="text-[#F5D5E0]/60 text-xs">Documentos digitales verificados</p>
                </div>
              </div>
              <button onClick={onClose}
                className="w-8 h-8 rounded-full bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.2)] flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-[#F5D5E0]" />
              </button>
            </div>

            {isSingleMode ? (
              /* Single document view (admin) */
              <div className="flex-1 overflow-y-auto px-6 pb-4">
                {(() => {
                  const t = Object.values(templateMap).find(t => t.title === documentName || t.title.includes(documentName || ''));
                  if (!t) return <p className="text-[#6667AB] text-center py-8">Documento no encontrado</p>;
                  return (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-white font-semibold">{t.title}</h3>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          t.estado === 'Verificado' ? 'bg-[rgba(16,185,129,0.2)] text-[#6EE7B7]' : 'bg-[rgba(234,179,8,0.2)] text-[#FACC15]'
                        }`}>
                          {t.estado === 'Verificado' ? <CheckCircle className="w-3 h-3" /> : <Info className="w-3 h-3" />}
                          {t.estado}
                        </span>
                      </div>
                      <t.render />
                      {/* Action bar for admin */}
                      {onVerificar && onMarcarInvalido && (
                        <div className="bg-[rgba(66,13,75,0.5)] backdrop-blur-sm rounded-xl p-4 flex items-center justify-between border border-[rgba(255,255,255,0.06)]">
                          <p className="text-xs text-[#F5D5E0]">
                            Documento de <strong className="text-white">{postulanteName || 'la cuidadora'}</strong>
                          </p>
                          <div className="flex gap-2">
                            <button onClick={() => { onMarcarInvalido(documentName || ''); onClose(); }}
                              className="px-3 py-1.5 rounded-full bg-[#D14242] hover:bg-[#D14242]/80 text-white text-xs font-bold transition-all"
                            ><XCircle className="w-3 h-3 inline mr-1" /> Inválido</button>
                            <button onClick={() => { onVerificar(documentName || ''); onClose(); }}
                              className="px-3 py-1.5 rounded-full bg-[#10B981] hover:bg-[#10B981]/80 text-white text-xs font-bold transition-all"
                            ><CheckCircle className="w-3 h-3 inline mr-1" /> Verificar</button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            ) : (
              /* Full document gallery (family view) */
              <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                {/* Document list (sidebar) */}
                <div className="lg:w-64 shrink-0 border-r border-[rgba(255,255,255,0.08)] p-4 space-y-2 overflow-y-auto">
                  {documentTypes.map(dt => (
                    <button key={dt.id} onClick={() => setSelectedDoc(dt.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                        selectedDoc === dt.id
                          ? 'bg-[rgba(246,165,192,0.15)] border border-[#F6A5C0]/30'
                          : 'hover:bg-[rgba(255,255,255,0.05)] border border-transparent'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                        selectedDoc === dt.id ? 'bg-[#F6A5C0]/20' : 'bg-[rgba(255,255,255,0.06)]'
                      }`}>
                        <dt.icon className={`w-4 h-4 ${selectedDoc === dt.id ? 'text-[#F6A5C0]' : 'text-[#6667AB]'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${selectedDoc === dt.id ? 'text-white' : 'text-[#F5D5E0]/70'}`}>
                          {dt.label}
                        </p>
                        <span className={`text-[10px] font-bold ${
                          dt.estado === 'Verificado' ? 'text-[#6EE7B7]' : 'text-[#FACC15]'
                        }`}>
                          {dt.estado}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Document preview */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                  <AnimatePresence mode="wait">
                    <motion.div key={selectedDoc} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                      {(() => {
                        const t = templateMap[selectedDoc];
                        if (!t) return null;
                        return (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h3 className="text-white font-semibold">{t.title}</h3>
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                t.estado === 'Verificado' ? 'bg-[rgba(16,185,129,0.2)] text-[#6EE7B7] border border-[rgba(16,185,129,0.3)]' : 'bg-[rgba(234,179,8,0.2)] text-[#FACC15] border border-[rgba(234,179,8,0.3)]'
                              }`}>
                                {t.estado === 'Verificado' ? <CheckCircle className="w-3 h-3" /> : <Info className="w-3 h-3" />}
                                {t.estado}
                              </span>
                            </div>
                            <t.render />
                          </div>
                        );
                      })()}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="px-6 py-4 border-t border-[rgba(255,255,255,0.08)] flex items-center justify-between shrink-0">
              <p className="text-[11px] text-[#6667AB]">
                {isSingleMode ? 'Vista previa de documento' : `${documentTypes.length} documentos disponibles`}
              </p>
              <button onClick={onClose}
                className="px-5 py-2 rounded-xl bg-[#F6A5C0] text-[#210635] text-xs font-bold hover:bg-[#F6A5C0]/80 transition-all"
              >Cerrar</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
