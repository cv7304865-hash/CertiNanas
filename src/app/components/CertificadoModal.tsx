import { motion } from 'motion/react';
import { X, Download, Award, CheckCircle, Calendar, Clock, User, Hash } from 'lucide-react';

type CertificadoData = {
  nombre: string; documento: string; titulo: string; descripcion: string;
  categoria: string; puntaje: number; aprobado: boolean; fecha: string;
  duracionMinutos: number; codigo: string;
};

export function CertificadoModal({ data, onClose }: { data: CertificadoData; onClose: () => void }) {
  const handlePrint = () => {
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`
      <html><head><title>Certificado - ${data.titulo}</title>
      <style>
        @page { margin: 0; size: landscape; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Georgia', 'Times New Roman', serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #fff; }
        .cert { width: 900px; height: 636px; border: 18px solid #7B337E; position: relative; background: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; text-align: center; }
        .cert::before { content: ''; position: absolute; inset: 8px; border: 2px solid #CC8DB3; }
        .cert h1 { color: #7B337E; font-size: 32px; letter-spacing: 6px; text-transform: uppercase; margin-bottom: 8px; }
        .cert .sub { color: #666; font-size: 14px; margin-bottom: 24px; }
        .cert .present { color: #333; font-size: 16px; margin-bottom: 8px; }
        .cert .name { color: #210635; font-size: 36px; font-weight: bold; margin-bottom: 8px; border-bottom: 2px solid #CC8DB3; padding-bottom: 8px; display: inline-block; }
        .cert .course { color: #7B337E; font-size: 22px; font-weight: bold; margin: 12px 0; }
        .cert .detail { color: #555; font-size: 13px; margin: 4px 0; }
        .cert .score { color: #7B337E; font-size: 28px; font-weight: bold; margin: 12px 0; }
        .cert .footer { position: absolute; bottom: 30px; left: 0; right: 0; display: flex; justify-content: space-between; padding: 0 50px; font-size: 11px; color: #888; }
        .cert .footer div { text-align: center; }
        .cert .footer .line { width: 180px; border-top: 1px solid #333; margin-bottom: 4px; }
      </style></head><body>
      <div class="cert">
        <h1>CertiNanas</h1>
        <div class="sub">Plataforma de Cuidado Especializado</div>
        <div class="present">Otorga el presente certificado a</div>
        <div class="name">${data.nombre}</div>
        <div class="detail">Documento: ${data.documento}</div>
        <div class="course">${data.titulo}</div>
        <div class="detail">${data.descripcion || ''}</div>
        <div class="score">${data.puntaje}%</div>
        <div class="detail">Categoria: ${data.categoria} | Duracion: ${data.duracionMinutos} min</div>
        <div class="detail">Fecha: ${data.fecha ? new Date(data.fecha).toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' }) : '--'}</div>
        <div class="footer">
          <div><div class="line" style="margin-left:0"></div>CertiNanas</div>
          <div><div class="line" style="margin:0 auto"></div>Codigo: ${data.codigo}</div>
        </div>
      </div>
      <script>window.print();window.close();</script>
      </body></html>
    `);
    w.document.close();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        onClick={e => e.stopPropagation()}
        className="bg-[rgba(33,6,53,0.95)] backdrop-blur-[25px] border border-[rgba(255,255,255,0.12)] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between p-5 border-b border-[rgba(255,255,255,0.08)]">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[#F6A5C0]" />
            <h3 className="text-lg font-bold text-white">Certificado</h3>
          </div>
          <button onClick={onClose} className="p-1 text-[#6667AB] hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="bg-[rgba(33,6,53,0.4)] border-2 border-[#7B337E] rounded-2xl p-8 text-center relative">
            <div className="absolute inset-2 border border-[#CC8DB3]/40 rounded-xl pointer-events-none" />

            <div className="relative">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-[rgba(246,165,192,0.15)] flex items-center justify-center">
                <Award className="w-8 h-8 text-[#F6A5C0]" />
              </div>

              <h2 className="text-xl font-bold text-[#7B337E] tracking-widest uppercase mb-1">CertiNanas</h2>
              <p className="text-[10px] text-[#6667AB] mb-5">Plataforma de Cuidado Especializado</p>

              <p className="text-xs text-[#F5D5E0]/70 mb-2">Otorga el presente certificado a</p>
              <p className="text-2xl font-bold text-white mb-2 border-b border-[#CC8DB3] inline-block pb-1">{data.nombre}</p>
              <p className="text-[10px] text-[#6667AB] mb-4">Documento: {data.documento}</p>

              <p className="text-sm font-bold text-[#F6A5C0] mb-1">Por completar el curso</p>
              <p className="text-lg font-bold text-white mb-2">{data.titulo}</p>
              {data.descripcion && (
                <p className="text-[10px] text-[#6667AB] mb-3 max-w-md mx-auto">{data.descripcion}</p>
              )}

              <div className="text-3xl font-bold text-[#7B337E] mb-3">{data.puntaje}%</div>

              <div className="flex items-center justify-center gap-4 text-[10px] text-[#6667AB] mb-4">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {data.fecha ? new Date(data.fecha).toLocaleDateString('es-PE') : '--'}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {data.duracionMinutos} min</span>
                <span className="flex items-center gap-1"><Hash className="w-3 h-3" /> {data.codigo}</span>
              </div>

              <div className="flex items-center justify-center gap-2 text-[10px] text-[#6EE7B7] bg-[rgba(16,185,129,0.1)] rounded-full px-4 py-1.5 mx-auto w-fit">
                <CheckCircle className="w-3 h-3" /> Certificado digital válido
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-[rgba(255,255,255,0.08)] flex items-center justify-end gap-3">
          <button onClick={onClose}
            className="px-4 py-2 rounded-xl border border-[rgba(255,255,255,0.15)] text-[#6667AB] text-xs font-semibold hover:text-white transition-colors"
          >Cerrar</button>
          <button onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-[#F6A5C0] text-[#210635] text-xs font-bold hover:bg-[#F6A5C0]/80 transition-colors flex items-center gap-1.5"
          ><Download className="w-3.5 h-3.5" /> Descargar / Imprimir</button>
        </div>
      </motion.div>
    </motion.div>
  );
}
