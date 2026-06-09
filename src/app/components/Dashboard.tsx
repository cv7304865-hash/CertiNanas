import { motion } from 'motion/react';
import { Calendar, CreditCard, Heart, Star, ChevronRight, Clock, CheckCircle2, AlertCircle, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

type Props = {
  onOpenMessages: () => void;
  onOpenCheckout: () => void;
};

export function Dashboard({ onOpenMessages, onOpenCheckout }: Props) {
  const { user } = useAuth();
  const appointments = [
    {
      id: 1,
      nana: 'María González',
      photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
      date: 'Jue 21 Mayo',
      time: '15:00 - 19:00',
      status: 'Confirmada',
      type: 'Cuidado domiciliario',
    },
    {
      id: 2,
      nana: 'Carmen Rodríguez',
      photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
      date: 'Sáb 23 Mayo',
      time: '09:00 - 13:00',
      status: 'Pendiente de pago',
      type: 'Terapia de estimulación',
    },
  ];

  const favorites = [
    { id: 1, name: 'María González', photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200', rating: 4.9, specialty: 'TDAH · TEA' },
    { id: 2, name: 'Ana Torres', photo: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200', rating: 4.9, specialty: 'TEA · TDAH' },
    { id: 3, name: 'Sofía Martínez', photo: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=200', rating: 4.8, specialty: 'Síndrome de Down' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <h1 className="text-4xl font-bold text-[#250e2c] tracking-tight">Hola, {user?.nombres || 'Familia'} 👋</h1>
        <p className="text-gray-500 mt-2 text-lg">Este es el resumen de tu actividad en CERTINANAS.</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {[
          { label: 'Próximas Citas', value: '2', icon: Calendar, color: 'blue', bg: 'bg-[#f6a5c0]/20', text: 'text-[#250e2c]' },
          { label: 'Pagos en Escrow', value: 'S/ 240', icon: CreditCard, color: 'emerald', bg: 'bg-[#f6a5c0]/20', text: 'text-[#cc8db3]' },
          { label: 'Favoritas', value: '3', icon: Heart, color: 'rose', bg: 'bg-rose-50', text: 'text-rose-500' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-white/40 backdrop-blur-xl border border-white/30 shadow-lg shadow-black/5 rounded-2xl p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center`}>
                <s.icon className={`w-6 h-6 ${s.text}`} />
              </div>
            </div>
            <p className="text-sm text-gray-500 font-medium">{s.label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{s.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upcoming Appointments */}
        <div className="lg:col-span-2 bg-white/40 backdrop-blur-xl border border-white/30 shadow-lg shadow-black/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[#250e2c]">Próximas Citas Agendadas</h2>
            <button className="text-sm font-semibold text-[#cc8db3] hover:underline">Ver todas</button>
          </div>
          <div className="space-y-4">
            {appointments.map((apt) => (
              <div key={apt.id} className="flex items-center gap-4 p-4 rounded-xl border border-white/30 bg-white/20 backdrop-blur-sm hover:border-white/60 hover:bg-white/30 transition-all">
                <img src={apt.photo} alt={apt.nana} className="w-14 h-14 rounded-full object-cover ring-2 ring-white shadow-sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-gray-900">{apt.nana}</h3>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        apt.status === 'Confirmada'
                          ? 'bg-[#f6a5c0] text-white'
                          : 'bg-[#cc8db3] text-white'
                      }`}
                    >
                      {apt.status === 'Confirmada' ? (
                        <span className="inline-flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> {apt.status}</span>
                      ) : (
                        <span className="inline-flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {apt.status}</span>
                      )}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{apt.type}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-600">
                    <span className="inline-flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{apt.date}</span>
                    <span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{apt.time}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={onOpenMessages}
                    className="px-3 py-2 text-xs font-bold text-white bg-[#cc8db3] hover:bg-[#b07a9a] rounded-lg transition-colors inline-flex items-center gap-1"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> Mensajes
                  </button>
                  {apt.status !== 'Confirmada' && (
                    <button
                      onClick={onOpenCheckout}
                      className="px-3 py-2 text-xs font-bold text-white bg-[#cc8db3] hover:bg-[#b07a9a] rounded-lg transition-colors"
                    >
                      Pagar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment status */}
        <div className="bg-gradient-to-br from-[#250e2c] to-[#837ab6] rounded-2xl p-6 text-white shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="w-5 h-5" />
            <h2 className="font-bold">Estado de Pagos</h2>
          </div>
          <p className="text-blue-100 text-sm mb-6">Resumen de fondos retenidos en Escrow.</p>
          <div className="space-y-4">
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/10">
              <p className="text-xs text-[#9d85b6]">Retenido (Escrow)</p>
              <p className="text-2xl font-bold mt-1">S/ 240.00</p>
              <p className="text-[11px] text-[#9d85b6] mt-1">Se liberará al completar el servicio</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/10">
              <p className="text-xs text-[#9d85b6]">Pagado este mes</p>
              <p className="text-2xl font-bold mt-1">S/ 580.00</p>
            </div>
            <button
              onClick={onOpenCheckout}
              className="w-full py-2.5 bg-[#cc8db3] hover:bg-[#b07a9a] rounded-xl text-sm font-bold transition-colors inline-flex items-center justify-center gap-2"
            >
              Realizar Pago Pendiente <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Favorites */}
      <div className="mt-10 bg-white/40 backdrop-blur-xl border border-white/30 shadow-lg shadow-black/5 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#250e2c]">Cuidadoras Favoritas</h2>
          <button className="text-sm font-semibold text-[#cc8db3] hover:underline">Gestionar</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {favorites.map((f) => (
            <div key={f.id} className="flex items-center gap-4 p-4 rounded-xl border border-white/30 bg-white/20 backdrop-blur-sm hover:shadow-md transition-shadow">
              <img src={f.photo} alt={f.name} className="w-14 h-14 rounded-full object-cover" />
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">{f.name}</h3>
                <p className="text-xs text-gray-500">{f.specialty}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  <span className="text-xs font-bold text-gray-700">{f.rating}</span>
                </div>
              </div>
              <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
