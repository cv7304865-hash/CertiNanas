import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

type Message = {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  options?: string[];
};

export function FloatingSupport() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const initialMessage: Message = {
    id: '1',
    sender: 'bot',
    text: '¡Hola! Soy el asistente inteligente de CERTINANAS. Entiendo que encontrar cuidado especializado es una decisión muy importante. ¿Te gustaría que te explique cómo funcionan nuestros perfiles verificados o nuestro sistema de pago seguro?',
    options: [
      '¿Cómo verifican a las cuidadoras?',
      'Explícame el pago Escrow',
      'Ayúdame a encontrar una cuidadora',
      'Sobre la privacidad de mis datos'
    ],
  };

  const [messages, setMessages] = useState<Message[]>([initialMessage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      let botResponseText = '';

      const lowerText = text.toLowerCase();

      if (lowerText.includes('encontrar') || lowerText.includes('buscar')) {
        botResponseText = 'Te ayudo encantado. Visita la sección "Catálogo" y utiliza los filtros por: \n\n• Especialización (TEA, TDAH, Síndrome de Down, etc.)\n• Años de experiencia\n• Área de dedicación (cuidado domiciliario, escolar, terapias)\n\n¿Sobre qué especialización en particular necesitas apoyo?';
      }
      else if (lowerText.includes('cómo verifican') || lowerText.includes('verifican')) {
        botResponseText = 'Nuestro proceso incluye 3 fases rigurosas:\n\n1. Validación de identidad (DNI/CE).\n2. Verificación manual de certificados (Educación Especial, RCP).\n3. Revisión obligatoria de Antecedentes Policiales y Penales (con máximo 3 meses de antigüedad). \n\nSolo el 10% de las postulantes logra ingresar a nuestro catálogo.';
      }
      else if (lowerText.includes('pago seguro') || lowerText.includes('dudas sobre el pago')) {
        botResponseText = 'Utilizamos un sistema Escrow (Retención Segura). Usted realiza el pago al confirmar el servicio, pero el dinero se mantiene protegido en nuestra plataforma. Solo se transfiere a la cuenta de la cuidadora cuando usted confirma que el cuidado finalizó satisfactoriamente.';
      }
      else if (lowerText.includes('agendar una cita') || lowerText.includes('necesito ayuda para agendar')) {
        botResponseText = '¡Por supuesto! Para agendar una cita, diríjase a la sección "Catálogo", seleccione a la cuidadora especializada de su preferencia y haga clic en "Solicitar Entrevista". Podrá elegir la fecha y hora para una videollamada de conocimiento de 15 minutos sin costo alguno.';
      }
      else if (lowerText.includes('seguridad') || lowerText.includes('datos') || lowerText.includes('privacidad')) {
        botResponseText = 'En cumplimiento de la Ley N° 29733 (Ley de Protección de Datos Personales), tratamos toda información como datos sensibles bajo estrictos protocolos de encriptación bancaria. Su registro requiere la aceptación de nuestros términos para garantizar un entorno formal y 100% seguro.';
      }
      else {
        botResponseText = 'Gracias por escribirnos. Nuestro equipo humano está revisando su consulta y se contactará con usted en breve. ¿Hay algo más en lo que pueda ayudarle mientras tanto?';
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: botResponseText,
        options: [
          'Quiero saber cómo verifican a las cuidadoras.',
          'Tengo dudas sobre el pago seguro.'
        ]
      };

      setIsTyping(false);
      setMessages((prev) => [...prev, botMessage]);
    }, 1500);
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 p-4 bg-[#F6A5C0] text-white rounded-full shadow-2xl hover:bg-[#e08ea8] transition-colors shadow-[#F6A5C0]/30"
        aria-label="Abrir chat de soporte"
      >
        <MessageCircle className="w-7 h-7" />
        {/* Unread badge indicator */}
        <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="fixed bottom-24 right-6 z-50 w-[350px] bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] rounded-3xl shadow-lg shadow-black/30 overflow-hidden flex flex-col h-[500px]"
          >
            {/* Header */}
            <div className="bg-[#210635] p-4 text-white flex justify-between items-center shadow-md z-10">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="bg-[rgba(33,6,53,0.4)] p-2 rounded-full">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-[#210635] rounded-full"></div>
                </div>
                <div>
                  <span className="font-bold text-sm block">Asistente CERTINANAS</span>
                  <span className="text-[10px] text-[#cc8db3]">En línea</span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[#cc8db3] hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-4 custom-scrollbar">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>

                  {/* Avatar + Message row */}
                  <div className={`flex items-end gap-2 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    {msg.sender === 'bot' && (
                      <div className="w-6 h-6 rounded-full bg-[#9d85b6]/30 flex items-center justify-center shrink-0 mb-1">
                        <Bot className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}

                    <div className={`p-3.5 text-sm whitespace-pre-wrap leading-relaxed shadow-sm ${
                      msg.sender === 'user'
                        ? 'bg-[#F6A5C0] text-[#210635] rounded-2xl rounded-tr-sm'
                        : 'bg-[rgba(123,51,126,0.5)] backdrop-blur-sm text-white rounded-2xl rounded-tl-sm'
                    }`}>
                      {msg.text}
                    </div>
                  </div>

                  {/* Options Buttons (Only if bot message has options) */}
                  {msg.options && (
                    <div className="flex flex-col gap-2 mt-3 ml-8 w-[85%]">
                      {msg.options.map((option, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(option)}
                          className="text-left text-xs bg-[rgba(33,6,53,0.5)] backdrop-blur-sm text-[#F5D5E0] border border-[rgba(255,255,255,0.2)] hover:bg-[rgba(246,165,192,0.15)] hover:text-white py-2.5 px-4 rounded-xl transition-colors font-medium shadow-sm"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex items-end gap-2 max-w-[85%]">
                  <div className="w-6 h-6 rounded-full bg-[#9d85b6]/30 flex items-center justify-center shrink-0 mb-1">
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="bg-[rgba(123,51,126,0.5)] backdrop-blur-sm p-4 rounded-2xl rounded-tl-sm border border-[rgba(255,255,255,0.2)] shadow-sm flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-[#6667AB] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-[#6667AB] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-[#6667AB] rounded-full animate-bounce"></div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-[rgba(33,6,53,0.5)] backdrop-blur-sm border-t border-[rgba(255,255,255,0.2)] shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend(inputText);
                }}
                className="flex items-center gap-3 relative"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Escriba su consulta aquí..."
                  className="flex-1 bg-[rgba(33,6,53,0.5)] border border-[rgba(255,255,225,0.3)] backdrop-blur-sm rounded-full pl-5 pr-12 py-3.5 text-sm text-white placeholder:text-[#6667AB] focus:outline-none focus:ring-2 focus:ring-[#7B337E] focus:border-[#7B337E] transition-all"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || isTyping}
                  className="absolute right-2 p-2 bg-[#CC8DB3] text-[#210635] rounded-full hover:bg-[#b07a9a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </form>
              <div className="text-center mt-2">
                <span className="text-[10px] text-[#6667AB] font-medium">Asistente Virtual IA • CERTINANAS</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.3); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.5); }
      `}</style>
    </>
  );
}
