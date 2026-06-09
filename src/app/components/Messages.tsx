import { motion } from 'motion/react';
import { Send, Search, Shield, Paperclip, Smile, CheckCheck, Lock } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

type Msg = { id: string; from: 'me' | 'them'; text: string; time: string };

type Conversation = {
  id: number;
  name: string;
  photo: string;
  lastMsg: string;
  time: string;
  unread: number;
  online: boolean;
};

export function Messages() {
  const conversations: Conversation[] = [
    { id: 1, name: 'María González', photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200', lastMsg: 'Perfecto, nos vemos el jueves 👍', time: '10:32', unread: 2, online: true },
    { id: 2, name: 'Carmen Rodríguez', photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200', lastMsg: 'Le envío los detalles de la sesión.', time: 'Ayer', unread: 0, online: false },
    { id: 3, name: 'Ana Torres', photo: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200', lastMsg: '¿Cómo estuvo Mateo hoy?', time: 'Lun', unread: 0, online: true },
  ];

  const [activeId, setActiveId] = useState(1);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Msg[]>([
    { id: '1', from: 'them', text: 'Hola, buenas tardes. Le escribo para confirmar la cita del jueves.', time: '10:28' },
    { id: '2', from: 'me', text: 'Buenas tardes María, sí, confirmamos. ¿De 15:00 a 19:00?', time: '10:30' },
    { id: '3', from: 'them', text: 'Correcto. ¿Hay alguna instrucción especial para Lucas esta vez?', time: '10:31' },
    { id: '4', from: 'them', text: 'Perfecto, nos vemos el jueves 👍', time: '10:32' },
  ]);

  const active = conversations.find((c) => c.id === activeId)!;
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages((p) => [...p, { id: Date.now().toString(), from: 'me', text: input, time: 'Ahora' }]);
    setInput('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#250e2c] tracking-tight">Mensajes</h1>
        <p className="text-gray-500 mt-1 text-sm inline-flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-[#cc8db3]" /> Conversación cifrada · Datos personales protegidos
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-3 h-[640px]"
      >
        {/* Sidebar */}
        <aside className="border-r border-gray-100 flex flex-col">
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                placeholder="Buscar conversación..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#250e2c]/30 outline-none"
              />
            </div>
          </div>
          <div className="overflow-y-auto flex-1">
            {conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveId(c.id)}
                className={`w-full text-left p-4 flex items-center gap-3 border-b border-gray-50 transition-colors ${
                  activeId === c.id ? 'bg-[#f6a5c0]/20/60' : 'hover:bg-gray-50'
                }`}
              >
                <div className="relative">
                  <img src={c.photo} alt={c.name} className="w-12 h-12 rounded-full object-cover" />
                  {c.online && <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#f6a5c0]/200 border-2 border-white rounded-full" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-gray-900 truncate">{c.name}</h3>
                    <span className="text-[10px] text-gray-400">{c.time}</span>
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{c.lastMsg}</p>
                </div>
                {c.unread > 0 && (
                  <span className="w-5 h-5 rounded-full bg-[#cc8db3] text-white text-[10px] font-bold flex items-center justify-center">
                    {c.unread}
                  </span>
                )}
              </button>
            ))}
          </div>
        </aside>

        {/* Conversation */}
        <section className="md:col-span-2 flex flex-col bg-gray-50/40">
          <header className="p-4 bg-white border-b border-gray-100 flex items-center gap-3">
            <div className="relative">
              <img src={active.photo} alt={active.name} className="w-11 h-11 rounded-full object-cover" />
              {active.online && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#f6a5c0]/200 border-2 border-white rounded-full" />}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900">{active.name}</h3>
              <p className="text-xs text-[#cc8db3] font-semibold inline-flex items-center gap-1">
                <Shield className="w-3 h-3" /> Cuidadora Verificada
              </p>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="text-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#f6a5c0]/20 text-[#cc8db3] text-[11px] font-bold rounded-full">
                <Lock className="w-3 h-3" /> Los mensajes están cifrados de extremo a extremo
              </span>
            </div>
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[70%] px-4 py-2.5 rounded-2xl shadow-sm text-sm leading-relaxed ${
                    m.from === 'me'
                      ? 'bg-[#250e2c] text-white rounded-tr-sm'
                      : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm'
                  }`}
                >
                  <p>{m.text}</p>
                  <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${m.from === 'me' ? 'text-[#9d85b6]' : 'text-gray-400'}`}>
                    {m.time}
                    {m.from === 'me' && <CheckCheck className="w-3 h-3" />}
                  </div>
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>

          <form onSubmit={send} className="p-4 bg-white border-t border-gray-100 flex items-center gap-2">
            <button type="button" className="p-2 text-gray-400 hover:text-[#250e2c] transition-colors">
              <Paperclip className="w-5 h-5" />
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe un mensaje..."
              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-100 rounded-full text-sm focus:bg-white focus:ring-2 focus:ring-[#250e2c]/30 outline-none"
            />
            <button type="button" className="p-2 text-gray-400 hover:text-[#250e2c] transition-colors">
              <Smile className="w-5 h-5" />
            </button>
            <button
              type="submit"
              disabled={!input.trim()}
              className="p-3 bg-[#cc8db3] hover:bg-[#b07a9a] text-white rounded-full disabled:opacity-40 transition-colors shadow-md"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </section>
      </motion.div>
    </div>
  );
}

