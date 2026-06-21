import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowLeft, Info, CheckCircle, XCircle } from 'lucide-react';
import { useState } from 'react';

const documentTemplates: Record<string, { title: string; render: () => React.ReactNode }> = {
  'DNI': {
    title: 'Vista previa - DNI',
    render: () => (
      <div className="bg-white rounded-2xl overflow-hidden shadow-xl shadow-black/40 max-w-md mx-auto">
        <div className="bg-gradient-to-r from-[#1a1a2e] to-[#16213e] p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#C4A747] flex items-center justify-center text-[#1a1a2e] text-xs font-bold">PE</div>
          <div>
            <p className="text-white text-xs font-bold tracking-wider">REPÚBLICA DEL PERÚ</p>
            <p className="text-[#C4A747] text-[10px] font-bold">Documento Nacional de Identidad</p>
          </div>
        </div>
        <div className="p-5 space-y-3">
          <div className="flex gap-4">
            <div className="w-24 h-28 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 text-[10px]">FOTO</div>
            <div className="flex-1 space-y-2">
              <div><span className="text-[10px] text-gray-500 font-semibold">APELLIDOS</span><p className="text-sm font-bold text-gray-900">RAMIREZ GARCIA</p></div>
              <div><span className="text-[10px] text-gray-500 font-semibold">NOMBRES</span><p className="text-sm font-bold text-gray-900">LUCIA FERNANDA</p></div>
              <div><span className="text-[10px] text-gray-500 font-semibold">DNI</span><p className="text-sm font-bold text-gray-900">48 765 321</p></div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
            <div><span className="text-[10px] text-gray-500 font-semibold">FECHA NAC.</span><p className="text-xs font-semibold text-gray-800">15/03/1992</p></div>
            <div><span className="text-[10px] text-gray-500 font-semibold">SEXO</span><p className="text-xs font-semibold text-gray-800">F</p></div>
            <div><span className="text-[10px] text-gray-500 font-semibold">EST.CIVIL</span><p className="text-xs font-semibold text-gray-800">SOLTERA</p></div>
            <div><span className="text-[10px] text-gray-500 font-semibold">GRUPO SANG.</span><p className="text-xs font-semibold text-gray-800">O+</p></div>
          </div>
          <div className="pt-2 border-t border-gray-100">
            <span className="text-[10px] text-gray-500 font-semibold">FECHA EMISIÓN</span>
            <p className="text-xs text-gray-700">15/06/2018</p>
          </div>
        </div>
      </div>
    ),
  },
  'Antecedentes penales': {
    title: 'Vista previa - Antecedentes penales',
    render: () => (
      <div className="bg-white rounded-2xl overflow-hidden shadow-xl shadow-black/40 max-w-md mx-auto">
        <div className="bg-[#1B3A5C] p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#C4A747] flex items-center justify-center text-white text-xs font-bold">PJ</div>
          <div>
            <p className="text-white text-xs font-bold tracking-wider">PODER JUDICIAL DEL PERÚ</p>
            <p className="text-[#8DB4D6] text-[10px] font-medium">Registro de Antecedentes Penales</p>
          </div>
        </div>
        <div className="p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><span className="text-[10px] text-gray-500 font-semibold">APELLIDOS</span><p className="text-sm font-bold text-gray-900">RAMIREZ GARCIA</p></div>
            <div><span className="text-[10px] text-gray-500 font-semibold">NOMBRES</span><p className="text-sm font-bold text-gray-900">LUCIA FERNANDA</p></div>
            <div><span className="text-[10px] text-gray-500 font-semibold">DNI</span><p className="text-sm font-bold text-gray-900">48 765 321</p></div>
            <div><span className="text-[10px] text-gray-500 font-semibold">FECHA CONSULTA</span><p className="text-xs font-semibold text-gray-800">18/06/2026</p></div>
          </div>
          <div className="bg-[#E8F5E9] border-2 border-[#4CAF50] rounded-xl p-4 text-center">
            <CheckCircle className="w-8 h-8 text-[#4CAF50] mx-auto mb-1" />
            <p className="text-sm font-extrabold text-[#2E7D32] tracking-wide">NO REGISTRA ANTECEDENTES PENALES</p>
            <p className="text-[10px] text-[#558B2F] mt-1">Certificado válido para fines legales</p>
          </div>
          <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
            <div className="w-1 h-1 rounded-full bg-gray-300" />
            <span className="text-[10px] text-gray-400">Código de verificación: RAP-2026-48-765-321</span>
          </div>
        </div>
      </div>
    ),
  },
  'Certificado de salud': {
    title: 'Vista previa - Certificado de salud',
    render: () => (
      <div className="bg-white rounded-2xl overflow-hidden shadow-xl shadow-black/40 max-w-md mx-auto">
        <div className="bg-[#1B6B3A] p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#1B6B3A] text-xs font-bold">MS</div>
          <div>
            <p className="text-white text-xs font-bold tracking-wider">MINISTERIO DE SALUD - MINSA</p>
            <p className="text-[#A5D6A7] text-[10px] font-medium">Certificado de Salud para Cuidado Infantil</p>
          </div>
        </div>
        <div className="p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><span className="text-[10px] text-gray-500 font-semibold">APELLIDOS</span><p className="text-sm font-bold text-gray-900">RAMIREZ GARCIA</p></div>
            <div><span className="text-[10px] text-gray-500 font-semibold">NOMBRES</span><p className="text-sm font-bold text-gray-900">LUCIA FERNANDA</p></div>
            <div><span className="text-[10px] text-gray-500 font-semibold">DNI</span><p className="text-sm font-bold text-gray-900">48 765 321</p></div>
            <div><span className="text-[10px] text-gray-500 font-semibold">FECHA EMISIÓN</span><p className="text-xs font-semibold text-gray-800">10/06/2026</p></div>
          </div>
          <div className="space-y-1.5 pt-2 border-t border-gray-100">
            {['Examen físico general: ✅ Normal', 'Evaluación psicológica: ✅ Normal', 'Vacunación completa: ✅ Sí'].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-gray-700">
                <CheckCircle className="w-3.5 h-3.5 text-[#4CAF50]" />
                <span>{item}</span>
              </div>
            ))}
          </div>
          <div className="bg-[#E8F5E9] border border-[#4CAF50] rounded-xl p-3 text-center mt-2">
            <p className="text-sm font-extrabold text-[#2E7D32] tracking-wide">APTO PARA CUIDADO INFANTIL</p>
            <p className="text-[10px] text-[#558B2F] mt-0.5">Válido por 12 meses desde fecha de emisión</p>
          </div>
        </div>
      </div>
    ),
  },
  'Título profesional': {
    title: 'Vista previa - Título profesional',
    render: () => (
      <div className="bg-white rounded-2xl overflow-hidden shadow-xl shadow-black/40 max-w-md mx-auto">
        <div className="bg-gradient-to-r from-[#8B4513] via-[#C4A747] to-[#8B4513] p-0.5">
          <div className="bg-white px-4 py-2 flex items-center justify-between">
            <div className="w-10 h-10 rounded-full bg-[#8B4513] flex items-center justify-center text-[#C4A747] text-lg font-bold">U</div>
            <div className="text-center">
              <p className="text-xs font-extrabold text-[#8B4513] tracking-wider">UNIVERSIDAD CÉSAR VALLEJO</p>
              <p className="text-[9px] text-gray-500 font-medium">Licenciatura en Educación Especial</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#8B4513] flex items-center justify-center text-[#C4A747] text-lg font-bold">U</div>
          </div>
        </div>
        <div className="p-5 space-y-3 text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#C4A747] to-[#8B4513] flex items-center justify-center text-white text-2xl font-bold mx-auto">LR</div>
          <p className="text-lg font-bold text-gray-900">Lucia Fernanda Ramirez Garcia</p>
          <p className="text-xs text-gray-500">DNI: 48 765 321</p>
          <div className="border-t border-b border-[#C4A747]/30 py-2 my-2">
            <p className="text-sm font-bold text-[#8B4513]">EDUCACIÓN ESPECIAL</p>
            <p className="text-xs text-gray-600">Mención en Trastornos del Neurodesarrollo</p>
          </div>
          <p className="text-xs text-gray-500">Expedido el 15 de enero del 2020</p>
          <p className="text-[10px] text-gray-400">Registro SUNEDU: 20-0487-EL</p>
          <div className="pt-2 border-t border-gray-100 flex justify-center gap-4">
            <div className="w-16 h-10 bg-gray-50 rounded border border-gray-200 flex items-center justify-center text-[8px] text-gray-400">FIRMA</div>
            <div className="w-16 h-10 bg-gray-50 rounded border border-gray-200 flex items-center justify-center text-[8px] text-gray-400">SELLO</div>
          </div>
        </div>
      </div>
    ),
  },
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
              {template.render()}
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
