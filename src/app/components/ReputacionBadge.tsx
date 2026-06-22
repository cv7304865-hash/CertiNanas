import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

type Nivel = {
  Id: number; Nombre: string; PuntajeMinimo: number; PuntajeMaximo: number;
  Icono: string; Color: string; Beneficios: string;
};

type ReputacionResponse = {
  cuidadora: any;
  puntaje_promedio: number;
  nivel: Nivel | null;
  siguiente_nivel: Nivel | null;
  progreso: number;
};

const nivelColorMap: Record<string, string> = {
  Bronce: '#CD7F32', Plata: '#C0C0C0', Oro: '#FFD700', Platino: '#E5E4E2', Elite: '#00CED1',
};

const nivelBgMap: Record<string, string> = {
  Bronce: 'rgba(205,127,50,0.15)', Plata: 'rgba(192,192,192,0.15)',
  Oro: 'rgba(255,215,0,0.15)', Platino: 'rgba(229,228,226,0.15)', Elite: 'rgba(0,206,209,0.15)',
};

export function ReputacionBadge() {
  const { user } = useAuth();
  const headers = { 'x-user-id': String(user?.id) };
  const [data, setData] = useState<ReputacionResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/reputacion/cuidadora/1`, { headers })
      .then(r => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.08)] rounded-2xl p-5 text-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#F6A5C0] border-t-transparent animate-spin mx-auto" />
      </div>
    );
  }

  if (!data) return null;

  const nivel = data.nivel;
  const siguiente = data.siguiente_nivel;
  const color = nivel ? nivelColorMap[nivel.Nombre] || '#F6A5C0' : '#F6A5C0';
  const bg = nivel ? nivelBgMap[nivel.Nombre] || 'rgba(246,165,192,0.15)' : 'rgba(246,165,192,0.15)';
  const icon = nivel?.Icono || '⭐';
  const progreso = Math.min(data.progreso, 100);

  let beneficios: string[] = [];
  if (nivel?.Beneficios) {
    try { beneficios = JSON.parse(nivel.Beneficios); } catch {
      beneficios = nivel.Beneficios.split(',').map(b => b.trim());
    }
  }

  return (
    <div className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.08)] rounded-2xl p-5">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-lg" style={{ background: bg, color }}>
          {icon}
        </div>
        <div className="flex-1">
          {nivel ? (
            <>
              <p className="text-white text-lg font-bold" style={{ color }}>{nivel.Nombre}</p>
              <p className="text-[#6667AB] text-xs mt-0.5">Puntaje: {data.puntaje_promedio.toFixed(1)} pts</p>
            </>
          ) : (
            <p className="text-white text-sm">Sin nivel asignado</p>
          )}
        </div>
      </div>

      {/* Barra de progreso */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-[10px] text-[#6667AB] mb-1.5">
          <span>{nivel?.Nombre || 'Inicio'}</span>
          <span>{siguiente?.Nombre || 'Máximo'}</span>
        </div>
        <div className="h-2 bg-[rgba(255,255,255,0.08)] rounded-full overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${progreso}%` }}
            className="h-full rounded-full transition-all duration-1000"
            style={{ background: `linear-gradient(90deg, ${color}, ${data.puntaje_promedio > 600 ? '#00CED1' : '#F6A5C0'})` }}
          />
        </div>
        <p className="text-[10px] text-[#6667AB] mt-1 text-center">
          {siguiente
            ? `Faltan ${Math.max(0, siguiente.PuntajeMinimo - data.puntaje_promedio).toFixed(0)} pts para ${siguiente.Nombre}`
            : 'Nivel máximo alcanzado'}
        </p>
      </div>

      {beneficios.length > 0 && (
        <div className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.06)]">
          <p className="text-[10px] font-bold text-[#F6A5C0] uppercase tracking-wider mb-2">Beneficios</p>
          <div className="flex flex-wrap gap-1.5">
            {beneficios.map((b, i) => (
              <span key={i} className="px-2 py-1 rounded-lg text-[10px] text-[#F5D5E0]/80 bg-[rgba(255,255,255,0.04)]">
                {b}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
