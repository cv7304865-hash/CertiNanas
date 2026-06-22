import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import {
  Clock, AlertTriangle, User, Calendar, Eye, CheckCircle, XCircle,
  AlertCircle, ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

type PerfilSLA = {
  Id: number;
  Nombres: string;
  Apellidos: string;
  Email: string;
  FechaPostulacion: string;
  HorasTranscurridas: number;
  Estado: string;
  Etapa: string;
};

export function AdminSLAMonitor() {
  const { user } = useAuth();
  const headers = { 'Content-Type': 'application/json', 'x-user-id': String(user?.id) };
  const [perfiles, setPerfiles] = useState<PerfilSLA[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/alertas/sla', { headers })
      .then(r => r.json())
      .then(data => {
        const mapped = (data.postulaciones || []).map((p: any) => ({
          Id: p.Id, Nombres: p.Nombres, Apellidos: p.Apellidos, Email: p.Email,
          FechaPostulacion: p.FechaPostulacion,
          HorasTranscurridas: (p.DiasPendiente || 0) * 24 + (p.nivelAlerta === 'critico' ? 12 : 0),
          Estado: p.DiasPendiente >= 3 ? 'critico' : p.DiasPendiente >= 1 ? 'pendiente' : 'normal',
          Etapa: p.DiasPendiente >= 3 ? 'Aprobación Final' : p.DiasPendiente >= 2 ? 'Validación' : p.DiasPendiente >= 1 ? 'Documentos' : 'Postulación',
        }));
        setPerfiles(mapped);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const formatFecha = (f: string) => {
    const d = new Date(f);
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getTimeColor = (h: number) => {
    if (h > 23) return 'text-[#D14242]';
    if (h > 18) return 'text-amber-400';
    if (h > 12) return 'text-amber-300';
    return 'text-emerald-400';
  };

  const getBgColor = (h: number) => {
    if (h > 23) return 'bg-[rgba(209,66,66,0.1)] border-[#D14242]/40';
    if (h > 18) return 'bg-[rgba(251,191,36,0.08)] border-amber-500/30';
    return 'bg-[rgba(33,6,53,0.4)] border-[rgba(255,255,255,0.08)]';
  };

  const etapas = [
    'Postulación',
    'Documentos',
    'Entrevista',
    'Validación',
    'Aprobación Final',
  ];

  return (
    <div className="max-w-7xl mx-auto pb-8">
      <div className="flex items-center gap-2 mb-1">
        <Clock className="w-6 h-6 text-[#F6A5C0]" />
        <h1 className="text-2xl font-extrabold text-white">Monitoreo SLA</h1>
      </div>
      <p className="text-sm text-[#6667AB] mb-6">
        Seguimiento del ciclo de vida de perfiles de cuidadoras — límite de revisión: 24h
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl p-5">
          <p className="text-xs font-bold text-[#6667AB] uppercase">Total en Revisión</p>
          <p className="text-2xl font-bold text-white mt-1">{perfiles.length}</p>
        </div>
        <div className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl p-5">
          <p className="text-xs font-bold text-[#6667AB] uppercase">SLA Excedido (&gt;23h)</p>
          <p className="text-2xl font-bold text-[#D14242] mt-1">{perfiles.filter(p => p.HorasTranscurridas > 23).length}</p>
        </div>
        <div className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl p-5">
          <p className="text-xs font-bold text-[#6667AB] uppercase">Próximos a vencer (&gt;18h)</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">{perfiles.filter(p => p.HorasTranscurridas > 18 && p.HorasTranscurridas <= 23).length}</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <Clock className="w-8 h-8 text-[#6667AB] mx-auto mb-2 animate-spin" />
          <p className="text-sm text-[#6667AB]">Cargando monitoreo SLA...</p>
        </div>
      ) : perfiles.length === 0 ? (
        <div className="text-center py-16 bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl">
          <Clock className="w-12 h-12 text-[#6667AB] mx-auto mb-3" />
          <p className="text-[#6667AB]">No hay perfiles en revisión</p>
        </div>
      ) : (
        <div className="space-y-4">
          {perfiles.map((p, i) => {
            const isOverSla = p.HorasTranscurridas > 23;
            const etapaIndex = etapas.indexOf(p.Etapa);

            return (
              <motion.div
                key={p.Id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border shadow-lg shadow-black/30 rounded-2xl p-5 ${getBgColor(p.HorasTranscurridas)} ${isOverSla ? 'animate-pulse' : ''}`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[rgba(33,6,53,0.5)] border border-[rgba(255,255,255,0.1)] flex items-center justify-center text-[#CC8DB3] font-bold text-lg flex-shrink-0">
                    {p.Nombres?.charAt(0)}{p.Apellidos?.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-bold text-white">{p.Nombres} {p.Apellidos}</h3>
                      {isOverSla && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#D14242]/20 text-[#D14242] text-[10px] font-bold border border-[#D14242]/40">
                          <AlertTriangle className="w-3 h-3" /> SLA Excedido
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#6667AB] mt-0.5">{p.Email}</p>
                    <p className="text-xs text-[#6667AB] mt-0.5">{formatFecha(p.FechaPostulacion)}</p>

                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-[#6667AB]">Etapa actual: <span className="text-[#F5D5E0] font-semibold">{p.Etapa}</span></span>
                        <span className={`text-xs font-bold ${getTimeColor(p.HorasTranscurridas)}`}>
                          {p.HorasTranscurridas.toFixed(1)}h / 24h
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min((p.HorasTranscurridas / 24) * 100, 100)}%` }}
                          transition={{ duration: 0.6, delay: i * 0.05 }}
                          className={`h-full rounded-full ${isOverSla ? 'bg-[#D14242]' : p.HorasTranscurridas > 18 ? 'bg-amber-400' : 'bg-[#CC8DB3]'}`}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-1 mt-3">
                      {etapas.map((etapa, ei) => (
                        <div key={ei} className="flex items-center">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            ei <= etapaIndex
                              ? 'bg-[#CC8DB3] text-[#210635]'
                              : 'bg-[rgba(33,6,53,0.5)] text-[#6667AB]'
                          }`}>
                            {ei + 1}
                          </div>
                          {ei < etapas.length - 1 && (
                            <div className={`w-6 h-0.5 ${ei < etapaIndex ? 'bg-[#CC8DB3]' : 'bg-[rgba(255,255,255,0.1)]'}`} />
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-1 mt-1">
                      {etapas.map((etapa, ei) => (
                        <span key={ei} className={`text-[8px] ${ei <= etapaIndex ? 'text-[#F5D5E0]' : 'text-[#6667AB]'}`}>
                          {etapa}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => window.location.href = `/admin?tab=postulaciones&id=${p.Id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#F5D5E0] text-[#F5D5E0] text-xs font-semibold hover:bg-[rgba(245,213,224,0.1)] transition-colors flex-shrink-0"
                  >
                    <Eye className="w-3.5 h-3.5" /> Revisar
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
