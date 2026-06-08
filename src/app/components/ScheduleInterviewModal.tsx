import { motion } from 'motion/react';
import { useState } from 'react';
import { Video, X, Star, CheckCircle } from 'lucide-react';

type CuidadoraCard = {
  Id: number; IdUsuario: number; AniosExperiencia: number; TarifaHora: number;
  CalificacionPromedio: number; TotalResenas: number;
  Nombres: string; Apellidos: string; Email: string;
  Especialidades: string;
};

type Props = {
  cuidadora: CuidadoraCard;
  onClose: () => void;
};

const horarios = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'];

export function ScheduleInterviewModal({ cuidadora, onClose }: Props) {
  const [fecha, setFecha] = useState('2026-06-12');
  const [hora, setHora] = useState('10:00 AM');
  const [plataforma, setPlataforma] = useState('google-meet');

  const getIniciales = (n: string, a: string) => {
    const names = n?.split(' ');
    return `${names?.[0]?.charAt(0) || ''}${a?.charAt(0) || ''}`;
  };

  return (
    <>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Encabezado */}
          <div className="p-6 pb-0">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Video className="w-5 h-5 text-[#F59E0B]" />
                  <h2 className="text-lg font-bold text-gray-900">Agendar entrevista virtual</h2>
                </div>
                <p className="text-sm text-gray-400 mt-1">Conoce a {cuidadora.Nombres} {cuidadora.Apellidos?.charAt(0)}. antes de contratar</p>
              </div>
              <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* Tarjeta de perfil */}
            <div className="bg-amber-50/70 rounded-xl p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                {getIniciales(cuidadora.Nombres, cuidadora.Apellidos)}
              </div>
              <div>
                <p className="font-bold text-gray-900">{cuidadora.Nombres} {cuidadora.Apellidos}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                  <span>{cuidadora.Especialidades || 'Cuidado general'}</span>
                  <span className="text-gray-300">·</span>
                  <span className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${i < Math.round(cuidadora.CalificacionPromedio) ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
                    ))}
                    <span className="ml-0.5">{cuidadora.CalificacionPromedio.toFixed(1)}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Fecha */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Fecha de la videollamada</label>
              <input
                type="date"
                value={fecha}
                onChange={e => setFecha(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/40"
              />
            </div>

            {/* Hora */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Hora</label>
              <select
                value={hora}
                onChange={e => setHora(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/40"
              >
                {horarios.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>

            {/* Plataforma */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Plataforma</label>
              <div className="flex gap-3">
                <button
                  onClick={() => setPlataforma('google-meet')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                    plataforma === 'google-meet'
                      ? 'border-[#F59E0B] bg-amber-50 text-[#F59E0B]'
                      : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                  }`}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <rect x="2" y="4" width="15" height="16" rx="2" fill={plataforma === 'google-meet' ? '#F59E0B' : '#9CA3AF'}/>
                    <path d="M17 10l4-2v8l-4-2" fill={plataforma === 'google-meet' ? '#F59E0B' : '#9CA3AF'}/>
                  </svg>
                  Google Meet
                </button>
                <button
                  onClick={() => setPlataforma('zoom')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                    plataforma === 'zoom'
                      ? 'border-[#F59E0B] bg-amber-50 text-[#F59E0B]'
                      : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                  }`}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <rect x="2" y="6" width="16" height="12" rx="2" fill={plataforma === 'zoom' ? '#F59E0B' : '#9CA3AF'}/>
                    <path d="M18 10l4-2v8l-4-2" fill={plataforma === 'zoom' ? '#F59E0B' : '#9CA3AF'}/>
                  </svg>
                  Zoom
                </button>
              </div>
            </div>

            {/* Mensaje informativo */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-emerald-700">
                Se enviará un enlace de videollamada a ambas partes por correo electrónico.
              </p>
            </div>
          </div>

          {/* Botón principal */}
          <div className="px-6 pb-6">
            <button className="w-full py-3 bg-[#F59E0B] hover:bg-[#D97706] text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg">
              Confirmar entrevista
            </button>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}
