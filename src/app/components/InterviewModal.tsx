import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Clock as ClockIcon, Video } from 'lucide-react';
import { useState } from 'react';

interface InterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  nanaName: string;
}

export function InterviewModal({ isOpen, onClose, nanaName }: InterviewModalProps) {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#210635]/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-lg shadow-black/30 rounded-3xl w-full max-w-md overflow-hidden"
        >
          {isSubmitted ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-[#f6a5c0]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="w-8 h-8 text-[#cc8db3]" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">¡Cita Programada!</h3>
              <p className="text-[#6667AB] mb-6">
                Te hemos enviado un correo con el enlace de Google Meet para tu cita de conocimiento con {nanaName}.
              </p>
              <button
                onClick={onClose}
                className="w-full py-3 bg-[#F6A5C0] text-[#210635] rounded-xl font-medium hover:bg-[#e084a8] transition-all duration-300"
              >
                Cerrar
              </button>
            </div>
          ) : (
            <>
              <div className="p-6 border-b border-[rgba(255,255,255,0.1)] flex justify-between items-center bg-[rgba(33,6,53,0.4)]">
                <h3 className="text-xl font-bold text-white">Agendar Entrevista</h3>
                <button
                  onClick={onClose}
                  className="p-2 text-[#6667AB] hover:text-white hover:bg-[rgba(33,6,53,0.4)] rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <p className="text-[#6667AB]">
                  Selecciona una fecha y hora para una videollamada de 15 minutos (sin costo) con <span className="font-semibold text-white">{nanaName}</span>.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#F5D5E0] mb-1 flex items-center gap-2">
                      <Calendar className="w-4 h-4" /> Fecha
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full px-4 py-3 bg-[rgba(33,6,53,0.5)] border-[rgba(255,255,255,0.3)] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7B337E] focus:border-[#7B337E]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#F5D5E0] mb-1 flex items-center gap-2">
                      <ClockIcon className="w-4 h-4" /> Hora
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {['09:00', '11:30', '14:00', '16:00', '17:30', '19:00'].map((time) => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${
                            selectedTime === time
                              ? 'bg-[#CC8DB3] text-[#210635] border-[#CC8DB3] shadow-md shadow-black/20'
                              : 'bg-[rgba(33,6,53,0.5)] border-[rgba(255,255,255,0.3)] text-[#6667AB] hover:border-[#CC8DB3] hover:text-[#CC8DB3]'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  disabled={!selectedDate || !selectedTime}
                  onClick={() => setIsSubmitted(true)}
                  className="w-full py-4 bg-[#F6A5C0] text-[#210635] rounded-xl font-semibold hover:bg-[#e084a8] transition-all duration-300 shadow-lg shadow-black/30 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
                >
                  Confirmar Cita Virtual
                </button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
