import { getDb, closeDb } from './db.js';

const db = getDb();

const nombresFemeninos = ['María', 'Carmen', 'Ana', 'Lucía', 'Sofía', 'Valentina', 'Camila', 'Gabriela', 'Isabella', 'Rosa', 'Elena', 'Patricia', 'Teresa', 'Laura', 'Silvia'];
const nombresMasculinos = ['Carlos', 'Luis', 'Andrés', 'Jorge', 'Pedro', 'Diego', 'Miguel', 'Fernando'];
const apellidos = ['González', 'Rodríguez', 'Martínez', 'López', 'Pérez', 'García', 'Díaz', 'Torres', 'Ramírez', 'Morales', 'Vargas', 'Castro', 'Rivas', 'Ortiz', 'Medina'];
const especialidadesList = [1, 2, 3, 4, 5];
const areasList = [1, 2, 3];

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randDec(min, max, d = 2) { return +(min + Math.random() * (max - min)).toFixed(d); }
function pick(arr) { return arr[rand(0, arr.length - 1)]; }
function dateAgo(days) { const d = new Date(); d.setDate(d.getDate() - days); return d.toISOString().slice(0, 19).replace('T', ' '); }
function dateStr(days) { const d = new Date(); d.setDate(d.getDate() - days); return d.toISOString().slice(0, 10); }

// ========== 1. FAMILIAS ==========
const famCount = db.prepare('SELECT COUNT(*) AS c FROM Usuarios WHERE IdRol = 2').get().c;
for (let i = famCount; i < 15; i++) {
  const nom = i < 5 ? pick(nombresFemeninos) : pick(nombresMasculinos);
  const ape = pick(apellidos);
  const email = `familia${i + 1}@email.com`;
  if (!db.prepare('SELECT 1 FROM Usuarios WHERE Email = ?').get(email)) {
    const tel = `9${String(rand(10000000, 99999999))}`;
    const dni = String(rand(10000000, 99999999));
    db.prepare('INSERT INTO Usuarios (Email, PasswordHash, Nombres, Apellidos, NumeroDocumento, Telefono, IdRol, TerminosAceptados) VALUES (?, ?, ?, ?, ?, ?, 2, 1)').run(email, '123456', nom, ape, dni, tel);
  }
}
const familias = db.prepare('SELECT Id, Nombres, Apellidos FROM Usuarios WHERE IdRol = 2').all();

// ========== 2. CUIDADORAS ==========
const cuiCount = db.prepare('SELECT COUNT(*) AS c FROM Usuarios WHERE IdRol = 3').get().c;
for (let i = cuiCount; i < 10; i++) {
  const nom = pick(nombresFemeninos);
  const ape = pick(apellidos);
  const email = `cuidadora${i + 1}@email.com`;
  if (!db.prepare('SELECT 1 FROM Usuarios WHERE Email = ?').get(email)) {
    const tel = `9${String(rand(10000000, 99999999))}`;
    const dni = String(rand(10000000, 99999999));
    db.prepare('INSERT INTO Usuarios (Email, PasswordHash, Nombres, Apellidos, NumeroDocumento, Telefono, IdRol, TerminosAceptados) VALUES (?, ?, ?, ?, ?, ?, 3, 1)').run(email, '123456', nom, ape, dni, tel);
  }
}
const cuidadorasUsers = db.prepare('SELECT Id, Nombres, Apellidos FROM Usuarios WHERE IdRol = 3').all();

// ========== 3. PERFILES DE CUIDADORAS ==========
for (const u of cuidadorasUsers) {
  const existe = db.prepare('SELECT Id FROM Cuidadoras WHERE IdUsuario = ?').get(u.Id);
  if (!existe) {
    const tarifa = randDec(25, 60);
    const r = db.prepare(`INSERT INTO Cuidadoras (IdUsuario, AniosExperiencia, TarifaHora, DescripcionCorta, DescripcionLarga, CalificacionPromedio, TotalResenas, Disponible)
      VALUES (?, ?, ?, ?, ?, 0, 0, 1)`).run(u.Id, rand(2, 15), tarifa,
      pick(['Especialista en cuidado infantil con amplia experiencia.', 'Profesional dedicada y con vocación de servicio.', 'Amor por los niños y formación especializada.', 'Comprometida con el desarrollo infantil.']),
      pick(['Más de 10 años de experiencia en cuidado de niños con necesidades especiales. Formación en TEA y TDAH.', 'Certificaciones en primeros auxilios y educación especial. Trabajo con niños de 0 a 12 años.', 'Experiencia en terapias de estimulación temprana y acompañamiento escolar.', 'Especialista en inclusión educativa y apoyo escolar.']));
    const cId = r.lastInsertRowid;
    for (const e of [...especialidadesList].sort(() => Math.random() - 0.5).slice(0, rand(2, 3)))
      db.prepare('INSERT OR IGNORE INTO CuidadoraEspecialidades (IdCuidadora, IdEspecialidad) VALUES (?, ?)').run(cId, e);
    for (const a of [...areasList].sort(() => Math.random() - 0.5).slice(0, rand(1, 2)))
      db.prepare('INSERT OR IGNORE INTO CuidadoraAreas (IdCuidadora, IdArea) VALUES (?, ?)').run(cId, a);
    db.prepare('INSERT INTO CuidadoraFormacion (IdCuidadora, Titulo, Institucion, AnioObtencion, Orden) VALUES (?, ?, ?, ?, 1)').run(cId, pick(['Educación Especial', 'Psicología Infantil', 'Terapia Ocupacional', 'Enfermería']), pick(['Universidad Nacional', 'Instituto San Pablo', 'Universidad Católica']), rand(2010, 2023));
    db.prepare('INSERT INTO CuidadoraCertificaciones (IdCuidadora, Nombre, EntidadEmisora, FechaObtencion) VALUES (?, ?, ?, ?)').run(cId, pick(['Curso de TEA Avanzado', 'RCP y Primeros Auxilios', 'Estimulación Temprana', 'Inclusión Educativa']), pick(['MINSA', 'Cruz Roja', 'Instituto Peruano']), dateStr(rand(30, 365)));
  }
}
const cuidadoras = db.prepare('SELECT c.Id, c.IdUsuario, c.AniosExperiencia, c.TarifaHora, u.Nombres, u.Apellidos FROM Cuidadoras c INNER JOIN Usuarios u ON u.Id = c.IdUsuario').all();

// ========== 4. FAVORITOS ==========
if (db.prepare('SELECT COUNT(*) AS c FROM Favoritos').get().c < 5) {
  for (const f of familias) {
    for (const c of [...cuidadoras].sort(() => Math.random() - 0.5).slice(0, rand(1, 3)))
      db.prepare('INSERT OR IGNORE INTO Favoritos (IdUsuarioFamilia, IdCuidadora) VALUES (?, ?)').run(f.Id, c.Id);
  }
}

// ========== 5. CASOS DE ÉXITO (historias donde la familia contrató y quedó contenta) ==========
const exitoIds = db.prepare("SELECT Id FROM Ordenes WHERE Estado = 'Completada'").all().map(r => r.Id);
if (exitoIds.length < 8) {
  const exitosHeader = [
    { titulo: 'María encontró a la cuidadora perfecta para su hijo con TEA', desc: 'Después de meses de búsqueda, María contactó con una especialista en TEA a través de CERTINANAS. Hoy su hijo asiste a terapias 3 veces por semana y ha mostrado avances notables en comunicación.' },
    { titulo: 'Familia García: "Volvimos a tener tiempo para nosotros"', desc: 'Con el acompañamiento escolar de CERTINANAS, los padres de Mateo pudieron retomar sus actividades laborales con la tranquilidad de que su hijo estaba en buenas manos.' },
    { titulo: 'Carmen: de cuidadora a parte de la familia', desc: 'Lo que empezó como un servicio temporal de 2 semanas se convirtió en una relación de confianza que ya lleva 8 meses. "Tratan a mi hija como si fuera suya", dice la mamá.' },
    { titulo: 'Terapia de estimulación temprana con resultados visibles', desc: 'A los 6 meses de terapias constantes, la pequeña Sofía logró hitos de desarrollo que los médicos no esperaban. Su terapeuta, asignada por CERTINANAS, fue clave en este proceso.' },
    { titulo: 'Apoyo escolar que transformó la experiencia educativa', desc: 'Diego, diagnosticado con TDAH, pasó de tener problemas de conducta a ser un estudiante destacado gracias al acompañamiento personalizado de su cuidadora especializada.' },
    { titulo: 'Atención domiciliaria que cambió la dinámica familiar', desc: 'Los abuelos de Valentina pudieron descansar sabiendo que ella estaba siendo cuidada por una profesional certificada. "Recuperamos la paz en casa".' },
  ];
  // Insert as Notificaciones with a special type or as a separate table
  // Actually, let's create a CasosExito table
  db.exec(`CREATE TABLE IF NOT EXISTS CasosExito (Id INTEGER PRIMARY KEY AUTOINCREMENT, Titulo TEXT NOT NULL, Descripcion TEXT NOT NULL, IdFamilia INTEGER, IdCuidadora INTEGER, FechaCreacion TEXT NOT NULL DEFAULT (datetime('now')))`);
  for (const h of exitosHeader) {
    const f = pick(familias);
    const c = pick(cuidadoras);
    db.prepare('INSERT INTO CasosExito (Titulo, Descripcion, IdFamilia, IdCuidadora) VALUES (?, ?, ?, ?)').run(h.titulo, h.desc, f.Id, c.Id);
  }
}

// ========== 6. CASOS QUE NO LLEGARON A ACUERDO ==========
const noAcuerdoIds = db.prepare("SELECT Id FROM Ordenes WHERE Estado = 'Cancelada'").all().map(r => r.Id);
if (noAcuerdoIds.length < 5) {
  const noAcuerdo = [
    { titulo: 'Disponibilidad horaria incompatible', desc: 'La familia necesitaba cobertura los fines de semana y la cuidadora solo estaba disponible entre semana. No se llegó a un acuerdo pese a varias reuniones.' },
    { titulo: 'Distancia geográfica', desc: 'La cuidadora vivía muy lejos del domicilio familiar y el tiempo de desplazamiento hacía inviable el servicio diario.' },
    { titulo: 'Metodología de trabajo diferente', desc: 'La familia prefería un enfoque más estructurado en las terapias, mientras que la cuidadora promovía un método más libre y basado en el juego.' },
    { titulo: 'Presupuesto no disponible', desc: 'Aunque ambas partes mostraron interés, el costo del servicio superaba el presupuesto mensual que la familia podía destinar al cuidado.' },
    { titulo: 'Cambio de ciudad de la cuidadora', desc: 'Justo cuando estaban por cerrar el acuerdo, la cuidadora recibió una oferta laboral en otra ciudad y tuvo que cancelar el compromiso.' },
    { titulo: 'Requisitos adicionales no previstos', desc: 'La familia solicitaba disponibilidad para cuidar a dos niños con necesidades distintas, y la cuidadora solo tenía experiencia con un perfil específico.' },
  ];
  db.exec(`CREATE TABLE IF NOT EXISTS CasosNoAcuerdo (Id INTEGER PRIMARY KEY AUTOINCREMENT, Titulo TEXT NOT NULL, Descripcion TEXT NOT NULL, IdFamilia INTEGER, IdCuidadora INTEGER, FechaCreacion TEXT NOT NULL DEFAULT (datetime('now')))`);
  for (const h of noAcuerdo) {
    const f = pick(familias);
    const c = pick(cuidadoras);
    db.prepare('INSERT INTO CasosNoAcuerdo (Titulo, Descripcion, IdFamilia, IdCuidadora) VALUES (?, ?, ?, ?)').run(h.titulo, h.desc, f.Id, c.Id);
  }
}

// ========== 7. RESEÑAS ==========
if (db.prepare('SELECT COUNT(*) AS c FROM Resenas').get().c < 10) {
  const buenas = ['Excelente atención, muy profesional y dedicada.', 'Mi hijo la adora, súper recomendada.', 'Muy puntual y responsable.', 'Gran apoyo para nuestra familia.', 'Paciente y cariñosa con mi pequeño.', 'La recomiendo ampliamente.', 'Profesional excepcional, volveríamos a contratarla.'];
  const malas = ['Llegaba tarde con frecuencia.', 'No cumplió con el perfil que esperábamos.', 'Poca comunicación con la familia.', 'Faltó varios días sin avisar.'];
  for (let i = 0; i < 25; i++) {
    const c = pick(cuidadoras);
    const f = pick(familias.filter(ff => ff.Id !== c.IdUsuario));
    const esBuena = Math.random() > 0.2;
    db.prepare('INSERT INTO Resenas (IdCuidadora, IdUsuarioFamilia, Calificacion, Comentario, FechaResena, FechaCreacion) VALUES (?, ?, ?, ?, ?, ?)').run(
      c.Id, f.Id, esBuena ? rand(4, 5) : rand(1, 2), pick(esBuena ? buenas : malas), dateStr(rand(1, 60)), dateAgo(rand(1, 60)));
  }
  for (const c of cuidadoras) {
    const avg = db.prepare('SELECT AVG(Calificacion) AS prom, COUNT(*) AS tot FROM Resenas WHERE IdCuidadora = ?').get(c.Id);
    if (avg.prom) db.prepare('UPDATE Cuidadoras SET CalificacionPromedio = ?, TotalResenas = ? WHERE Id = ?').run(+avg.prom.toFixed(1), avg.tot, c.Id);
  }
}

// ========== 8. CITAS ==========
if (db.prepare('SELECT COUNT(*) AS c FROM Citas').get().c < 10) {
  const estCompletadas = ['Confirmada', 'Completada'];
  const estCanceladas = ['Cancelada'];
  for (let i = 0; i < 40; i++) {
    const c = pick(cuidadoras);
    const f = pick(familias.filter(ff => ff.Id !== c.IdUsuario));
    const daysAgo = rand(1, 60);
    const esExito = i < 25;
    const estado = esExito ? pick(estCompletadas) : pick(estCanceladas);
    db.prepare('INSERT INTO Citas (IdCuidadora, IdUsuarioFamilia, FechaCita, HoraCita, DuracionMinutos, Modalidad, Estado, FechaCreacion) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(
      c.Id, f.Id, dateStr(daysAgo), `${String(rand(8, 18)).padStart(2, '0')}:00:00`, rand(30, 180),
      pick(['Virtual', 'Presencial']), estado, dateAgo(daysAgo));
  }
}

// ========== 9. CONVERSACIONES Y MENSAJES ==========
if (db.prepare('SELECT COUNT(*) AS c FROM Conversaciones').get().c < 5) {
  for (let i = 0; i < 20; i++) {
    const c = pick(cuidadoras);
    const f = pick(familias.filter(ff => ff.Id !== c.IdUsuario));
    const fec = dateAgo(rand(1, 60));
    let convId = db.prepare('SELECT Id FROM Conversaciones WHERE IdCuidadora = ? AND IdUsuarioFamilia = ?').get(c.Id, f.Id)?.Id;
    if (!convId) {
      convId = db.prepare('INSERT INTO Conversaciones (IdCuidadora, IdUsuarioFamilia, FechaCreacion, FechaUltimoMensaje) VALUES (?, ?, ?, ?)').run(c.Id, f.Id, fec, fec).lastInsertRowid;
    }
    for (let m = 0; m < rand(2, 6); m++) {
      const rem = m % 2 === 0 ? f.Id : c.IdUsuario;
      db.prepare('INSERT INTO Mensajes (IdConversacion, IdRemitente, Contenido, Leido, FechaEnvio) VALUES (?, ?, ?, ?, ?)').run(convId, rem,
        pick(['Hola, ¿qué tal?', 'Me interesa su perfil.', '¿Tiene disponibilidad para esta semana?', 'Sí, claro. ¿Qué día le parece?', 'El jueves a las 3pm.', 'Perfecto, lo agendo.', 'Muchas gracias.', 'De nada, hasta pronto.', '¿Podemos reunirnos antes?', 'Claro, mañana a las 10am está bien.', 'Gracias por la atención.', 'Quedamos en contacto.']),
        rand(0, 1), dateAgo(rand(1, 60)));
    }
  }
}

// ========== 10. ÓRDENES Y PAGOS ==========
if (db.prepare('SELECT COUNT(*) AS c FROM Ordenes').get().c < 5) {
  for (let i = 0; i < 20; i++) {
    const c = pick(cuidadoras);
    const f = pick(familias.filter(ff => ff.Id !== c.IdUsuario));
    const tarifa = c.TarifaHora;
    const horas = randDec(2, 8, 1);
    const subtotal = +(tarifa * horas).toFixed(2);
    const plataforma = +(subtotal * 0.15).toFixed(2);
    const total = +(subtotal + plataforma).toFixed(2);
    const esExito = i < 14;
    const estado = esExito ? pick(['Completada', 'Pagada']) : 'Cancelada';
    const daysAgo = rand(1, 60);
    const r = db.prepare(`INSERT INTO Ordenes (IdCuidadora, IdUsuarioFamilia, TipoServicio, FechaServicio, TotalHoras, TarifaHora, Subtotal, TarifaPlataforma, Total, Estado, FechaCreacion)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(c.Id, f.Id,
      pick(['Cuidado domiciliario', 'Acompañamiento escolar', 'Terapia de estimulación']), dateStr(daysAgo),
      horas, tarifa, subtotal, plataforma, total, estado, dateAgo(daysAgo));
    if (esExito) {
      db.prepare('INSERT INTO Pagos (IdOrden, Monto, MetodoPago, Estado, FechaPago) VALUES (?, ?, ?, ?, ?)').run(r.lastInsertRowid, total, pick(['Tarjeta', 'Yape', 'Transferencia']), 'Completado', dateAgo(daysAgo - rand(0, 2)));
    }
  }
}

// ========== 11. NOTIFICACIONES ==========
if (db.prepare('SELECT COUNT(*) AS c FROM Notificaciones').get().c < 5) {
  for (const u of [...familias, ...cuidadoras.map(c => ({ Id: c.IdUsuario }))]) {
    if (!u.Id) continue;
    for (let i = 0; i < rand(2, 5); i++) {
      db.prepare('INSERT INTO Notificaciones (IdUsuarioDestino, Titulo, Descripcion, Tipo, Leido, FechaCreacion) VALUES (?, ?, ?, ?, ?, ?)').run(u.Id,
        pick(['Recordatorio de cita mañana', 'Nuevo mensaje recibido', 'Pago confirmado', 'Reseña recibida', 'Cuidadora favorita disponible']),
        pick(['Tienes una cita programada para mañana a las 3pm.', 'Has recibido un nuevo mensaje en tu bandeja.', 'Tu pago ha sido confirmado exitosamente.', 'Una familia te ha dejado una reseña.', 'Una de tus cuidadoras favoritas tiene disponibilidad.']),
        pick(['recordatorio', 'mensaje', 'pago', 'reseña', 'disponibilidad']), rand(0, 1), dateAgo(rand(1, 60)));
    }
  }
}

console.log('✅ Datos de prueba generados:');
console.log(`   ${db.prepare('SELECT COUNT(*) AS c FROM Usuarios').get().c} usuarios`);
console.log(`   ${db.prepare('SELECT COUNT(*) AS c FROM Cuidadoras').get().c} cuidadoras`);
console.log(`   ${db.prepare('SELECT COUNT(*) AS c FROM CuidadoraEspecialidades').get().c} especialidades asignadas`);
console.log(`   ${db.prepare('SELECT COUNT(*) AS c FROM CuidadoraAreas').get().c} áreas asignadas`);
console.log(`   ${db.prepare('SELECT COUNT(*) AS c FROM CuidadoraFormacion').get().c} formaciones`);
console.log(`   ${db.prepare('SELECT COUNT(*) AS c FROM CuidadoraCertificaciones').get().c} certificaciones`);
console.log(`   ${db.prepare('SELECT COUNT(*) AS c FROM Resenas').get().c} reseñas`);
console.log(`   ${db.prepare('SELECT COUNT(*) AS c FROM Favoritos').get().c} favoritos`);
console.log(`   ${db.prepare('SELECT COUNT(*) AS c FROM Citas').get().c} citas`);
console.log(`   ${db.prepare('SELECT COUNT(*) AS c FROM Conversaciones').get().c} conversaciones`);
console.log(`   ${db.prepare('SELECT COUNT(*) AS c FROM Mensajes').get().c} mensajes`);
console.log(`   ${db.prepare('SELECT COUNT(*) AS c FROM Ordenes').get().c} órdenes`);
console.log(`   ${db.prepare('SELECT COUNT(*) AS c FROM Pagos').get().c} pagos`);
console.log(`   ${db.prepare('SELECT COUNT(*) AS c FROM Notificaciones').get().c} notificaciones`);
console.log(`   ${db.prepare('SELECT COUNT(*) AS c FROM CasosExito').get().c} casos de éxito`);
console.log(`   ${db.prepare('SELECT COUNT(*) AS c FROM CasosNoAcuerdo').get().c} casos sin acuerdo`);

closeDb();
