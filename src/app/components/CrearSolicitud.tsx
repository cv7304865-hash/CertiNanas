import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { Send, ArrowLeft, Star, FileSignature, Shield, Wallet, ListTodo, Calendar, DollarSign, Baby, User, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ChecklistTareas } from './ChecklistTareas';

type Cuidadora = { Id: number; Nombres: string; Apellidos: string; TarifaHora: number; CalificacionPromedio: number; TotalResenas: number; Especialidades: string | null; fotoPerfil?: string | null };
type Menor = { Id: number; Nombre: string; Diagnostico: string | null; FechaNacimiento: string | null };

export function CrearSolicitud({ onBack, onSuccess }: { onBack: () => void; onSuccess: () => void }) {
  const { user } = useAuth();
  const headers = { 'Content-Type': 'application/json', 'x-user-id': String(user?.id) };

  const [cuidadoras, setCuidadoras] = useState<Cuidadora[]>([]);
  const [menores, setMenores] = useState<Menor[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [idCuidadora, setIdCuidadora] = useState<number | null>(null);
  const [idMenor, setIdMenor] = useState<number | null>(null);
  const [fechaServicio, setFechaServicio] = useState(new Date().toISOString().slice(0, 10));
  const [horaInicio, setHoraInicio] = useState('08:00');
  const [horaFin, setHoraFin] = useState('12:00');
  const [totalHoras, setTotalHoras] = useState(4);
  const [tareaIds, setTareaIds] = useState<number[]>([]);
  const [tareasPersonalizadas, setTareasPersonalizadas] = useState<string[]>(['', '', '']);
  const [observaciones, setObservaciones] = useState('');
  const [showContractPreview, setShowContractPreview] = useState(false);

  useEffect(() => {
    const preselectId = localStorage.getItem('preselectCuidadoraId');
    Promise.all([
      fetch('/api/familia/cuidadoras-disponibles', { headers }).then(r => r.json()),
      fetch('/api/familia/menores', { headers }).then(r => r.json()),
    ]).then(([c, m]) => {
      setCuidadoras(c);
      setMenores(m);
      if (preselectId) {
        const found = c.find((cuid: Cuidadora) => cuid.Id === Number(preselectId));
        if (found) setIdCuidadora(found.Id);
        localStorage.removeItem('preselectCuidadoraId');
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const selectedC = cuidadoras.find(c => c.Id === idCuidadora);
  useEffect(() => {
    if (selectedC && horaInicio && horaFin) {
      const [h1, m1] = horaInicio.split(':').map(Number);
      const [h2, m2] = horaFin.split(':').map(Number);
      const diff = ((h2 * 60 + m2) - (h1 * 60 + m1)) / 60;
      setTotalHoras(diff > 0 ? diff : 4);
    }
  }, [selectedC, horaInicio, horaFin]);

  const handleSubmit = async () => {
    if (!idCuidadora) return;
    setSubmitting(true);
    try {
      const r = await fetch('/api/familia/crear-solicitud', {
        method: 'POST', headers,
        body: JSON.stringify({ idCuidadora, idMenor, fechaServicio, horaInicio, horaFin, totalHoras, tareaIds, observaciones, tareasPersonalizadas: tareasPersonalizadas.filter(t => t.trim()) }),
      });
      if (r.ok) onSuccess();
    } finally { setSubmitting(false); }
  };

  const totalEstimado = selectedC ? selectedC.TarifaHora * totalHoras * 1.15 : 0;
  const selectedM = menores.find(m => m.Id === idMenor);

  if (loading) return <p className="text-[#6667AB] text-sm text-center py-12">Cargando...</p>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button onClick={onBack} className="text-sm text-[#6667AB] hover:text-white transition-colors flex items-center gap-1">
        <ArrowLeft className="w-3.5 h-3.5" /> Volver a mis servicios
      </button>

      {/* Vista previa del contrato */}
      {selectedC && (
        <div className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] rounded-2xl overflow-hidden">
          <button onClick={() => setShowContractPreview(!showContractPreview)}
            className="w-full flex items-center justify-between px-6 sm:px-8 py-4 text-left hover:bg-[rgba(255,255,255,0.03)] transition-colors"
          >
            <div className="flex items-center gap-2">
              <FileSignature className="w-5 h-5 text-[#F6A5C0]" />
              <span className="text-sm font-bold text-white">CONTRATO DE PRESTACIÓN DE SERVICIOS DE CUIDADO ESPECIALIZADO</span>
            </div>
            <span className="text-[10px] text-[#6667AB]">{showContractPreview ? 'Ocultar' : 'Ver'}</span>
          </button>
          {showContractPreview && (
            <div className="px-6 sm:px-8 pb-6 space-y-4 text-xs text-[#F5D5E0]/80 leading-relaxed">
              <div className="flex justify-between border-b border-[rgba(255,255,255,0.08)] pb-2">
                <span className="text-[#6667AB]">CONTRATO N°: <strong className="text-white">CTN-2026-{String(Date.now()).slice(-4)}</strong></span>
                <span className="text-[#6667AB]">EMISIÓN: <strong className="text-white">{new Date().toLocaleDateString('es-PE')}</strong></span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-[#F6A5C0] mb-2">1. PARTES CONTRATANTES</h3>
                <p><strong className="text-white">EL MEDIADOR:</strong> CERTINANAS S.A.C., con RUC peruano vigente, en adelante LA PLATAFORMA.</p>
                <p className="mt-1"><strong className="text-white">EL CLIENTE (LA FAMILIA):</strong> {user?.nombres || ''} {user?.apellidos || ''}.</p>
                <p className="mt-1"><strong className="text-white">LA CUIDADORA:</strong> {selectedC.Nombres} {selectedC.Apellidos} (Validación Conforme).</p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-[#F6A5C0] mb-2">2. OBJETO DEL CONTRATO Y DETALLE DEL MENOR</h3>
                <p>LA CUIDADORA se obliga a prestar asistencia integral y cuidado especializado al menor:</p>
                <div className="bg-[rgba(123,51,126,0.2)] rounded-lg p-3 mt-2 flex items-center gap-2">
                  <Baby className="w-4 h-4 text-[#CC8DB3]" />
                  <span><strong className="text-white">Beneficiario:</strong> {selectedM ? selectedM.Nombre : 'Por definir'} {selectedM?.Diagnostico ? <span className="text-[#CC8DB3]">— Diagnóstico: {selectedM.Diagnostico}</span> : ''}</span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-[#F6A5C0] mb-2">3. TÉRMINOS ECONÓMICOS Y CUSTODIA EN ESCROW</h3>
                <div className="bg-[rgba(33,6,53,0.4)] rounded-lg p-3 space-y-1">
                  <p className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-[#7B337E]" /> <strong>Jornada:</strong> {fechaServicio} de {horaInicio} a {horaFin} ({totalHoras}h)</p>
                  <p className="flex items-center gap-2"><DollarSign className="w-3.5 h-3.5 text-[#7B337E]" /> <strong>Monto Bruto Retenido:</strong> S/ {totalEstimado.toFixed(2)}</p>
                  <p className="text-[#6667AB] italic">Los fondos se encuentran congelados en el módulo seguro de Gastos en Custodia (Escrow).</p>
                  <div className="border-t border-[rgba(255,255,255,0.08)] pt-1 flex justify-between text-[#6667AB]">
                    <span>Comisión CERTINANAS (15%): S/ {(totalEstimado * 0.15).toFixed(2)}</span>
                    <span>Pago a cuidadora: S/ {(totalEstimado * 0.85).toFixed(2)}</span>
                  </div>
                </div>
                <div className="bg-[rgba(239,68,68,0.1)] border border-red-500/20 rounded-lg p-2 mt-2 text-[10px] text-red-300">
                  <strong>Cláusula Penal:</strong> Si se registra y demuestra un incumplimiento total o parcial de las tareas estipuladas mediante el botón de "Reportar Incidencia", LA PLATAFORMA anulará el pago a la cuidadora y procesará la devolución (Refund) al CLIENTE.
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-[#F6A5C0] mb-2">4. CLÁUSULA OPERATIVA DE CONCILIACIÓN</h3>
                <p>El inicio formal de la prestación del servicio queda estrictamente condicionado a la aceptación unánime del checklist de tareas por parte de la cuidadora. Cualquier decisión de "Negociar" automatizará el bloqueo preventivo del pago y forzará la apertura de mediación virtual por Google Meet con una tasa administrativa de S/ 25.00.</p>
              </div>

              <div className="border-t border-[rgba(255,255,255,0.08)] pt-3">
                <div className="flex items-center gap-2 text-[10px] text-[#6667AB]">
                  <Shield className="w-3 h-3" />
                  Firmado digitalmente mediante tokens OTP / Trazo Biométrico por las partes interesadas
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-[rgba(16,185,129,0.08)] border border-emerald-500/20 rounded-lg">
                <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <p className="text-[10px] text-emerald-200">
                  Al enviar esta solicitud, la familia acepta los términos del contrato. La cuidadora recibirá la notificación y deberá confirmar su aceptación para que el contrato entre en vigor.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] rounded-2xl p-6 sm:p-8 space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Send className="w-5 h-5 text-[#F6A5C0]" /> Nueva solicitud de servicio
        </h2>

        {/* Seleccionar cuidadora */}
        <div>
          <label className="text-xs font-bold text-[#6667AB] uppercase tracking-wider block mb-3">Cuidadora</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
            {cuidadoras.map(c => (
              <button key={c.Id} type="button" onClick={() => setIdCuidadora(c.Id)}
                className={`text-left px-4 py-3 rounded-xl border text-sm transition-all ${
                  idCuidadora === c.Id
                    ? 'border-[#F6A5C0] bg-[rgba(246,165,192,0.1)] text-white'
                    : 'border-[rgba(255,255,255,0.08)] bg-[rgba(33,6,53,0.3)] text-[#F5D5E0]/70 hover:border-[rgba(255,255,255,0.2)]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 bg-[rgba(246,165,192,0.15)]">
                    {c.fotoPerfil ? (
                      <img src={`/uploads/${c.fotoPerfil}`} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs font-bold text-[#F6A5C0]">
                        {c.Nombres.charAt(0)}{c.Apellidos.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-bold block truncate">{c.Nombres} {c.Apellidos}</span>
                <span className="text-[10px] flex items-center gap-2 mt-0.5">
                  <span>S/ {c.TarifaHora}/h</span>
                  {c.CalificacionPromedio > 0 && (
                    <span className="flex items-center gap-0.5 text-amber-300">
                      <Star className="w-3 h-3 fill-amber-300" />{c.CalificacionPromedio.toFixed(1)}
                    </span>
                  )}
                  </span>
                  {c.Especialidades && <span className="text-[10px] text-[#6667AB] block mt-0.5 truncate">{c.Especialidades}</span>}
                </div>
              </div>
              </button>
            ))}
          </div>
        </div>

        {/* Seleccionar menor */}
        <div>
          <label className="text-xs font-bold text-[#6667AB] uppercase tracking-wider block mb-3">Menor (opcional)</label>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setIdMenor(null)}
              className={`px-4 py-2 rounded-xl border text-xs transition-all ${
                idMenor === null ? 'border-[#F6A5C0] bg-[rgba(246,165,192,0.1)] text-white' : 'border-[rgba(255,255,255,0.08)] text-[#6667AB]'
              }`}
            >Sin especificar</button>
            {menores.map(m => (
              <button key={m.Id} type="button" onClick={() => setIdMenor(m.Id)}
                className={`px-4 py-2 rounded-xl border text-xs transition-all ${
                  idMenor === m.Id ? 'border-[#F6A5C0] bg-[rgba(246,165,192,0.1)] text-white' : 'border-[rgba(255,255,255,0.08)] text-[#F5D5E0]/70 hover:border-[rgba(255,255,255,0.2)]'
                }`}
              >
                {m.Nombre}{m.Diagnostico ? <span className="text-[#6667AB]"> ({m.Diagnostico})</span> : ''}
              </button>
            ))}
          </div>
        </div>

        {/* Fecha y horario */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="text-[10px] font-bold text-[#6667AB] uppercase block mb-1.5">Fecha</label>
            <input type="date" value={fechaServicio} onChange={e => setFechaServicio(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[rgba(33,6,53,0.5)] border border-[rgba(255,255,255,0.15)] text-white text-xs [color-scheme:dark]"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-[#6667AB] uppercase block mb-1.5">Inicio</label>
            <input type="time" value={horaInicio} onChange={e => setHoraInicio(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[rgba(33,6,53,0.5)] border border-[rgba(255,255,255,0.15)] text-white text-xs [color-scheme:dark]"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-[#6667AB] uppercase block mb-1.5">Fin</label>
            <input type="time" value={horaFin} onChange={e => setHoraFin(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[rgba(33,6,53,0.5)] border border-[rgba(255,255,255,0.15)] text-white text-xs [color-scheme:dark]"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-[#6667AB] uppercase block mb-1.5">Horas</label>
            <div className="px-3 py-2 rounded-lg bg-[rgba(33,6,53,0.5)] border border-[rgba(255,255,255,0.15)] text-white text-xs flex items-center h-full">
              {totalHoras}h{selectedC && <span className="text-[#6667AB] ml-1">· S/ {(selectedC.TarifaHora * totalHoras).toFixed(2)}</span>}
            </div>
          </div>
        </div>

        {/* Checklist de tareas */}
        <div>
          <label className="text-xs font-bold text-[#6667AB] uppercase tracking-wider block mb-3">Tareas y necesidades</label>
          <ChecklistTareas selected={tareaIds} onChange={setTareaIds} />
        </div>

        {/* Tareas personalizadas */}
        <div>
          <label className="text-xs font-bold text-[#6667AB] uppercase tracking-wider block mb-3">
            Tareas personalizadas <span className="text-[10px] font-normal text-[#6667AB]">(opcional, hasta 3)</span>
          </label>
          <div className="space-y-2">
            {tareasPersonalizadas.map((val, i) => (
              <input
                key={i}
                type="text"
                value={val}
                onChange={e => {
                  const next = [...tareasPersonalizadas];
                  next[i] = e.target.value;
                  setTareasPersonalizadas(next);
                }}
                className="w-full px-4 py-2.5 rounded-xl bg-[rgba(33,6,53,0.5)] border border-[rgba(255,255,255,0.15)] text-white text-sm placeholder:text-[#6667AB]/60"
                placeholder={`Ej: Apoyo en terapia de lenguaje (sesión #${i + 1})`}
              />
            ))}
          </div>
        </div>

        {/* Observaciones */}
        <div>
          <label className="text-xs font-bold text-[#6667AB] uppercase tracking-wider block mb-3">Observaciones especiales</label>
          <textarea value={observaciones} onChange={e => setObservaciones(e.target.value)} rows={3}
            className="w-full px-4 py-3 rounded-xl bg-[rgba(33,6,53,0.5)] border border-[rgba(255,255,255,0.15)] text-white text-sm resize-none"
            placeholder="Ej: Menor diagnosticado con TEA nivel 1. Requiere apoyo en regulación emocional y seguimiento de rutina visual."
          />
        </div>

        {/* Resumen y enviar */}
        {selectedC && (
          <div className="bg-[rgba(246,165,192,0.1)] border border-[rgba(246,165,192,0.25)] rounded-xl p-4 space-y-1 text-sm">
            <p className="text-[#F6A5C0] font-bold">Resumen de la solicitud</p>
            <p className="text-[#F5D5E0]/70">Cuidadora: <span className="text-white font-semibold">{selectedC.Nombres} {selectedC.Apellidos}</span></p>
            <p className="text-[#F5D5E0]/70">Fecha: <span className="text-white font-semibold">{new Date(fechaServicio + 'T00:00:00').toLocaleDateString('es-PE')}</span></p>
            <p className="text-[#F5D5E0]/70">Horario: <span className="text-white font-semibold">{horaInicio} - {horaFin} ({totalHoras}h)</span></p>
            <p className="text-[#F5D5E0]/70">Tareas seleccionadas: <span className="text-white font-semibold">{tareaIds.length}</span>
              {tareasPersonalizadas.filter(t => t.trim()).length > 0 && (
                <> · Personalizadas: <span className="text-white font-semibold">{tareasPersonalizadas.filter(t => t.trim()).length}</span></>
              )}
            </p>
            <p className="text-[#F5D5E0]/70">Tarifa: <span className="text-white font-semibold">S/ {selectedC.TarifaHora}/hora</span></p>
            <p className="text-[#F5D5E0]/70">Total estimado: <span className="text-white font-bold">S/ {(selectedC.TarifaHora * totalHoras * 1.15).toFixed(2)}</span></p>
          </div>
        )}

        <button onClick={handleSubmit} disabled={!idCuidadora || submitting}
          className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
            idCuidadora && !submitting
              ? 'bg-[#F6A5C0] text-[#210635] hover:bg-[#F6A5C0]/80'
              : 'bg-[rgba(33,6,53,0.5)] text-[#6667AB] cursor-not-allowed'
          }`}
        >{submitting ? 'Enviando...' : 'Enviar solicitud a la cuidadora'}</button>
      </div>
    </div>
  );
}
