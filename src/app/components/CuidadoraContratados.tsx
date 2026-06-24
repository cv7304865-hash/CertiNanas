import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { Clock, DollarSign, Calendar, User, Baby, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

type Contratado = {
  Id: number;
  FechaServicio: string;
  TotalHoras: number;
  TarifaHora: number;
  Total: number;
  Subtotal: number;
  Estado: string;
  EstadoNegociacion: string;
  HoraInicio: string | null;
  HoraFin: string | null;
  TipoServicio: string;
  FechaCreacion: string;
  ConfirmadaFamilia: number;
  ConfirmadaCuidadora: number;
  FamiliaNombres: string;
  FamiliaApellidos: string;
  MenorNombre: string | null;
  MenorDiagnostico: string | null;
  tareas?: { Id: number; Descripcion: string; Decision: string; EsPersonalizada: boolean }[];
};

export function CuidadoraContratados() {
  const { user } = useAuth();
  const headers = { 'Content-Type': 'application/json', 'x-user-id': String(user?.id) };
  const [contratos, setContratos] = useState<Contratado[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/cuidadora/contratados', { headers });
      if (r.ok) setContratos(await r.json());
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const formatFecha = (f: string) => new Date(f + 'T00:00:00').toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <div className="max-w-5xl mx-auto pb-8">
      <h2 className="text-xl font-bold text-white mb-1">Servicios Contratados</h2>
      <p className="text-sm text-[#6667AB] mb-6">Servicios que aceptaste y están esperando el pago de la familia</p>

      {loading ? (
        <p className="text-[#6667AB] text-sm">Cargando...</p>
      ) : contratos.length === 0 ? (
        <div className="text-center py-16">
          <CheckCircle className="w-12 h-12 text-[#6667AB] mx-auto mb-3" />
          <p className="text-[#6667AB]">No tienes servicios contratados pendientes de pago.</p>
          <p className="text-xs text-[#6667AB] mt-1">Cuando aceptes todas las tareas de una solicitud, aparecerá aquí.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {contratos.map(c => (
            <motion.div key={c.Id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.08)] rounded-2xl p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[rgba(16,185,129,0.15)] flex items-center justify-center text-emerald-400 font-bold text-sm">
                      {c.FamiliaNombres.charAt(0)}{c.FamiliaApellidos.charAt(0)}
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">{c.FamiliaNombres} {c.FamiliaApellidos}</p>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200">
                        Aceptado - Pendiente de pago
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="flex items-center gap-1.5 text-xs text-[#F5D5E0]/70">
                      <Calendar className="w-3.5 h-3.5 text-[#6667AB]" /> {formatFecha(c.FechaServicio)}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-[#F5D5E0]/70">
                      <Clock className="w-3.5 h-3.5 text-[#6667AB]" /> {c.HoraInicio || '--'} - {c.HoraFin || '--'}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-[#F5D5E0]/70">
                      <DollarSign className="w-3.5 h-3.5 text-[#6667AB]" /> S/ {c.TarifaHora}/hora
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-[#F5D5E0]/70">
                      <User className="w-3.5 h-3.5 text-[#6667AB]" /> {c.TotalHoras}h
                    </div>
                  </div>

                  {c.MenorNombre && (
                    <div className="flex items-center gap-1.5 text-xs text-[#F5D5E0]/70">
                      <Baby className="w-3.5 h-3.5 text-[#6667AB]" /> {c.MenorNombre}
                      {c.MenorDiagnostico && <span className="text-[#6667AB]">({c.MenorDiagnostico})</span>}
                    </div>
                  )}

                  <div className="text-sm font-bold text-white">
                    Total a recibir: S/ {c.Subtotal.toFixed(2)}
                    {c.ConfirmadaFamilia ? (
                      <span className="ml-2 text-[10px] text-emerald-400">✓ Familia ya aceptó el contrato</span>
                    ) : (
                      <span className="ml-2 text-[10px] text-amber-400">Esperando que la familia acepte el contrato</span>
                    )}
                  </div>

                  {c.tareas && c.tareas.length > 0 && (
                    <div className="border-t border-[rgba(255,255,255,0.06)] pt-3">
                      <p className="text-[10px] font-bold text-[#F6A5C0] uppercase tracking-wider mb-2">Tareas aceptadas ({c.tareas.length})</p>
                      <div className="flex flex-wrap gap-1.5">
                        {c.tareas.map(t => (
                          <span key={t.Id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[rgba(16,185,129,0.15)] text-emerald-300 text-[10px]">
                            <CheckCircle className="w-2.5 h-2.5" /> {t.Descripcion}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
