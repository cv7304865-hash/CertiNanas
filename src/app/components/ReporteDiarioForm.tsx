import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Banner } from './ui/Banner';

type ServicioCompletado = {
  Id: number; FechaServicio: string; MenorNombre: string;
  FamiliaNombres: string; FamiliaApellidos: string;
};

export function ReporteDiarioForm({ onBack }: { onBack?: () => void }) {
  const { user: u } = useAuth();
  const headers = { 'Content-Type': 'application/json', 'x-user-id': String(u?.id) };
  const [servicios, setServicios] = useState<ServicioCompletado[]>([]);
  const [idOrden, setIdOrden] = useState<number | null>(null);
  const [estadoGeneral, setEstadoGeneral] = useState('');
  const [alimentacion, setAlimentacion] = useState('');
  const [medicamentos, setMedicamentos] = useState('');
  const [actividades, setActividades] = useState<string[]>([]);
  const [observaciones, setObservaciones] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

  const actividadesOptions = ['Juegos', 'Lectura', 'Estimulación Cognitiva', 'Terapia Conductual', 'Ejercicio Físico', 'Arte y Recreación'];

  useEffect(() => {
    fetch('/api/cuidadora/servicios', { headers })
      .then(r => r.json())
      .then((data: any[]) => {
        const completados = data
          .filter(s => s.Estado === 'Completada' || s.Estado === 'Finalizada')
          .map(s => ({
            Id: s.Id, FechaServicio: s.FechaServicio,
            MenorNombre: s.MenorNombre || 'No especificado',
            FamiliaNombres: s.FamiliaNombres || '', FamiliaApellidos: s.FamiliaApellidos || '',
          }));
        setServicios(completados);
      })
      .catch(() => {});
  }, []);

  const toggleActividad = (a: string) => {
    setActividades(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);
  };

  const handleSubmit = async () => {
    if (!idOrden) return;
    setSubmitting(true);
    setMessage(null);
    try {
      const r = await fetch('/api/reportes/crear', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          IdOrden: idOrden,
          estadoGeneral: estadoGeneral || undefined,
          alimentacion: alimentacion || undefined,
          medicamentos: medicamentos || undefined,
          actividadesRealizadas: actividades.length > 0 ? actividades.join(', ') : undefined,
          observaciones: observaciones || undefined,
        }),
      });
      if (r.ok) {
        setMessage({ type: 'success', text: 'Reporte diario guardado correctamente' });
        setIdOrden(null);
        setEstadoGeneral('');
        setAlimentacion('');
        setMedicamentos('');
        setActividades([]);
        setObservaciones('');
      } else {
        const data = await r.json();
        setMessage({ type: 'danger', text: data.error || 'Error al guardar reporte' });
      }
    } catch {
      setMessage({ type: 'danger', text: 'Error de conexión' });
    }
    setSubmitting(false);
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-1">Reporte Diario de Atención</h2>
      <p className="text-sm text-[#6667AB] mb-6">Registra el estado del menor después de cada servicio completado</p>

      {message && (
        <div className="mb-4">
          <Banner variant={message.type} onClose={() => setMessage(null)}>{message.text}</Banner>
        </div>
      )}

      <div className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.08)] rounded-2xl p-6">
        <div className="mb-5">
          <label className="text-xs font-bold text-[#F5D5E0]/70 block mb-2">Servicio</label>
          <select value={idOrden ?? ''} onChange={e => setIdOrden(e.target.value ? Number(e.target.value) : null)}
            className="w-full px-4 py-2.5 rounded-xl bg-[rgba(33,6,53,0.5)] border border-[rgba(255,255,255,0.15)] text-white text-sm"
          >
            <option value="">Seleccionar servicio completado</option>
            {servicios.map(s => (
              <option key={s.Id} value={s.Id}>
                {s.FechaServicio} - {s.MenorNombre} ({s.FamiliaNombres} {s.FamiliaApellidos})
              </option>
            ))}
          </select>
        </div>

        {idOrden && (
          <div className="space-y-5">
            <div>
              <label className="text-xs font-bold text-[#F5D5E0]/70 block mb-2">Estado general del menor</label>
              <div className="flex flex-wrap gap-2">
                {['Excelente', 'Bueno', 'Regular', 'Requiere Observacion'].map(e => (
                  <button key={e} onClick={() => setEstadoGeneral(e)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                      estadoGeneral === e
                        ? 'bg-[rgba(246,165,192,0.2)] border-[#F6A5C0] text-[#F6A5C0]'
                        : 'bg-[rgba(33,6,53,0.4)] border-[rgba(255,255,255,0.1)] text-[#6667AB] hover:text-white'
                    }`}
                  >{e}</button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#F5D5E0]/70 block mb-2">Alimentación</label>
                <textarea value={alimentacion} onChange={e => setAlimentacion(e.target.value)} rows={3}
                  className="w-full px-3 py-2 rounded-xl bg-[rgba(33,6,53,0.5)] border border-[rgba(255,255,255,0.15)] text-white text-xs resize-none"
                  placeholder="Desayuno, almuerzo, cena, refrigerios..." />
              </div>
              <div>
                <label className="text-xs font-bold text-[#F5D5E0]/70 block mb-2">Medicación</label>
                <textarea value={medicamentos} onChange={e => setMedicamentos(e.target.value)} rows={3}
                  className="w-full px-3 py-2 rounded-xl bg-[rgba(33,6,53,0.5)] border border-[rgba(255,255,255,0.15)] text-white text-xs resize-none"
                  placeholder="Medicamento, dosis, hora..." />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#F5D5E0]/70 block mb-2">Actividades realizadas</label>
              <div className="flex flex-wrap gap-2">
                {actividadesOptions.map(a => (
                  <button key={a} onClick={() => toggleActividad(a)}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all ${
                      actividades.includes(a)
                        ? 'bg-[rgba(16,185,129,0.2)] border-[#6EE7B7] text-[#6EE7B7]'
                        : 'bg-[rgba(33,6,53,0.4)] border-[rgba(255,255,255,0.1)] text-[#6667AB] hover:text-white'
                    }`}
                  >{a}</button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#F5D5E0]/70 block mb-2">Observaciones</label>
              <textarea value={observaciones} onChange={e => setObservaciones(e.target.value)} rows={3}
                className="w-full px-3 py-2 rounded-xl bg-[rgba(33,6,53,0.5)] border border-[rgba(255,255,255,0.15)] text-white text-xs resize-none"
                placeholder="Notas adicionales sobre la sesión..." />
            </div>

            <button onClick={handleSubmit} disabled={submitting}
              className="w-full px-6 py-3 rounded-xl bg-[#F6A5C0] text-[#210635] text-sm font-bold hover:bg-[#F6A5C0]/80 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Guardando...' : 'Guardar Reporte Diario'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
