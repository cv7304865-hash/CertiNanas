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
        className="fixed inset-0 bg-[#210635]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-3xl max-w-lg w-full overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Encabezado */}
          <div className="p-6 pb-0">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Video className="w-5 h-5 text-[#f6a5c0]" />
                  <h2 className="text-lg font-bold text-white">Agendar entrevista virtual</h2>
                </div>
                <p className="text-sm text-[#6667AB] mt-1">Conoce a {cuidadora.Nombres} {cuidadora.Apellidos?.charAt(0)}. antes de contratar</p>
              </div>
              <button onClick={onClose} className="p-1.5 hover:bg-[rgba(33,6,53,0.4)] rounded-lg transition-colors">
                <X className="w-5 h-5 text-[#6667AB]" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* Tarjeta de perfil */}
            <div className="bg-[rgba(33,6,53,0.5)] backdrop-blur-sm border border-[rgba(255,255,255,0.2)] rounded-xl p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#cc8db3] flex items-center justify-center text-white font-bold flex-shrink-0">
                {getIniciales(cuidadora.Nombres, cuidadora.Apellidos)}
              </div>
              <div>
                <p className="font-bold text-white">{cuidadora.Nombres} {cuidadora.Apellidos}</p>
                <div className="flex items-center gap-2 text-xs text-[#6667AB] mt-0.5">
                  <span>{cuidadora.Especialidades || 'Cuidado general'}</span>
                  <span className="text-[#6667AB]">·</span>
                  <span className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${i < Math.round(cuidadora.CalificacionPromedio) ? 'text-[#cc8db3] fill-[#cc8db3]' : 'text-[#6667AB]'}`} />
                    ))}
                    <span className="ml-0.5">{cuidadora.CalificacionPromedio.toFixed(1)}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Fecha */}
            <div>
              <label className="block text-sm font-semibold text-[#F5D5E0] mb-1.5">Fecha de la videollamada</label>
              <input
                type="date"
                value={fecha}
                onChange={e => setFecha(e.target.value)}
                className="w-full px-4 py-3 bg-[rgba(33,6,53,0.5)] border-[rgba(255,255,255,0.3)] text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7B337E] focus:border-[#7B337E]"
              />
            </div>

            {/* Hora */}
            <div>
              <label className="block text-sm font-semibold text-[#F5D5E0] mb-1.5">Hora</label>
              <select
                value={hora}
                onChange={e => setHora(e.target.value)}
                className="w-full px-4 py-3 bg-[rgba(33,6,53,0.5)] border-[rgba(255,255,255,0.3)] text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7B337E] focus:border-[#7B337E]"
              >
                {horarios.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>

            {/* Plataforma */}
            <div>
              <label className="block text-sm font-semibold text-[#F5D5E0] mb-1.5">Plataforma</label>
              <div className="flex gap-3">
                <button
                  onClick={() => setPlataforma('google-meet')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                    plataforma === 'google-meet'
                      ? 'bg-[#CC8DB3] text-[#210635] border-[#CC8DB3]'
                      : 'bg-[rgba(33,6,53,0.4)] border-[rgba(255,255,255,0.3)] text-[#6667AB] hover:border-[rgba(255,255,255,0.5)]'
                  }`}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <rect x="2" y="4" width="15" height="16" rx="2" fill={plataforma === 'google-meet' ? '#210635' : '#6667AB'}/>
                    <path d="M17 10l4-2v8l-4-2" fill={plataforma === 'google-meet' ? '#210635' : '#6667AB'}/>
                  </svg>
                  Google Meet
                </button>
                <button
                  onClick={() => setPlataforma('zoom')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                    plataforma === 'zoom'
                      ? 'bg-[#CC8DB3] text-[#210635] border-[#CC8DB3]'
                      : 'bg-[rgba(33,6,53,0.4)] border-[rgba(255,255,255,0.3)] text-[#6667AB] hover:border-[rgba(255,255,255,0.5)]'
                  }`}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <rect x="2" y="6" width="16" height="12" rx="2" fill={plataforma === 'zoom' ? '#210635' : '#6667AB'}/>
                    <path d="M18 10l4-2v8l-4-2" fill={plataforma === 'zoom' ? '#210635' : '#6667AB'}/>
                  </svg>
                  Zoom
                </button>
              </div>
            </div>

            {/* Mensaje informativo */}
            <div className="bg-[rgba(33,6,53,0.4)] backdrop-blur-sm border border-[rgba(255,255,255,0.15)] rounded-xl p-3 flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-[#cc8db3] mt-0.5 flex-shrink-0" />
              <p className="text-sm text-[#cc8db3]">
                Se enviará un enlace de videollamada a ambas partes por correo electrónico.
              </p>
            </div>
          </div>

          {/* Botón principal */}
          <div className="px-6 pb-6">
            <button className="w-full py-3 bg-[#F6A5C0] text-[#210635] font-bold rounded-xl transition-all shadow-md hover:shadow-lg">
              Confirmar entrevista
            </button>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}
