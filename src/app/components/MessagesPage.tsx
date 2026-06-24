import { motion } from 'motion/react';
import { useState, useEffect, useRef } from 'react';
import { LogOut, Send, AlertTriangle, Bell, FileSignature } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ProfileAvatar } from './ProfileAvatar';

type Conversacion = {
  Id: number; FechaCreacion: string; FechaUltimoMensaje: string;
  CuidadoraId: number; Nombres: string; Apellidos: string;
  OrdenEstado: string | null; OrdenId: number | null; MenorNombre: string | null;
};

type Mensaje = {
  Id: number; IdRemitente: number; Contenido: string; Leido: number; FechaEnvio: string;
};

export function MessagesPage({ onNavigate }: { onNavigate?: (v: string) => void }) {
  const { user, logout } = useAuth();
  const [conversaciones, setConversaciones] = useState<Conversacion[]>([]);
  const [selectedChat, setSelectedChat] = useState<Conversacion | null>(null);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [texto, setTexto] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/mensajes/conversaciones', { headers: { 'x-user-id': String(user?.id) } })
      .then(r => r.json())
      .then(data => {
        setConversaciones(data);
        if (data.length > 0) setSelectedChat(data[0]);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedChat) return;
    fetch(`/api/mensajes/conversaciones/${selectedChat.Id}/mensajes`, { headers: { 'x-user-id': String(user?.id) } })
      .then(r => r.json())
      .then(setMensajes)
      .catch(() => {});
  }, [selectedChat?.Id]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [mensajes]);

  const enviar = async () => {
    if (!texto.trim() || !selectedChat) return;
    const r = await fetch(`/api/mensajes/conversaciones/${selectedChat.Id}/mensajes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': String(user?.id) },
      body: JSON.stringify({ contenido: texto.trim() }),
    });
    if (r.ok) {
      setMensajes(prev => [...prev, { Id: Date.now(), IdRemitente: Number(user?.id), Contenido: texto.trim(), Leido: 0, FechaEnvio: new Date().toISOString() }]);
      setTexto('');
    }
  };

  const reportarIncidencia = async () => {
    if (!selectedChat) return;
    await fetch('/api/mensajes/reportar-incidencia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': String(user?.id) },
      body: JSON.stringify({ idConversacion: selectedChat.Id, motivo: 'Reportado por el usuario' }),
    });
    setShowReportModal(false);
  };

  const formatHora = (f: string) => {
    const d = new Date(f);
    return d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const badgeEstado: Record<string, string> = {
    Pendiente: 'bg-amber-50 text-amber-700 border-amber-200',
    Confirmada: 'bg-[#f6a5c0]/20 text-[#F5D5E0] border-[#f6a5c0]',
    'En curso': 'bg-[#9d85b6]/20 text-[#F5D5E0] border-[#9d85b6]',
    Finalizada: 'bg-[#cc8db3]/20 text-[#F5D5E0] border-[#cc8db3]',
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#210635] via-[#420D4B] to-[#7B337E] flex flex-col">
      {/* Navbar */}
      <header className="bg-[#210635]/80 backdrop-blur-[20px] border-b border-[rgba(255,255,255,0.1)] text-white sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 overflow-hidden rounded"><img src="/logo.png" alt="" className="w-full h-full object-cover" /></div>
                <span className="text-lg font-extrabold text-[#f6a5c0] tracking-tight">CERTINANAS</span>
              </div>
              <span className="text-white/40 text-xl font-light hidden sm:inline">|</span>
              <span className="text-white/60 text-sm hidden sm:inline">Cuidado Infantil Especializado</span>
            </div>
            <nav className="flex items-center gap-6">
              {user?.rol === 'cuidadora' ? (
                <button onClick={() => onNavigate?.('cuidadora')} className="text-sm text-white/70 hover:text-white transition-colors">Mi Panel</button>
              ) : (
                <button onClick={() => onNavigate?.('search')} className="text-sm text-white/70 hover:text-white transition-colors">Inicio</button>
              )}
              <button onClick={() => onNavigate?.(user?.rol === 'cuidadora' ? 'cuidadora' : 'familia')} className="text-sm text-white/70 hover:text-white transition-colors">Mis Servicios</button>
              <button className="text-sm font-bold text-[#f6a5c0] border-b-2 border-[#f6a5c0] pb-0.5">Mensajes</button>
              <ProfileAvatar size={36} className="ml-2" />
              <button onClick={logout} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <LogOut className="w-4 h-4 text-white/60" />
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <div className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        <div className="flex gap-6 h-[calc(100vh-13rem)]">
          {/* Columna izquierda: Lista de conversaciones */}
          <div className="w-72 flex-shrink-0 bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] rounded-2xl shadow-lg shadow-black/30 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-[rgba(255,255,255,0.2)]">
              <h2 className="font-bold text-white">Conversaciones</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversaciones.map(c => (
                <button
                  key={c.Id}
                  onClick={() => setSelectedChat(c)}
                  className={`w-full text-left px-4 py-3.5 border-b border-[rgba(255,255,255,0.1)] transition-colors relative ${
                    selectedChat?.Id === c.Id ? 'bg-[rgba(246,165,192,0.15)]' : 'hover:bg-[rgba(33,6,53,0.3)]'
                  }`}
                >
                  {selectedChat?.Id === c.Id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#f6a5c0]" />}
                  <p className="font-semibold text-sm text-white">{c.Nombres} {c.Apellidos?.charAt(0)}.</p>
                  <p className="text-xs text-[#6667AB] mt-0.5">
                    {c.OrdenEstado === 'En curso' ? `Servicio activo ${c.MenorNombre ? '· ' + c.MenorNombre : ''}` : 'Servicio pendiente'}
                  </p>
                </button>
              ))}
              {conversaciones.length === 0 && (
                <p className="text-sm text-[#6667AB] p-4 text-center">No hay conversaciones</p>
              )}
            </div>
          </div>

          {/* Columna derecha: Chat */}
          <div className="flex-1 bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] rounded-2xl shadow-lg shadow-black/30 overflow-hidden flex flex-col">
            {selectedChat ? (
              <>
                {/* Encabezado del chat */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(255,255,255,0.2)]">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-white">{selectedChat.Nombres} {selectedChat.Apellidos}</h3>
                    {selectedChat.OrdenEstado && (
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${badgeEstado[selectedChat.OrdenEstado] || 'bg-white/20 text-[#6667AB] border-[rgba(255,255,255,0.3)]'}`}>
                        {selectedChat.OrdenEstado}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={async () => {
                        if (!selectedChat) return;
                        await fetch('/api/mensajes/solicitar-contrato', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json', 'x-user-id': String(user?.id) },
                          body: JSON.stringify({ idConversacion: selectedChat.Id }),
                        });
                        const r = await fetch(`/api/mensajes/conversaciones/${selectedChat.Id}/mensajes`, { headers: { 'x-user-id': String(user?.id) } });
                        setMensajes(await r.json());
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors text-xs font-semibold"
                    >
                      <FileSignature className="w-3.5 h-3.5" /> Solicitar contrato
                    </button>
                    <button
                      onClick={() => setShowReportModal(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors text-xs font-semibold"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" /> Reportar incidencia
                    </button>
                  </div>
                </div>

                {/* Mensajes */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {mensajes.map(m => {
                    const esMio = m.IdRemitente === Number(user?.id);
                    return (
                      <div key={m.Id} className={`flex flex-col ${esMio ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl ${
                          esMio ? 'bg-[#F6A5C0] text-[#210635] rounded-br-md' : 'bg-[rgba(123,51,126,0.5)] backdrop-blur-sm text-white rounded-bl-md'
                        }`}>
                          <p className="text-sm">{m.Contenido}</p>
                        </div>
                        <span className="text-[10px] text-[#6667AB] mt-1 px-1">
                          {esMio ? 'Tú' : selectedChat.Nombres.split(' ')[0]} · {formatHora(m.FechaEnvio)}
                        </span>
                      </div>
                    );
                  })}
                  <div ref={chatEndRef} />
                </div>

                {/* Input */}
                <div className="bg-[rgba(33,6,53,0.5)] backdrop-blur-sm border-t border-[rgba(255,255,255,0.2)] px-6 py-4">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={texto}
                      onChange={e => setTexto(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && enviar()}
                      placeholder="Escribe un mensaje..."
                      className="flex-1 px-4 py-2.5 rounded-xl bg-[rgba(33,6,53,0.5)] border border-[rgba(255,255,225,0.3)] text-white placeholder:text-[#6667AB] text-sm focus:outline-none focus:ring-2 focus:ring-[#7B337E] focus:border-[#7B337E]"
                    />
                    <button
                      onClick={enviar}
                      disabled={!texto.trim()}
                      className={`px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
                        texto.trim() ? 'bg-[#CC8DB3] text-[#210635] shadow-md' : 'bg-[rgba(33,6,53,0.5)] text-[#6667AB] cursor-not-allowed'
                      }`}
                    >
                      <Send className="w-4 h-4" /> Enviar
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-[#6667AB] text-sm">
                Selecciona una conversación
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Barra inferior de notificaciones */}
      <div className="max-w-6xl mx-auto w-full px-4 pb-6">
        <div className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] rounded-2xl shadow-lg shadow-black/30 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-[#6667AB]">
            <Bell className="w-4 h-4 text-[#f6a5c0]" />
            Notificaciones: <strong>2</strong> nuevas
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              Bitácora pendiente
            </span>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#9d85b6]/20 text-[#F5D5E0] border border-[#9d85b6]">
              Servicio en curso
            </span>
          </div>
        </div>
      </div>

      {/* Modal reportar incidencia */}
      {showReportModal && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowReportModal(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] rounded-2xl max-w-sm w-full shadow-lg shadow-black/30 p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-white">Reportar incidencia</h3>
                <p className="text-sm text-[#6667AB]">¿Estás seguro de reportar esta conversación?</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowReportModal(false)} className="flex-1 py-2.5 rounded-xl border border-[rgba(255,255,255,0.2)] text-sm font-semibold text-[#6667AB] hover:bg-[rgba(33,6,53,0.3)] transition-colors">
                Cancelar
              </button>
              <button onClick={reportarIncidencia} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-colors shadow-md">
                Reportar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
