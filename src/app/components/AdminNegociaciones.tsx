import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import {
  MessageSquare, CheckCircle, XCircle, Clock, Calendar, DollarSign,
  User, Baby, Shield, Users, Phone, ArrowRight, FileText, Video,
  Edit3, ThumbsUp, Eye
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Banner } from './ui/Banner';

type TaskMatrix = {
  tarea: string;
  estado: string;
};

type Negociacion = {
  OrdenId: number;
  IdUsuarioFamilia: number;
  CuidadoraId: number;
  FamiliaNombres: string;
  FamiliaApellidos: string;
  CuidadoraNombres: string;
  CuidadoraApellidos: string;
  FechaNegociacion: string;
  EstadoNegociacion: string;
  TarifaHora: number;
  TotalHoras: number;
  HoraInicio: string | null;
  HoraFin: string | null;
  MenorNombre: string | null;
  Tareas: TaskMatrix[];
  AcuerdoFinal?: string;
  MediacionManual: boolean;
  GoogleMeetLink?: string;
};

export function AdminNegociaciones() {
  const { user } = useAuth();
  const headers = { 'Content-Type': 'application/json', 'x-user-id': String(user?.id) };
  const [negociaciones, setNegociaciones] = useState<Negociacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'warning' | 'danger'; text: string } | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [acuerdoText, setAcuerdoText] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/admin/negociaciones', { headers });
      if (r.ok) {
        const data = await r.json();
        setNegociaciones(data);
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleVistoBueno = async (ordenId: number) => {
    const r = await fetch(`/api/admin/visto-bueno/${ordenId}`, { method: 'POST', headers });
    if (r.ok) {
      setMessage({ type: 'success', text: 'Visto Bueno otorgado correctamente' });
      load();
    } else {
      setMessage({ type: 'danger', text: 'Error al otorgar Visto Bueno' });
    }
  };

  const formatFecha = (f: string) => {
    const d = new Date(f);
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const badgeEstado = (est: string) => {
    const map: Record<string, string> = {
      Pendiente: 'bg-amber-500/20 text-amber-200',
      'En Progreso': 'bg-purple-500/20 text-purple-200',
      Acordado: 'bg-emerald-500/20 text-emerald-200',
      SinAcuerdo: 'bg-red-500/20 text-red-200',
    };
    return map[est] || 'bg-[rgba(33,6,53,0.5)] text-[#6667AB]';
  };

  const selected = negociaciones.find(n => n.OrdenId === selectedId);

  return (
    <div className="max-w-7xl mx-auto pb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Negociaciones</h1>
          <p className="text-sm text-[#6667AB] mt-1">Gestión de acuerdos entre familias y cuidadoras</p>
        </div>
      </div>

      {message && (
        <div className="mb-4">
          <Banner variant={message.type} onClose={() => setMessage(null)}>{message.text}</Banner>
        </div>
      )}

      {selectedId && selected ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl p-6"
        >
          <button
            onClick={() => setSelectedId(null)}
            className="text-sm text-[#6667AB] hover:text-white transition-colors mb-4 flex items-center gap-1"
          >
            <ArrowRight className="w-4 h-4 rotate-180" /> Volver
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-lg">{selected.FamiliaNombres} {selected.FamiliaApellidos}</span>
              <span className="text-[#6667AB]">↔</span>
              <span className="text-white font-bold text-lg">{selected.CuidadoraNombres} {selected.CuidadoraApellidos}</span>
            </div>
            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${badgeEstado(selected.EstadoNegociacion)}`}>
              {selected.EstadoNegociacion}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-[rgba(33,6,53,0.4)] rounded-xl p-4">
              <h3 className="font-bold text-white text-sm mb-3">Matriz de Tareas</h3>
              {selected.Tareas?.length > 0 ? (
                <div className="space-y-2">
                  {selected.Tareas.map((t, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-[#F5D5E0]">{t.tarea}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        t.estado === 'Completado' ? 'bg-emerald-500/20 text-emerald-200' :
                        t.estado === 'En Progreso' ? 'bg-amber-500/20 text-amber-200' :
                        'bg-[rgba(33,6,53,0.5)] text-[#6667AB]'
                      }`}>
                        {t.estado}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#6667AB]">Sin tareas registradas</p>
              )}
            </div>

            <div className="bg-[rgba(33,6,53,0.4)] rounded-xl p-4">
              <h3 className="font-bold text-white text-sm mb-3">Detalles</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#6667AB]" />
                  <span className="text-[#F5D5E0]">Fecha: {formatFecha(selected.FechaNegociacion)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-[#6667AB]" />
                  <span className="text-[#F5D5E0]">S/ {selected.TarifaHora}/hora · {selected.TotalHoras}h</span>
                </div>
                {selected.MenorNombre && (
                  <div className="flex items-center gap-2">
                    <Baby className="w-4 h-4 text-[#6667AB]" />
                    <span className="text-[#F5D5E0]">{selected.MenorNombre}</span>
                  </div>
                )}
                {selected.GoogleMeetLink && (
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-[#6667AB]" />
                    <a href={selected.GoogleMeetLink} target="_blank" rel="noopener noreferrer"
                      className="text-[#F6A5C0] hover:underline text-xs">
                      {selected.GoogleMeetLink}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {!selected.MediacionManual && (
            <div className="bg-[rgba(33,6,53,0.4)] rounded-xl p-4 mb-4 border border-emerald-500/20">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-semibold text-emerald-200">No hubo necesidad de mediación manual</span>
              </div>
              <p className="text-xs text-[#6667AB] mt-1">Las partes acordaron directamente los términos del servicio.</p>
            </div>
          )}

          <div className="bg-[rgba(33,6,53,0.4)] rounded-xl p-4 mb-4">
            <h3 className="font-bold text-white text-sm mb-3">Acuerdo Final</h3>
            {selected.AcuerdoFinal ? (
              <p className="text-sm text-[#F5D5E0]">{selected.AcuerdoFinal}</p>
            ) : (
              <div className="space-y-2">
                <textarea
                  value={acuerdoText}
                  onChange={e => setAcuerdoText(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg bg-[rgba(33,6,53,0.5)] border border-[rgba(255,255,255,0.15)] text-white text-sm resize-none"
                  placeholder="Describe el acuerdo final entre las partes..."
                />
                <button
                  onClick={() => {
                    if (acuerdoText.trim()) {
                      fetch(`/api/admin/negociaciones/${selected.OrdenId}/acuerdo`, {
                        method: 'POST', headers,
                        body: JSON.stringify({ acuerdo: acuerdoText.trim() }),
                      }).then(r => { if (r.ok) load(); });
                    }
                  }}
                  className="px-4 py-2 rounded-lg bg-[#F6A5C0] text-[#210635] text-xs font-bold hover:bg-[#F6A5C0]/80 transition-colors"
                >
                  Guardar Acuerdo
                </button>
              </div>
            )}
          </div>

          {selected.EstadoNegociacion === 'Acordado' && (
            <button
              onClick={() => handleVistoBueno(selected.OrdenId)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm transition-all shadow-lg shadow-black/20"
            >
              <ThumbsUp className="w-4 h-4" /> Otorgar Visto Bueno (Vb)
            </button>
          )}
        </motion.div>
      ) : (
        <>
          {loading ? (
            <div className="text-center py-16">
              <Clock className="w-8 h-8 text-[#6667AB] mx-auto mb-2 animate-spin" />
              <p className="text-sm text-[#6667AB]">Cargando negociaciones...</p>
            </div>
          ) : negociaciones.length === 0 ? (
            <div className="text-center py-16 bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl">
              <MessageSquare className="w-12 h-12 text-[#6667AB] mx-auto mb-3" />
              <p className="text-[#6667AB]">No hay negociaciones activas</p>
            </div>
          ) : (
            <div className="space-y-4">
              {negociaciones.map((n, i) => (
                <motion.div
                  key={n.OrdenId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-[#6667AB]" />
                          <span className="font-bold text-white">{n.FamiliaNombres} {n.FamiliaApellidos}</span>
                          <span className="text-[#6667AB]">↔</span>
                          <span className="font-bold text-white">{n.CuidadoraNombres} {n.CuidadoraApellidos}</span>
                        </div>
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold ${badgeEstado(n.EstadoNegociacion)}`}>
                          {n.EstadoNegociacion}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#F5D5E0]/70">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-[#6667AB]" />{formatFecha(n.FechaNegociacion)}</span>
                        {n.GoogleMeetLink && (
                          <span className="flex items-center gap-1">
                            <Video className="w-3 h-3 text-[#6667AB]" />
                            <a href={n.GoogleMeetLink} target="_blank" rel="noopener noreferrer" className="text-[#F6A5C0] hover:underline">Google Meet</a>
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => { setSelectedId(n.OrdenId); setAcuerdoText(n.AcuerdoFinal || ''); }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#F6A5C0] text-[#210635] text-xs font-bold hover:bg-[#F6A5C0]/80 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" /> Ver detalle
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
