import { FileSignature, Shield, CheckCircle, XCircle, Clock, User, Baby, DollarSign, Calendar, MessageSquare, ThumbsUp, ThumbsDown } from 'lucide-react';

type TareaItem = { Id: number; Descripcion: string; Decision: string; Categoria?: string; EsPersonalizada?: boolean };

type NegociacionItem = {
  Id: number; IdOrden: number; IdPropuestoPor: number;
  TarifaHora?: number; TotalHoras?: number; HoraInicio?: string; HoraFin?: string;
  Mensaje?: string; Estado?: string; FechaCreacion?: string;
  PropuestoPorNombres?: string; PropuestoPorApellidos?: string;
};

type ContractFormatProps = {
  codigo: string;
  fechaEmision: string;
  familiaNombre: string;
  cuidadoraNombre: string;
  menorNombre: string;
  menorDiagnostico: string;
  fechaServicio: string;
  horaInicio: string;
  horaFin: string;
  duracionHoras: number;
  tarifaHora: number;
  montoTotal: number;
  subtotal: number;
  comision: number;
  tareas: TareaItem[];
  estado: string;
  firmadoFamilia?: boolean;
  firmadoCuidadora?: boolean;
  negociaciones?: NegociacionItem[];
};

export function ContractFormat(props: ContractFormatProps) {
  const aceptadas = props.tareas.filter(t => t.Decision === 'Aceptar');
  const negociadas = props.tareas.filter(t => t.Decision === 'Negociar');
  const rechazadas = props.tareas.filter(t => t.Decision === 'Rechazar');
  const pendientes = props.tareas.filter(t => !t.Decision || t.Decision === 'Pendiente');

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 max-w-[210mm] mx-auto">
      <div className="bg-[#210635] px-8 py-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <img src="/logo.png" alt="" className="w-8 h-8 object-contain" />
          <span className="text-xl font-extrabold text-[#F6A5C0] tracking-tight">CERTINANAS</span>
        </div>
        <p className="text-[#6667AB] text-xs">Cuidado Infantil Especializado</p>
      </div>

      <div className="p-8 space-y-6 text-gray-800">
        {/* Header */}
        <div className="text-center border-b border-gray-200 pb-4">
          <h1 className="text-lg font-bold text-[#210635] uppercase tracking-wide">CONTRATO PRESTACIÓN DE SERVICIOS DE CUIDADO ESPECIALIZADO</h1>
        </div>

        <div className="flex justify-between text-xs text-gray-500">
          <p><strong className="text-gray-700">CONTRATO N°:</strong> {props.codigo}</p>
          <p><strong className="text-gray-700">EMISIÓN:</strong> {props.fechaEmision}</p>
        </div>

        {/* 1. PARTES CONTRATANTES */}
        <section>
          <h2 className="text-sm font-bold text-[#210635] border-b border-gray-200 pb-1 mb-3">1. PARTES CONTRATANTES</h2>
          <div className="space-y-1 text-xs text-gray-600">
            <p><strong className="text-gray-700">EL MEDIADOR:</strong> CERTINANAS S.A.C., con RUC peruano vigente, en adelante <strong>LA PLATAFORMA</strong>.</p>
            <p><strong className="text-gray-700">EL CLIENTE (LA FAMILIA):</strong> Sr(a). {props.familiaNombre}.</p>
            <p><strong className="text-gray-700">LA CUIDADORA:</strong> Srta/Sra. {props.cuidadoraNombre} (Validación Conforme).</p>
          </div>
        </section>

        {/* 2. OBJETO Y DETALLE DEL MENOR */}
        <section>
          <h2 className="text-sm font-bold text-[#210635] border-b border-gray-200 pb-1 mb-3">2. OBJETO DEL CONTRATO Y DETALLE DEL MENOR</h2>
          <div className="text-xs text-gray-600">
            <p>LA CUIDADORA se obliga a prestar asistencia integral y especializada al menor dependiente:</p>
            <div className="bg-gray-50 rounded-lg p-3 mt-2 flex items-center gap-2">
              <Baby className="w-4 h-4 text-[#7B337E]" />
              <span><strong>Beneficiario:</strong> {props.menorNombre} — <strong>Diagnóstico Clínico Principal:</strong> {props.menorDiagnostico}</span>
            </div>
          </div>
        </section>

        {/* 3. MATRIZ OPERACIONAL DE TAREAS */}
        <section>
          <h2 className="text-sm font-bold text-[#210635] border-b border-gray-200 pb-1 mb-3">3. MATRIZ OPERACIONAL DE TAREAS Y ALCANCE PACTADO</h2>
          <div className="space-y-3 text-xs">
            <div>
              <p className="font-bold text-emerald-700 mb-1">A. TAREAS ACEPTADAS DIRECTAMENTE:</p>
              {aceptadas.length > 0 ? (
                <ul className="space-y-1 ml-4">
                  {aceptadas.map(t => (
                    <li key={t.Id} className="flex items-start gap-2 text-gray-600">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                      {t.Descripcion}
                      {t.EsPersonalizada && <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 ml-1">Personalizada</span>}
                    </li>
                  ))}
                </ul>
              ) : <p className="text-gray-400 italic ml-4">Ninguna</p>}
            </div>
            <div>
              <p className="font-bold text-amber-700 mb-1">B. TAREAS MODIFICADAS / ACORDADAS EN NEGOCIACIÓN:</p>
              {negociadas.length > 0 ? (
                <ul className="space-y-1 ml-4">
                  {negociadas.map(t => (
                    <li key={t.Id} className="flex items-start gap-2 text-gray-600">
                      <Clock className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                      {t.Descripcion}
                    </li>
                  ))}
                </ul>
              ) : <p className="text-gray-400 italic ml-4">Ninguna</p>}
            </div>
            <div>
              <p className="font-bold text-red-700 mb-1">C. TAREAS EXCLUIDAS EXPRESAMENTE (PROHIBICIÓN DE EJECUCIÓN):</p>
              {rechazadas.length > 0 ? (
                <ul className="space-y-1 ml-4">
                  {rechazadas.map(t => (
                    <li key={t.Id} className="flex items-start gap-2 text-gray-600">
                      <XCircle className="w-3.5 h-3.5 text-red-400 mt-0.5 shrink-0" />
                      {t.Descripcion}
                    </li>
                  ))}
                </ul>
              ) : <p className="text-gray-400 italic ml-4">Ninguna</p>}
            </div>
            {pendientes.length > 0 && (
              <div>
                <p className="font-bold text-gray-700 mb-1">D. TAREAS PENDIENTES DE DECISIÓN:</p>
                <ul className="space-y-1 ml-4">
                  {pendientes.map(t => (
                    <li key={t.Id} className="flex items-start gap-2 text-gray-600">
                      <Clock className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                      {t.Descripcion}
                      {t.EsPersonalizada && <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 ml-1">Personalizada</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>

        {/* 4. HISTORIAL DE NEGOCIACIÓN */}
        {props.negociaciones && props.negociaciones.length > 0 && (
          <section>
            <h2 className="text-sm font-bold text-[#210635] border-b border-gray-200 pb-1 mb-3">4. HISTORIAL DE NEGOCIACIÓN Y RESOLUCIÓN</h2>
            <div className="space-y-3 text-xs">
              {props.negociaciones.map((n, i) => (
                <div key={n.Id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-3.5 h-3.5 text-[#7B337E]" />
                      <span className="font-bold text-gray-700">
                        {n.PropuestoPorNombres} {n.PropuestoPorApellidos}
                      </span>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      n.Estado === 'aceptada' ? 'bg-emerald-100 text-emerald-700' :
                      n.Estado === 'rechazada' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {n.Estado === 'aceptada' ? <ThumbsUp className="w-3 h-3" /> :
                       n.Estado === 'rechazada' ? <ThumbsDown className="w-3 h-3" /> :
                       <Clock className="w-3 h-3" />}
                      {n.Estado === 'aceptada' ? 'Aceptada' :
                       n.Estado === 'rechazada' ? 'Rechazada' : 'Pendiente'}
                    </span>
                  </div>
                  {n.Mensaje && (
                    <p className="text-gray-600 ml-5 mb-2 italic">"{n.Mensaje}"</p>
                  )}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 ml-5 text-gray-500">
                    {n.TarifaHora != null && <span>Tarifa propuesta: <strong className="text-gray-700">S/ {n.TarifaHora}/h</strong></span>}
                    {n.TotalHoras != null && <span>Horas propuestas: <strong className="text-gray-700">{n.TotalHoras}h</strong></span>}
                    {n.HoraInicio && <span>Inicio propuesto: <strong className="text-gray-700">{n.HoraInicio}</strong></span>}
                    {n.HoraFin && <span>Fin propuesto: <strong className="text-gray-700">{n.HoraFin}</strong></span>}
                  </div>
                </div>
              ))}
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2 text-emerald-800 text-center">
                <strong>Resolución:</strong> {props.firmadoFamilia && props.firmadoCuidadora ? 'Acuerdo mutuo alcanzado' : props.firmadoFamilia ? 'Aceptado por la familia, pendiente de la cuidadora' : props.firmadoCuidadora ? 'Aceptado por la cuidadora, pendiente de la familia' : 'En proceso de negociación'}
              </div>
            </div>
          </section>
        )}

        {/* 5. TERMINOS ECONOMICOS */}
        <section>
          <h2 className="text-sm font-bold text-[#210635] border-b border-gray-200 pb-1 mb-3">5. TÉRMINOS ECONÓMICOS Y CUSTODIA EN ESCROW</h2>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#7B337E]" />
              <span><strong>Jornada:</strong> De {props.horaInicio} a {props.horaFin} (Duración Total: {props.duracionHoras} horas cronometradas)</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[#7B337E]" />
              <span><strong>Monto Bruto Retenido:</strong> S/ {props.montoTotal.toFixed(2)} Soles.</span>
            </div>
            <p className="text-gray-500 italic ml-6">Los fondos se encuentran congelados en el módulo seguro de Gastos en Custodia (Escrow).</p>
            <div className="border-t border-gray-200 pt-2 flex justify-between text-gray-500">
              <span>Comisión CERTINANAS: S/ {props.comision.toFixed(2)}</span>
              <span>Pago a cuidadora: S/ {props.subtotal.toFixed(2)}</span>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-red-700 text-[10px]">
              <strong>Cláusula Penal:</strong> Si se registra y demuestra un incumplimiento total o parcial de las tareas estipuladas en la sección 3.A y 3.B mediante el botón de "Reportar Incidencia", LA PLATAFORMA anulará el pago a la cuidadora y procesará la devolución (Refund) al CLIENTE.
            </div>
          </div>
        </section>

        {/* 5. FIRMAS */}
        <section>
          <h2 className="text-sm font-bold text-[#210635] border-b border-gray-200 pb-1 mb-3">6. FIRMAS DIGITALES</h2>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className={`border rounded-lg p-3 ${props.firmadoFamilia ? 'border-emerald-300 bg-emerald-50' : 'border-gray-200 bg-gray-50'}`}>
              <div className="flex items-center gap-2 mb-1">
                <User className="w-4 h-4 text-gray-500" />
                <strong className="text-gray-700">LA FAMILIA</strong>
              </div>
              <p className="text-gray-500">{props.familiaNombre}</p>
              {props.firmadoFamilia ? (
                <div className="flex items-center gap-1 mt-2 text-emerald-600">
                  <CheckCircle className="w-3 h-3" /> Firmado digitalmente
                </div>
              ) : (
                <div className="flex items-center gap-1 mt-2 text-amber-600">
                  <Clock className="w-3 h-3" /> Pendiente de firma
                </div>
              )}
            </div>
            <div className={`border rounded-lg p-3 ${props.firmadoCuidadora ? 'border-emerald-300 bg-emerald-50' : 'border-gray-200 bg-gray-50'}`}>
              <div className="flex items-center gap-2 mb-1">
                <User className="w-4 h-4 text-gray-500" />
                <strong className="text-gray-700">LA CUIDADORA</strong>
              </div>
              <p className="text-gray-500">{props.cuidadoraNombre}</p>
              {props.firmadoCuidadora ? (
                <div className="flex items-center gap-1 mt-2 text-emerald-600">
                  <CheckCircle className="w-3 h-3" /> Firmado digitalmente
                </div>
              ) : (
                <div className="flex items-center gap-1 mt-2 text-amber-600">
                  <Clock className="w-3 h-3" /> Pendiente de firma
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="border-t border-gray-200 pt-4 text-center">
          <div className="flex items-center justify-center gap-1 text-[10px] text-gray-400">
            <Shield className="w-3 h-3" />
            Firmado digitalmente mediante tokens OTP / Trazo Biométrico por las partes interesadas
          </div>
          <p className="text-[10px] text-gray-400 mt-1">CERTINANAS S.A.C. — RUC peruano vigente</p>
        </div>
      </div>
    </div>
  );
}
