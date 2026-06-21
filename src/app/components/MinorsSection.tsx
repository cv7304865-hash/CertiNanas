import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { Plus, Trash2, Baby, Calendar, Stethoscope } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

type Menor = {
  Id: number;
  IdUsuarioFamilia: number;
  Nombre: string;
  Diagnostico: string | null;
  FechaNacimiento: string | null;
  FechaCreacion?: string;
};

export function MinorsSection({ className = '' }: { className?: string }) {
  const { user } = useAuth();
  const [menores, setMenores] = useState<Menor[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [nombre, setNombre] = useState('');
  const [diagnostico, setDiagnostico] = useState('');
  const [fechaNac, setFechaNac] = useState('');

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
      body: JSON.stringify({ nombre, diagnostico: diagnostico || null, fechaNacimiento: fechaNac || null }),
    });
    setNombre(''); setDiagnostico(''); setFechaNac('');
    setAdding(false);
    load();
  };

  const remove = async (id: number) => {
    await fetch(`/api/familia/menores/${id}`, { method: 'DELETE', headers });
    load();
  };

  const formatDate = (d: string) => {
    if (!d) return '—';
    return new Date(d + 'T00:00:00').toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
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
                <div className="space-y-1.5">
                  <p className="text-white font-bold text-sm">{m.Nombre}</p>
                  {m.Diagnostico && (
                    <p className="flex items-center gap-1 text-[10px] text-[#F5D5E0]/70">
                      <Stethoscope className="w-3 h-3 text-[#6667AB]" /> {m.Diagnostico}
                    </p>
                  )}
                  <p className="flex items-center gap-1 text-[10px] text-[#6667AB]">
                    <Calendar className="w-3 h-3" /> {formatDate(m.FechaNacimiento || '')}
                  </p>
                </div>
                <button onClick={() => remove(m.Id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-red-400 hover:text-red-300">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))
        )}

        {adding && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
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
                <label className="text-[10px] font-semibold text-[#6667AB] block mb-1">Diagnóstico (opcional)</label>
                <input value={diagnostico} onChange={e => setDiagnostico(e.target.value)} placeholder="Ej: TEA"
                  className="w-full px-3 py-1.5 rounded-lg bg-[rgba(33,6,53,0.5)] border border-[rgba(255,255,255,0.15)] text-white text-xs placeholder:text-[#6667AB] focus:outline-none focus:ring-1 focus:ring-[#F6A5C0]"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-[#6667AB] block mb-1">Fecha de nacimiento</label>
                <input type="date" value={fechaNac} onChange={e => setFechaNac(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-[rgba(33,6,53,0.5)] border border-[rgba(255,255,255,0.15)] text-white text-xs focus:outline-none focus:ring-1 focus:ring-[#F6A5C0] [color-scheme:dark]"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={add} disabled={!nombre.trim()}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-[#F6A5C0] text-[#210635] text-xs font-bold hover:bg-[#F6A5C0]/80 transition-colors disabled:opacity-40"
                >Guardar</button>
                <button onClick={() => { setAdding(false); setNombre(''); setDiagnostico(''); setFechaNac(''); }}
                  className="px-3 py-1.5 rounded-lg border border-[rgba(255,255,255,0.15)] text-[#6667AB] text-xs hover:text-white transition-colors"
                >Cancelar</button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
