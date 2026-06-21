import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { Check, Brain, Zap, Heart, Stethoscope, BookOpen, Home } from 'lucide-react';

type Tarea = { Id: number; IdCategoria: number; Descripcion: string; Orden: number };
type Categoria = { Id: number; Nombre: string; Icono: string; Orden: number; tareas: Tarea[] };

const iconMap: Record<string, any> = { brain: Brain, zap: Zap, heart: Heart, stethoscope: Stethoscope, 'book-open': BookOpen, home: Home };

export function ChecklistTareas({
  selected,
  onChange,
  readOnly,
}: {
  selected: number[];
  onChange: (ids: number[]) => void;
  readOnly?: boolean;
}) {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/tareas/categorias')
      .then(r => r.json())
      .then(setCategorias)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggle = (id: number) => {
    if (readOnly) return;
    const next = selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id];
    onChange(next);
  };

  const toggleCat = (catId: number, ids: number[]) => {
    if (readOnly) return;
    const allSelected = ids.every(id => selected.includes(id));
    const next = allSelected ? selected.filter(x => !ids.includes(x)) : [...new Set([...selected, ...ids])];
    onChange(next);
  };

  if (loading) return <p className="text-xs text-[#6667AB]">Cargando tareas...</p>;

  return (
    <div className="space-y-3">
      {categorias.map(cat => {
        const Icon = iconMap[cat.Icono] || Check;
        const ids = cat.tareas.map(t => t.Id);
        const catSelectedCount = ids.filter(id => selected.includes(id)).length;
        const allCatSelected = catSelectedCount === ids.length;
        const isExpanded = expanded === cat.Id;

        return (
          <div key={cat.Id} className="bg-[rgba(33,6,53,0.4)] rounded-xl border border-[rgba(255,255,255,0.06)] overflow-hidden">
            <button
              type="button"
              onClick={() => setExpanded(isExpanded ? null : cat.Id)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left"
            >
              <Icon className="w-4 h-4 text-[#6667AB] shrink-0" />
              <span className="text-sm font-bold text-white flex-1">{cat.Nombre}</span>
              <span className="text-[10px] text-[#6667AB]">{catSelectedCount}/{ids.length}</span>
              {!readOnly && (
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); toggleCat(cat.Id, ids); }}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-colors ${
                    allCatSelected
                      ? 'bg-[#F6A5C0]/20 border-[#F6A5C0] text-[#F6A5C0]'
                      : 'border-[rgba(255,255,255,0.15)] text-[#6667AB] hover:border-[#F6A5C0]'
                  }`}
                >
                  {allCatSelected ? 'Quitar todas' : 'Seleccionar todas'}
                </button>
              )}
            </button>

            {isExpanded && (
              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="border-t border-[rgba(255,255,255,0.04)]">
                {cat.tareas.map(t => {
                  const checked = selected.includes(t.Id);
                  return (
                    <label
                      key={t.Id}
                      className={`flex items-center gap-3 px-4 py-2 cursor-pointer transition-colors ${
                        readOnly ? '' : 'hover:bg-[rgba(246,165,192,0.05)]'
                      } ${checked ? 'bg-[rgba(246,165,192,0.08)]' : ''}`}
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all shrink-0 ${
                        readOnly
                          ? (checked ? 'bg-[#F6A5C0] border-[#F6A5C0]' : 'border-[rgba(255,255,255,0.15)]')
                          : (checked ? 'bg-[#F6A5C0] border-[#F6A5C0]' : 'border-[rgba(255,255,255,0.2)] hover:border-[#F6A5C0]')
                      }`}>
                        {checked && <Check className="w-3 h-3 text-[#210635]" />}
                      </div>
                      <span className={`text-xs ${checked ? 'text-white font-medium' : 'text-[#F5D5E0]/70'}`}>
                        {t.Descripcion}
                      </span>
                    </label>
                  );
                })}
              </motion.div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function TareasResumen({ ids }: { ids: number[] }) {
  const [tareas, setTareas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ids.length === 0) { setLoading(false); return; }
    fetch('/api/tareas/categorias')
      .then(r => r.json())
      .then((cats: Categoria[]) => {
        const all: any[] = [];
        for (const c of cats) for (const t of c.tareas) {
          if (ids.includes(t.Id)) all.push({ ...t, Categoria: c.Nombre });
        }
        setTareas(all);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [ids]);

  if (loading) return <p className="text-xs text-[#6667AB]">Cargando...</p>;
  if (tareas.length === 0) return null;

  const grouped: Record<string, string[]> = {};
  for (const t of tareas) {
    if (!grouped[t.Categoria]) grouped[t.Categoria] = [];
    grouped[t.Categoria].push(t.Descripcion);
  }

  return (
    <div className="space-y-3">
      {Object.entries(grouped).map(([cat, descs]) => (
        <div key={cat}>
          <p className="text-[10px] font-bold text-[#F6A5C0] uppercase tracking-wider mb-1.5">{cat}</p>
          <ul className="space-y-1">
            {descs.map(d => (
              <li key={d} className="flex items-start gap-2 text-xs text-[#F5D5E0]/80">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F6A5C0] mt-1 shrink-0" />
                {d}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
