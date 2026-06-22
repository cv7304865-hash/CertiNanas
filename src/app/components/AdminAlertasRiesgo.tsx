import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import {
  AlertTriangle, Shield, AlertCircle, CheckCircle, Eye,
  ArrowUp, ArrowDown, Minus, Clock, DollarSign, User
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

type AlertaRiesgo = {
  Id: number;
  OrdenId: number;
  FamiliaNombres: string;
  FamiliaApellidos: string;
  CuidadoraNombres: string;
  CuidadoraApellidos: string;
  Riesgo: 'Bajo' | 'Medio' | 'Alto';
  Score: number;
  Variables: { nombre: string; valor: string; impacto: 'positivo' | 'negativo' | 'neutral' }[];
  FechaCreacion: string;
  Revisado: boolean;
};

export function AdminAlertasRiesgo() {
  const { user } = useAuth();
  const headers = { 'Content-Type': 'application/json', 'x-user-id': String(user?.id) };
  const [alertas, setAlertas] = useState<AlertaRiesgo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/alertas/riesgo', { headers })
      .then(r => r.json())
      .then(data => {
        const mapped = (data.predicciones || []).map((p: any) => {
          let score = p.PuntajeRiesgo || 0;
          let riesgo: 'Bajo' | 'Medio' | 'Alto' = 'Bajo';
          if (score >= 50) riesgo = 'Alto';
          else if (score >= 25) riesgo = 'Medio';
          return {
            Id: p.Id, OrdenId: p.IdOrden,
            FamiliaNombres: p.FamiliaNombres || '', FamiliaApellidos: p.FamiliaApellidos || '',
            CuidadoraNombres: p.CuidadoraNombres || '', CuidadoraApellidos: p.CuidadoraApellidos || '',
            Riesgo: riesgo, Score: score,
            Variables: (p.VariablesAnalizadas || []).map((v: any) => ({
              nombre: v.variable || v.nombre || '',
              valor: v.peso ? String(v.peso) : '',
              impacto: score >= 50 ? 'negativo' : 'neutral',
            })),
            FechaCreacion: p.FechaCreacion || new Date().toISOString(),
            Revisado: !!p.AlertaGenerada,
          };
        });
        setAlertas(mapped);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleRevisar = async (id: number) => {
    const r = await fetch(`/api/alertas/riesgo/${id}/revisar`, { method: 'POST', headers });
    if (r.ok) {
      setAlertas(prev => prev.map(a => a.Id === id ? { ...a, Revisado: true } : a));
    }
  };

  const formatFecha = (f: string) => {
    const d = new Date(f);
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const riesgoBadge = (r: string) => {
    const map: Record<string, string> = {
      Bajo: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30',
      Medio: 'bg-amber-500/20 text-amber-200 border-amber-500/30',
      Alto: 'bg-red-500/20 text-red-200 border-red-500/30',
    };
    return map[r] || 'bg-[rgba(33,6,53,0.5)] text-[#6667AB]';
  };

  const riesgoIcon = (r: string) => {
    if (r === 'Alto') return <ArrowUp className="w-3.5 h-3.5" />;
    if (r === 'Medio') return <Minus className="w-3.5 h-3.5" />;
    return <ArrowDown className="w-3.5 h-3.5" />;
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-red-400';
    if (score >= 40) return 'text-amber-400';
    return 'text-emerald-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 70) return 'bg-red-500/20';
    if (score >= 40) return 'bg-amber-500/20';
    return 'bg-emerald-500/20';
  };

  return (
    <div className="max-w-7xl mx-auto pb-8">
      <div className="flex items-center gap-2 mb-1">
        <AlertTriangle className="w-6 h-6 text-[#F6A5C0]" />
        <h1 className="text-2xl font-extrabold text-white">Alertas de Riesgo</h1>
      </div>
      <p className="text-sm text-[#6667AB] mb-6">
        Órdenes identificadas con riesgo potencial — análisis automático de variables
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl p-5">
          <p className="text-xs font-bold text-[#6667AB] uppercase">Total Alertas</p>
          <p className="text-2xl font-bold text-white mt-1">{alertas.length}</p>
        </div>
        <div className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl p-5">
          <p className="text-xs font-bold text-[#6667AB] uppercase">Riesgo Alto</p>
          <p className="text-2xl font-bold text-red-400 mt-1">{alertas.filter(a => a.Riesgo === 'Alto').length}</p>
        </div>
        <div className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl p-5">
          <p className="text-xs font-bold text-[#6667AB] uppercase">Riesgo Medio</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">{alertas.filter(a => a.Riesgo === 'Medio').length}</p>
        </div>
        <div className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl p-5">
          <p className="text-xs font-bold text-[#6667AB] uppercase">Riesgo Bajo</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{alertas.filter(a => a.Riesgo === 'Bajo').length}</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <Clock className="w-8 h-8 text-[#6667AB] mx-auto mb-2 animate-spin" />
          <p className="text-sm text-[#6667AB]">Cargando alertas...</p>
        </div>
      ) : alertas.length === 0 ? (
        <div className="text-center py-16 bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl">
          <Shield className="w-12 h-12 text-[#6667AB] mx-auto mb-3" />
          <p className="text-[#6667AB]">No hay alertas de riesgo activas</p>
        </div>
      ) : (
        <div className="space-y-4">
          {alertas.map((a, i) => (
            <motion.div
              key={a.Id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border shadow-lg shadow-black/30 rounded-2xl p-5 ${
                a.Riesgo === 'Alto' && !a.Revisado
                  ? 'border-red-500/40 animate-pulse'
                  : 'border-[rgba(255,255,255,0.2)]'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl ${getScoreBg(a.Score)} flex items-center justify-center flex-shrink-0`}>
                  <span className={`text-lg font-extrabold ${getScoreColor(a.Score)}`}>{a.Score}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-bold text-white">
                      #{a.OrdenId} — {a.FamiliaNombres} {a.FamiliaApellidos}
                    </h3>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${riesgoBadge(a.Riesgo)}`}>
                      {riesgoIcon(a.Riesgo)} {a.Riesgo}
                    </span>
                    {a.Revisado && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 text-[10px] font-bold">
                        <CheckCircle className="w-3 h-3" /> Revisado
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#6667AB] mt-1">
                    <User className="w-3 h-3" />
                    <span>{a.CuidadoraNombres} {a.CuidadoraApellidos}</span>
                    <span>·</span>
                    <Clock className="w-3 h-3" />
                    <span>{formatFecha(a.FechaCreacion)}</span>
                  </div>

                  <div className="mt-3">
                    <p className="text-xs font-semibold text-[#6667AB] mb-2">Variables Analizadas:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {a.Variables.map((v, vi) => (
                        <div key={vi} className="bg-[rgba(33,6,53,0.4)] rounded-lg px-3 py-2 flex items-center justify-between">
                          <span className="text-[10px] text-[#F5D5E0]">{v.nombre}</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-white">{v.valor}</span>
                            {v.impacto === 'positivo' && <ArrowDown className="w-3 h-3 text-emerald-400" />}
                            {v.impacto === 'negativo' && <ArrowUp className="w-3 h-3 text-red-400" />}
                            {v.impacto === 'neutral' && <Minus className="w-3 h-3 text-[#6667AB]" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex-1 h-1.5 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${a.Score}%` }}
                        transition={{ duration: 0.6 }}
                        className={`h-full rounded-full ${a.Score >= 70 ? 'bg-red-500' : a.Score >= 40 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                      />
                    </div>
                    <span className={`text-[10px] font-bold ${getScoreColor(a.Score)}`}>
                      Score: {a.Score}/100
                    </span>
                  </div>
                </div>
                {!a.Revisado && (
                  <button
                    onClick={() => handleRevisar(a.Id)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#F6A5C0] text-[#210635] text-xs font-bold hover:bg-[#F6A5C0]/80 transition-colors flex-shrink-0"
                  >
                    <Eye className="w-3.5 h-3.5" /> Revisar
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
