import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { Calendar, CreditCard, Heart, Star, ChevronRight, Clock, CheckCircle2, AlertCircle, MessageSquare, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

type Props = {
  onOpenMessages: () => void;
  onOpenCheckout: () => void;
};

export function Dashboard({ onOpenMessages, onOpenCheckout }: Props) {
  const { user } = useAuth();
  const [citas, setCitas] = useState<any[]>([]);
  const [escrow, setEscrow] = useState(0);
  const [pagadoMes, setPagadoMes] = useState(0);
  const [favoritas, setFavoritas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      fetch('/api/familia/citas', { headers: { 'x-user-id': String(user.id) } }).then(r => r.json()).catch(() => []),
      fetch('/api/search/cuidadoras?verificada=0', { headers: { 'x-user-id': String(user.id) } }).then(r => r.json()).catch(() => []),
    ]).then(([citasData, cuidadoras]) => {
      setCitas(Array.isArray(citasData) ? citasData : []);
      const top = Array.isArray(cuidadoras) ? cuidadoras.slice(0, 3).map((c: any) => ({
        id: c.Id,
        name: `${c.Nombres} ${c.Apellidos}`,
        photo: c.FotoPerfil ? `/uploads/${c.FotoPerfil}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(c.Nombres + '+' + c.Apellidos)}&background=cc8db3&color=210635&size=200`,
        rating: c.CalificacionPromedio || 0,
        specialty: c.Especialidades || 'Cuidado especializado',
      })) : [];
      setFavoritas(top);
      setLoading(false);
    });
    fetch('/api/admin/escrows', { headers: { 'x-user-id': String(user.id) } }).then(r => r.json()).then((data: any[]) => {
      if (Array.isArray(data)) {
        const retenido = data.filter(e => e.EscrowEstado === 'Retenido').reduce((s, e) => s + (e.MontoTotal || 0), 0);
        const pagado = data.filter(e => e.EscrowEstado === 'Liberado').reduce((s, e) => s + (e.MontoTotal || 0), 0);
        setEscrow(retenido);
        setPagadoMes(pagado);
      }
    }).catch(() => {});
  }, [user?.id]);

  const statusBadge = (est: string) => {
    if (est === 'Programada' || est === 'Confirmada') return { label: 'Confirmada', color: 'bg-[#F6A5C0] text-[#210635]' };
    if (est === 'Completada') return { label: 'Completada', color: 'bg-emerald-500/20 text-emerald-200' };
    return { label: est || 'Pendiente', color: 'bg-[#CC8DB3] text-[#210635]' };
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#CC8DB3] animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <h1 className="text-4xl font-bold text-white tracking-tight">Hola, {user?.nombres || 'Familia'}</h1>
        <p className="text-[#6667AB] mt-2 text-lg">Este es el resumen de tu actividad en CERTINANAS.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {[
          { label: 'Próximas Citas', value: String(citas.filter((c: any) => c.Estado !== 'Completada').length), icon: Calendar, color: 'blue', bg: 'bg-[#F6A5C0]/20', text: 'text-white' },
          { label: 'Pagos en Escrow', value: `S/ ${escrow.toFixed(2)}`, icon: CreditCard, color: 'emerald', bg: 'bg-[#F6A5C0]/20', text: 'text-[#CC8DB3]' },
          { label: 'Cuidadoras', value: String(favoritas.length), icon: Heart, color: 'rose', bg: 'bg-[rgba(33,6,53,0.4)]', text: 'text-[#F6A5C0]' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center`}>
                <s.icon className={`w-6 h-6 ${s.text}`} />
              </div>
            </div>
            <p className="text-sm text-[#6667AB] font-medium">{s.label}</p>
            <p className="text-3xl font-bold text-white mt-1">{s.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Próximas Citas</h2>
          </div>
          <div className="space-y-4">
            {citas.length === 0 ? (
              <p className="text-[#6667AB] text-sm text-center py-8">No tienes citas agendadas</p>
            ) : citas.slice(0, 5).map((apt: any) => {
              const sb = statusBadge(apt.Estado);
              return (
                <div key={apt.Id} className="flex items-center gap-4 p-4 rounded-xl border border-[rgba(255,255,255,0.2)] bg-[rgba(33,6,53,0.5)] backdrop-blur-sm hover:border-[rgba(255,255,255,0.4)] transition-all">
                  <div className="w-14 h-14 rounded-full bg-[rgba(33,6,53,0.5)] border border-[rgba(255,255,255,0.1)] flex items-center justify-center text-[#CC8DB3] font-bold text-lg flex-shrink-0">
                    {apt.CuidadoraNombres?.charAt(0)}{apt.CuidadoraApellidos?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-white">{apt.CuidadoraNombres} {apt.CuidadoraApellidos}</h3>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${sb.color}`}>
                        {sb.label === 'Confirmada' ? (
                          <span className="inline-flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> {sb.label}</span>
                        ) : (
                          <span className="inline-flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {sb.label}</span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-[#F5D5E0]">
                      <span className="inline-flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{apt.FechaCita}</span>
                      <span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{apt.HoraCita}</span>
                    </div>
                  </div>
                  <button onClick={onOpenMessages} className="px-3 py-2 text-xs font-bold text-[#210635] bg-[#CC8DB3] hover:bg-[#b07a9a] rounded-lg transition-colors inline-flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5" /> Mensajes
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-linear-to-br from-[#210635] to-[#7B337E] rounded-2xl p-6 text-white shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="w-5 h-5" />
            <h2 className="font-bold">Estado de Pagos</h2>
          </div>
          <p className="text-[#F5D5E0] text-sm mb-6">Resumen de fondos retenidos en Escrow.</p>
          <div className="space-y-4">
            <div className="bg-[rgba(33,6,53,0.5)] backdrop-blur rounded-xl p-4 border border-[rgba(255,255,255,0.2)]">
              <p className="text-xs text-[#6667AB]">Retenido (Escrow)</p>
              <p className="text-2xl font-bold mt-1">S/ {escrow.toFixed(2)}</p>
              <p className="text-[11px] text-[#6667AB] mt-1">Se liberará al completar el servicio</p>
            </div>
            <div className="bg-[rgba(33,6,53,0.5)] backdrop-blur rounded-xl p-4 border border-[rgba(255,255,255,0.2)]">
              <p className="text-xs text-[#6667AB]">Pagado</p>
              <p className="text-2xl font-bold mt-1">S/ {pagadoMes.toFixed(2)}</p>
            </div>
            <button onClick={onOpenCheckout} className="w-full py-2.5 bg-[#CC8DB3] text-[#210635] hover:bg-[#b07a9a] rounded-xl text-sm font-bold transition-colors inline-flex items-center justify-center gap-2">
              Realizar Pago Pendiente <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-10 bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Cuidadoras Destacadas</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {favoritas.length === 0 ? (
            <p className="text-[#6667AB] text-sm col-span-3 text-center py-8">No hay cuidadoras disponibles</p>
          ) : favoritas.map((f: any) => (
            <div key={f.id} className="flex items-center gap-4 p-4 rounded-xl border border-[rgba(255,255,255,0.2)] bg-[rgba(33,6,53,0.5)] backdrop-blur-sm hover:shadow-md transition-shadow">
              <img src={f.photo} alt={f.name} className="w-14 h-14 rounded-full object-cover" />
              <div className="flex-1">
                <h3 className="font-bold text-white">{f.name}</h3>
                <p className="text-xs text-[#6667AB]">{f.specialty}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="w-3.5 h-3.5 text-[#CC8DB3] fill-[#CC8DB3]" />
                  <span className="text-xs font-bold text-[#F5D5E0]">{f.rating}</span>
                </div>
              </div>
              <Heart className="w-5 h-5 text-[#F6A5C0] fill-[#F6A5C0]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
