import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { Plus, Trash2, Baby, Calendar, Stethoscope, AlertCircle, Pill, Syringe } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

type Menor = {
  Id: number;
  IdUsuarioFamilia: number;
  Nombre: string;
  Diagnostico: string | null;
  FechaNacimiento: string | null;
  ControlCrisis?: boolean;
  Alergias?: string | null;
  Medicacion?: string | null;
  FechaCreacion?: string;
};

const diagnosticosPreset = ['TEA', 'TDAH', 'Síndrome de Down'];
const COLORS = ['bg-purple-500/20 text-purple-200 border-purple-500/30', 'bg-blue-500/20 text-blue-200 border-blue-500/30', 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30'];

export function MinorsSection({ className = '' }: { className?: string }) {
  const { user } = useAuth();
  const [menores, setMenores] = useState<Menor[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [nombre, setNombre] = useState('');
  const [diagnostico, setDiagnostico] = useState('');
  const [fechaNac, setFechaNac] = useState('');
  const [controlCrisis, setControlCrisis] = useState(false);
  const [alergias, setAlergias] = useState('');
  const [medicacion, setMedicacion] = useState('');

  const headers = { 'Content-Type': 'application/json', 'x-user-id': String(user?.id) };

  const load = async () => {
    try {
      const r = await fetch('/api/familia/menores', { headers });
      if (r.ok) setMenores(await r.json());
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!nombre.trim()) return;
    await fetch('/api/familia/menores', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        nombre,
        diagnostico: diagnostico || null,
        fechaNacimiento: fechaNac || null,
        controlCrisis,
        alergias: alergias || null,
        medicacion: medicacion || null,
      }),
    });
    setNombre(''); setDiagnostico(''); setFechaNac('');
    setControlCrisis(false); setAlergias(''); setMedicacion('');
    setAdding(false);
    load();
  };

  const remove = async (id: number) => {
    await fetch(`/api/familia/menores/${id}`, { method: 'DELETE', headers });
    load();
  };

  const toggleDiagnostico = (d: string) => {
    setDiagnostico(prev => {
      const current = prev ? prev.split(', ').filter(Boolean) : [];
      if (current.includes(d)) return current.filter(x => x !== d).join(', ');
      return [...current, d].join(', ');
    });
  };

  const formatDate = (d: string) => {
    if (!d) return '—';
    return new Date(d + 'T00:00:00').toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getDiagnosticos = (d: string | null) => {
    if (!d) return [];
    return d.split(', ').filter(Boolean);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={className}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Baby className="w-5 h-5 text-[#F6A5C0]" />
          <h2 className="text-lg font-bold text-white">Mis hijos</h2>
          <span className="text-xs text-[#6667AB]">({menores.length})</span>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#F6A5C0] text-[#F6A5C0] text-xs font-bold hover:bg-[rgba(246,165,192,0.1)] transition-all"
        >
          <Plus className="w-3.5 h-3.5" /> Añadir
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {loading ? (
          <p className="text-[#6667AB] text-sm col-span-full">Cargando...</p>
        ) : menores.length === 0 && !adding ? (
          <p className="text-[#6667AB] text-sm col-span-full py-6 text-center">Aún no has registrado hijos. Añade uno para empezar.</p>
        ) : (
          menores.map(m => (
            <motion.div key={m.Id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-[rgba(33,6,53,0.5)] border border-[rgba(255,255,255,0.08)] rounded-xl p-4 group"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <p className="text-white font-bold text-sm">{m.Nombre}</p>

                  {/* Diagnosis pills */}
                  {m.Diagnostico && (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {getDiagnosticos(m.Diagnostico).map((d, i) => (
                        <span key={i} className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${COLORS[i % COLORS.length]}`}>
                          {d}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="flex items-center gap-1 text-[10px] text-[#6667AB]">
                    <Calendar className="w-3 h-3" /> {formatDate(m.FechaNacimiento || '')}
                  </p>

                  {/* Clinical fields */}
                  <div className="space-y-1 mt-1.5 pt-1.5 border-t border-[rgba(255,255,255,0.06)]">
                    {m.ControlCrisis && (
                      <p className="flex items-center gap-1 text-[10px] text-amber-300">
                        <AlertCircle className="w-3 h-3" /> Requiere control de crisis
                      </p>
                    )}
                    {m.Alergias && (
                      <p className="flex items-center gap-1 text-[10px] text-[#F5D5E0]/70">
                        <Syringe className="w-3 h-3 text-[#6667AB]" /> Alergias: {m.Alergias}
                      </p>
                    )}
                    {m.Medicacion && (
                      <p className="flex items-center gap-1 text-[10px] text-[#F5D5E0]/70">
                        <Pill className="w-3 h-3 text-[#6667AB]" /> Medicación: {m.Medicacion}
                      </p>
                    )}
                  </div>
                </div>
                <button onClick={() => remove(m.Id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-red-400 hover:text-red-300 ml-2 shrink-0">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))
        )}

        {/* Add form */}
        <AnimatePresence>
          {adding && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[rgba(33,6,53,0.6)] border border-[#F6A5C0]/40 rounded-xl p-4"
            >
              <div className="space-y-2.5">
                <div>
                  <label className="text-[10px] font-semibold text-[#6667AB] block mb-1">Nombre completo</label>
                  <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej: Mateo"
                    className="w-full px-3 py-1.5 rounded-lg bg-[rgba(33,6,53,0.5)] border border-[rgba(255,255,255,0.15)] text-white text-xs placeholder:text-[#6667AB] focus:outline-none focus:ring-1 focus:ring-[#F6A5C0]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-[#6667AB] block mb-1">Diagnóstico</label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {diagnosticosPreset.map(d => {
                      const active = diagnostico.split(', ').includes(d);
                      return (
                        <button key={d} type="button" onClick={() => toggleDiagnostico(d)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${
                            active
                              ? 'bg-[#F6A5C0]/20 text-[#F6A5C0] border-[#F6A5C0]/40'
                              : 'bg-[rgba(255,255,255,0.04)] text-[#6667AB] border-transparent hover:text-white'
                          }`}
                        >{d}</button>
                      );
                    })}
                  </div>
                  <input value={diagnostico} onChange={e => setDiagnostico(e.target.value)} placeholder="O escribe manualmente..."
                    className="w-full px-3 py-1.5 rounded-lg bg-[rgba(33,6,53,0.5)] border border-[rgba(255,255,255,0.15)] text-white text-xs placeholder:text-[#6667AB] focus:outline-none focus:ring-1 focus:ring-[#F6A5C0]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-[#6667AB] block mb-1">Fecha de nacimiento</label>
                  <input type="date" value={fechaNac} onChange={e => setFechaNac(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-[rgba(33,6,53,0.5)] border border-[rgba(255,255,255,0.15)] text-white text-xs focus:outline-none focus:ring-1 focus:ring-[#F6A5C0] [color-scheme:dark]"
                  />
                </div>

                {/* Clinical fields */}
                <div className="pt-1 border-t border-[rgba(255,255,255,0.06)] space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={controlCrisis} onChange={e => setControlCrisis(e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-[rgba(255,255,255,0.2)] bg-[rgba(33,6,53,0.5)] text-[#F6A5C0] focus:ring-[#F6A5C0]"
                    />
                    <span className="text-[10px] text-[#F5D5E0]/80">Requiere control de crisis</span>
                  </label>
                  <div>
                    <label className="text-[10px] font-semibold text-[#6667AB] block mb-1">Alergias</label>
                    <input value={alergias} onChange={e => setAlergias(e.target.value)} placeholder="Ej: Penicilina, lácteos"
                      className="w-full px-3 py-1.5 rounded-lg bg-[rgba(33,6,53,0.5)] border border-[rgba(255,255,255,0.15)] text-white text-xs placeholder:text-[#6667AB] focus:outline-none focus:ring-1 focus:ring-[#F6A5C0]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-[#6667AB] block mb-1">Medicación</label>
                    <input value={medicacion} onChange={e => setMedicacion(e.target.value)} placeholder="Ej: Risperidona 1mg"
                      className="w-full px-3 py-1.5 rounded-lg bg-[rgba(33,6,53,0.5)] border border-[rgba(255,255,255,0.15)] text-white text-xs placeholder:text-[#6667AB] focus:outline-none focus:ring-1 focus:ring-[#F6A5C0]"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <button onClick={add} disabled={!nombre.trim()}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-[#F6A5C0] text-[#210635] text-xs font-bold hover:bg-[#F6A5C0]/80 transition-colors disabled:opacity-40"
                  >Guardar</button>
                  <button onClick={() => { setAdding(false); setNombre(''); setDiagnostico(''); setFechaNac(''); setControlCrisis(false); setAlergias(''); setMedicacion(''); }}
                    className="px-3 py-1.5 rounded-lg border border-[rgba(255,255,255,0.15)] text-[#6667AB] text-xs hover:text-white transition-colors"
                  >Cancelar</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
