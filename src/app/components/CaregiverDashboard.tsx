import { motion } from 'motion/react';
import { Briefcase, Wallet, UserCog, CheckCircle2, XCircle, Clock, TrendingUp, Star, Calendar, MapPin, Inbox } from 'lucide-react';
import type { CaregiverApplication } from './AdminDashboard';

export type ServiceRequest = {
  id: number;
  caregiverEmail: string;
  familyLastName: string;
  childName: string;
  childAge: string;
  childCondition: string;
  date: string;
  area: string;
  rate: number;
  hours: number;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  paymentStatus: 'unpaid' | 'in_escrow' | 'released';
  familyConfirmed?: boolean;
  caregiverConfirmed?: boolean;
  review?: { rating: number; text: string; serviceDate: string; createdAt: number };
  createdAt: number;
  meetingUrl?: string;
  adminEmail?: string;
  scheduledAt?: number;
  adminJoinedAt?: number;
  supervised?: boolean;
  interviewEscrowBlock?: boolean;
  supervisionIncidentAt?: number;
  supervisionJustification?: string;
};

export const COMMISSION_RATE = 0.15;

type Props = {
  profile: CaregiverApplication;
  requests: ServiceRequest[];
  onUpdateStatus: (id: number, status: 'accepted' | 'declined') => void;
  onCaregiverConfirm: (id: number) => void;
  onEditProfile?: () => void;
};

export function CaregiverDashboard({ profile, requests, onUpdateStatus, onCaregiverConfirm, onEditProfile }: Props) {
  const pendingCount = requests.filter((r) => r.status === 'pending').length;
  const released = requests.filter((r) => r.paymentStatus === 'released');
  const inEscrow = requests.filter((r) => r.paymentStatus === 'in_escrow');
  const net = (r: ServiceRequest) => r.rate * r.hours * (1 - COMMISSION_RATE);
  const monthEarnings = released.reduce((sum, r) => sum + net(r), 0);
  const heldEscrow = inEscrow.reduce((sum, r) => sum + net(r), 0);
  const acceptedHours = released.reduce((sum, r) => sum + r.hours, 0);
  const lifetimeEarnings = monthEarnings;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
          {profile.profileImage ? (
            <img src={profile.profileImage} alt={profile.nombres} className="w-16 h-16 rounded-2xl object-cover ring-4 ring-white shadow-lg" />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1E3A8A] to-[#10B981]" />
          )}
          <div>
            <span className="text-[10px] tracking-[0.25em] font-bold text-[#10B981] uppercase">Panel de Cuidadora</span>
            <h1 className="text-3xl font-bold text-[#1E3A8A] tracking-tight">Hola, Cuidadora {profile.nombres} 👋</h1>
            <p className="text-gray-500 mt-1">Aquí gestionas tus solicitudes de servicio, ingresos y perfil público.</p>
          </div>
        </div>
        <button
          onClick={onEditProfile}
          className="inline-flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 hover:border-[#1E3A8A] rounded-xl text-sm font-bold text-[#1E3A8A] transition-colors shadow-sm"
        >
          <UserCog className="w-4 h-4" /> Mi Perfil
        </button>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {[
          { label: 'Solicitudes Pendientes', value: pendingCount.toString(), icon: Briefcase, bg: 'bg-amber-50', color: 'text-amber-600' },
          { label: 'Horas completadas', value: `${acceptedHours} h`, icon: Clock, bg: 'bg-blue-50', color: 'text-[#1E3A8A]' },
          { label: 'Ingresos liberados', value: `S/ ${monthEarnings.toFixed(2)}`, icon: Wallet, bg: 'bg-emerald-50', color: 'text-[#10B981]' },
          { label: 'Total acumulado', value: `S/ ${lifetimeEarnings.toFixed(2)}`, icon: TrendingUp, bg: 'bg-purple-50', color: 'text-purple-600' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-4`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <p className="text-xs text-gray-500 font-medium">{s.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{s.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#1E3A8A]">Solicitudes de Servicio</h2>
              <p className="text-sm text-gray-500 mt-0.5">Citas reales enviadas por familias desde el catálogo.</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold">
              {pendingCount} pendientes
            </span>
          </div>
          {requests.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-50 to-emerald-50 flex items-center justify-center mx-auto mb-4">
                <Inbox className="w-7 h-7 text-[#10B981]" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Esperando tu primera solicitud de servicio.</h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
                Cuando una familia te solicite desde el catálogo, su solicitud aparecerá aquí con los datos del menor y podrás aceptar o rechazar.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {requests.map((r) => (
                <div key={r.id} className="p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-gray-50/60 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-gray-900">Familia {r.familyLastName}</h3>
                      {r.status === 'pending' && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">Pendiente</span>}
                      {r.status === 'accepted' && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">Aceptada</span>}
                      {r.status === 'declined' && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700">Rechazada</span>}
                      {r.status === 'completed' && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700">Completada</span>}
                    </div>
                    <p className="text-sm text-gray-600 mt-0.5">
                      Menor: <span className="font-bold">{r.childName}</span> · {r.childAge} · {r.childCondition}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500 flex-wrap">
                      <span className="inline-flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {r.date}</span>
                      <span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {r.area}</span>
                      <span className="inline-flex items-center gap-1"><Wallet className="w-3.5 h-3.5" /> S/ {r.rate}/h · {r.hours}h</span>
                    </div>
                  </div>
                  {r.status === 'pending' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onUpdateStatus(r.id, 'declined')}
                        className="px-3 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors inline-flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Rechazar
                      </button>
                      <button
                        onClick={() => onUpdateStatus(r.id, 'accepted')}
                        className="px-3 py-2 text-xs font-bold text-white bg-[#10B981] hover:bg-[#059669] rounded-lg transition-colors inline-flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Aceptar
                      </button>
                    </div>
                  )}
                  {r.status === 'accepted' && r.paymentStatus === 'unpaid' && (
                    <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-3 py-2 rounded-lg">
                      Esperando depósito de la familia
                    </span>
                  )}
                  {r.status === 'accepted' && r.paymentStatus === 'in_escrow' && !r.caregiverConfirmed && (
                    <button
                      onClick={() => onCaregiverConfirm(r.id)}
                      className="px-3 py-2 text-xs font-bold text-white bg-[#1E3A8A] hover:bg-[#1e40af] rounded-lg transition-colors inline-flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Confirmar finalización
                    </button>
                  )}
                  {r.status === 'accepted' && r.paymentStatus === 'in_escrow' && r.caregiverConfirmed && !r.familyConfirmed && (
                    <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-3 py-2 rounded-lg">
                      Esperando confirmación de la familia
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-gradient-to-br from-[#10B981] to-[#059669] rounded-2xl p-6 text-white shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Wallet className="w-5 h-5" />
            <h2 className="font-bold">Balance de Ingresos</h2>
          </div>
          <p className="text-emerald-100 text-sm mb-6">Los ingresos se acreditan cuando ambas partes confirman la finalización. Se descuenta la comisión CERTINANAS ({Math.round(COMMISSION_RATE * 100)}%).</p>
          <div className="space-y-4">
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/10">
              <p className="text-xs text-emerald-100">Disponible para retiro</p>
              <p className="text-2xl font-bold mt-1">S/ {monthEarnings.toFixed(2)}</p>
              <p className="text-[11px] text-emerald-100 mt-1">Servicios completados</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/10">
              <p className="text-xs text-emerald-100">Retenido en Escrow</p>
              <p className="text-2xl font-bold mt-1">S/ {heldEscrow.toFixed(2)}</p>
              <p className="text-[11px] text-emerald-100 mt-1">Se libera al completar el servicio</p>
            </div>
            <button
              disabled={monthEarnings === 0}
              className="w-full py-2.5 bg-white text-[#10B981] hover:bg-emerald-50 disabled:opacity-60 disabled:cursor-not-allowed rounded-xl text-sm font-bold transition-colors"
            >
              Retirar a mi cuenta
            </button>
          </div>
        </div>
      </div>

      <div className="mt-10 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-[#1E3A8A]">Mi Perfil Público</h2>
          <button onClick={onEditProfile} className="text-sm font-semibold text-[#10B981] hover:underline">Ver</button>
        </div>
        <div className="flex items-start gap-5 flex-wrap">
          {profile.profileImage ? (
            <img src={profile.profileImage} alt={profile.nombres} className="w-24 h-24 rounded-2xl object-cover ring-2 ring-white shadow" />
          ) : (
            <div className="w-24 h-24 rounded-2xl bg-gray-100" />
          )}
          <div className="flex-1 min-w-[240px]">
            <p className="font-bold text-gray-900 text-lg">{profile.nombres} {profile.apellidos}</p>
            <p className="text-sm text-gray-500">{profile.email} · DNI {profile.dni}</p>
            <div className="flex items-center gap-1 mt-2">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-sm font-bold text-gray-700">5.0</span>
              <span className="text-xs text-gray-400 ml-1">Perfil nuevo</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {(profile.specialties.length ? profile.specialties : ['Cuidado General']).map((s) => (
                <span key={s} className="px-2.5 py-1 bg-blue-50 text-[#1E3A8A] text-[11px] font-bold rounded-md border border-blue-100">{s}</span>
              ))}
            </div>
            {profile.bio && (
              <p className="text-sm text-gray-600 mt-3 leading-relaxed">{profile.bio}</p>
            )}
            <p className="text-xs text-gray-500 mt-3 leading-relaxed">
              Tus especialidades y descripción son administradas por el equipo CERTINANAS. Si necesitas actualizarlas, contacta soporte.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
