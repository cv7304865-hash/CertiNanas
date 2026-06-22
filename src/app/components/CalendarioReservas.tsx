import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Banner } from './ui/Banner';

type Disponibilidad = {
  Fecha: string; HorasDisponibles: string[];
};

type Reserva = {
  Id: number; Fecha: string; HoraInicio: string; HoraFin: string;
  MenorNombre: string; Estado: string;
};

export function CalendarioReservas() {
  const { user } = useAuth();
  const headers = { 'Content-Type': 'application/json', 'x-user-id': String(user?.id) };
  const hoy = new Date();
  const [year, setYear] = useState(hoy.getFullYear());
  const [month, setMonth] = useState(hoy.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [disponibilidad, setDisponibilidad] = useState<Disponibilidad[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const monthNames = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

  useEffect(() => {
    setSelectedDate(null);
    setHoraInicio('');
    setHoraFin('');
    fetch(`/api/calendario/disponibilidad?year=${year}&month=${month + 1}`, { headers })
      .then(r => r.json())
      .then(data => setDisponibilidad(data.disponibilidad || []))
      .catch(() => {});
    fetch('/api/calendario/mis-reservas', { headers })
      .then(r => r.json())
      .then(data => setReservas(data.reservas || []))
      .catch(() => {});
  }, [month, year]);

  const dispMap = new Map(disponibilidad.map(d => [d.Fecha, d.HorasDisponibles]));

  const handleReservar = async () => {
    if (!selectedDate || !horaInicio || !horaFin) return;
    setSubmitting(true);
    setMessage(null);
    try {
      const r = await fetch('/api/calendario/reservar', {
        method: 'POST',
        headers,
        body: JSON.stringify({ fecha: selectedDate, horaInicio, horaFin }),
      });
      if (r.ok) {
        setMessage({ type: 'success', text: 'Reserva creada correctamente' });
        setSelectedDate(null);
        setHoraInicio('');
        setHoraFin('');
        const reload = await fetch('/api/calendario/mis-reservas', { headers }).then(r => r.json());
        setReservas(reload.reservas || []);
      } else {
        const data = await r.json();
        setMessage({ type: 'danger', text: data.error || 'Error al reservar' });
      }
    } catch {
      setMessage({ type: 'danger', text: 'Error de conexión' });
    }
    setSubmitting(false);
  };

  const dateStr = (d: number) => `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  const todayStr = dateStr(hoy.getDate());
  const isPast = (d: number) => dateStr(d) < todayStr;

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-1">Calendario de Reservas</h2>
      <p className="text-sm text-[#6667AB] mb-6">Selecciona fecha y hora disponibles para agendar un servicio</p>

      {message && (
        <div className="mb-4">
          <Banner variant={message.type} onClose={() => setMessage(null)}>{message.text}</Banner>
        </div>
      )}

      <div className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.08)] rounded-2xl p-6 mb-6">
        {/* Navegación mes */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => { if (month === 0) { setYear(y => y - 1); setMonth(11); } else setMonth(m => m - 1); }}
            className="px-3 py-1.5 rounded-lg bg-[rgba(33,6,53,0.4)] text-[#6667AB] hover:text-white text-sm transition-colors"
          >←</button>
          <span className="text-white text-sm font-bold">{monthNames[month]} {year}</span>
          <button onClick={() => { if (month === 11) { setYear(y => y + 1); setMonth(0); } else setMonth(m => m + 1); }}
            className="px-3 py-1.5 rounded-lg bg-[rgba(33,6,53,0.4)] text-[#6667AB] hover:text-white text-sm transition-colors"
          >→</button>
        </div>

        {/* Días de la semana */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'].map(d => (
            <div key={d} className="text-center text-[10px] text-[#6667AB] font-bold py-1">{d}</div>
          ))}
        </div>

        {/* Días del mes */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const d = i + 1;
            const ds = dateStr(d);
            const disponible = dispMap.has(ds);
            const selected = selectedDate === ds;
            const past = isPast(d);
            return (
              <button key={d} disabled={past}
                onClick={() => { if (!past) setSelectedDate(selected ? null : ds); }}
                className={`aspect-square rounded-xl text-xs font-bold transition-all flex items-center justify-center ${
                  selected
                    ? 'bg-[#F6A5C0] text-[#210635] shadow-lg'
                    : disponible && !past
                    ? 'bg-[rgba(16,185,129,0.12)] text-[#6EE7B7] hover:bg-[rgba(16,185,129,0.2)]'
                    : past
                    ? 'text-[rgba(255,255,255,0.1)] cursor-not-allowed'
                    : 'text-[#6667AB] hover:text-white hover:bg-[rgba(255,255,255,0.04)]'
                }`}
              >{d}</button>
            );
          })}
        </div>
      </div>

      {/* Selección de hora */}
      {selectedDate && (() => {
        const horas = dispMap.get(selectedDate) || [];
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.08)] rounded-2xl p-6 mb-6"
          >
            <h3 className="text-sm font-bold text-white mb-3">
              {new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
            </h3>

            {horas.length === 0 ? (
              <p className="text-[#6667AB] text-xs">No hay horas disponibles para esta fecha</p>
            ) : (
              <div className="flex flex-wrap gap-2 mb-4">
                {horas.map(h => (
                  <button key={h} onClick={() => {
                    setHoraInicio(h);
                    const [hh, mm] = h.split(':');
                    const endH = String(Number(hh) + 2).padStart(2, '0');
                    setHoraFin(`${endH}:${mm}`);
                  }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      horaInicio === h
                        ? 'bg-[rgba(246,165,192,0.2)] border-[#F6A5C0] text-[#F6A5C0]'
                        : 'bg-[rgba(33,6,53,0.4)] border-[rgba(255,255,255,0.1)] text-[#6667AB] hover:text-white'
                    }`}
                  >{h}</button>
                ))}
              </div>
            )}

            {horaInicio && (
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs text-[#F5D5E0]/70">Inicio:</span>
                <span className="text-sm text-white font-bold">{horaInicio}</span>
                <span className="text-xs text-[#6667AB]">→</span>
                <span className="text-xs text-[#F5D5E0]/70">Fin:</span>
                <span className="text-sm text-white font-bold">{horaFin}</span>
              </div>
            )}

            <button onClick={handleReservar} disabled={!horaInicio || submitting}
              className="w-full px-6 py-3 rounded-xl bg-[#F6A5C0] text-[#210635] text-sm font-bold hover:bg-[#F6A5C0]/80 transition-colors disabled:opacity-50"
            >{submitting ? 'Reservando...' : 'Confirmar Reserva'}</button>
          </motion.div>
        );
      })()}

      {/* Reservas existentes */}
      {reservas.length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-[#F6A5C0] uppercase tracking-wider mb-3">Mis reservas</h3>
          <div className="space-y-2">
            {reservas.map(r => (
              <motion.div key={r.Id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.08)] rounded-2xl p-3 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-[rgba(246,165,192,0.1)] flex items-center justify-center text-[#F6A5C0] text-xs font-bold">
                  {new Date(r.Fecha + 'T12:00:00').getDate()}
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm font-semibold">{r.MenorNombre || 'Reserva'}</p>
                  <p className="text-[#6667AB] text-xs">{r.Fecha} · {r.HoraInicio} - {r.HoraFin}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  r.Estado === 'Confirmada' ? 'text-[#6EE7B7] bg-[rgba(16,185,129,0.1)]' :
                  r.Estado === 'Pendiente' ? 'text-yellow-400 bg-[rgba(250,204,21,0.1)]' :
                  'text-[#6667AB] bg-[rgba(255,255,255,0.04)]'
                }`}>{r.Estado}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
