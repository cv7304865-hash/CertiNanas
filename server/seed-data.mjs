import { getDb, closeDb } from './db.js';

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

export function seed(db) {
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
      const r = db.prepare(`INSERT INTO Cuidadoras (IdUsuario, AniosExperiencia, TarifaHora, DescripcionCorta, DescripcionLarga, CalificacionPromedio, TotalResenas, Disponible, Zona)
        VALUES (?, ?, ?, ?, ?, 0, 0, 1, ?)`).run(u.Id, rand(2, 15), tarifa,
        pick(['Especialista en cuidado infantil con amplia experiencia.', 'Profesional dedicada y con vocación de servicio.', 'Amor por los niños y formación especializada.']),
        pick(['Más de 10 años de experiencia en cuidado de niños con necesidades especiales.', 'Certificaciones en primeros auxilios y educación especial.', 'Experiencia en terapias de estimulación temprana.']),
        pick(['Trujillo Centro', 'Víctor Larco', 'La Esperanza', 'Moche', 'Buenos Aires']));
      const cId = r.lastInsertRowid;
      for (const e of [...especialidadesList].sort(() => Math.random() - 0.5).slice(0, rand(2, 3)))
        db.prepare('INSERT OR IGNORE INTO CuidadoraEspecialidades (IdCuidadora, IdEspecialidad) VALUES (?, ?)').run(cId, e);
      for (const a of [...areasList].sort(() => Math.random() - 0.5).slice(0, rand(1, 2)))
        db.prepare('INSERT OR IGNORE INTO CuidadoraAreas (IdCuidadora, IdArea) VALUES (?, ?)').run(cId, a);
      db.prepare('INSERT INTO CuidadoraFormacion (IdCuidadora, Titulo, Institucion, AnioObtencion, Orden) VALUES (?, ?, ?, ?, 1)').run(cId, pick(['Educación Especial', 'Psicología Infantil', 'Terapia Ocupacional']), pick(['Universidad Nacional', 'Instituto San Pablo']), rand(2010, 2023));
      db.prepare('INSERT INTO CuidadoraCertificaciones (IdCuidadora, Nombre, EntidadEmisora, FechaObtencion) VALUES (?, ?, ?, ?)').run(cId, pick(['Curso de TEA Avanzado', 'RCP y Primeros Auxilios', 'Estimulación Temprana']), pick(['MINSA', 'Cruz Roja']), dateStr(rand(30, 365)));
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

  // ========== 5. RESEÑAS ==========
  if (db.prepare('SELECT COUNT(*) AS c FROM Resenas').get().c < 10) {
    const buenas = ['Excelente atención, muy profesional y dedicada.', 'Mi hijo la adora, súper recomendada.', 'Muy puntual y responsable.', 'Gran apoyo para nuestra familia.'];
    const malas = ['Llegaba tarde con frecuencia.', 'No cumplió con el perfil que esperábamos.'];
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

  // ========== 6. CITAS ==========
  if (db.prepare('SELECT COUNT(*) AS c FROM Citas').get().c < 10) {
    for (let i = 0; i < 30; i++) {
      const c = pick(cuidadoras);
      const f = pick(familias.filter(ff => ff.Id !== c.IdUsuario));
      const daysAgo = rand(1, 60);
      db.prepare('INSERT INTO Citas (IdCuidadora, IdUsuarioFamilia, FechaCita, HoraCita, DuracionMinutos, Modalidad, Estado, FechaCreacion) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(
        c.Id, f.Id, dateStr(daysAgo), `${String(rand(8, 18)).padStart(2, '0')}:00:00`, rand(30, 180),
        pick(['Virtual', 'Presencial']), i < 20 ? 'Completada' : 'Cancelada', dateAgo(daysAgo));
    }
  }

  // ========== 7. CONVERSACIONES Y MENSAJES ==========
  if (db.prepare('SELECT COUNT(*) AS c FROM Conversaciones').get().c < 5) {
    for (let i = 0; i < 15; i++) {
      const c = pick(cuidadoras);
      const f = pick(familias.filter(ff => ff.Id !== c.IdUsuario));
      const fec = dateAgo(rand(1, 60));
      let convId = db.prepare('SELECT Id FROM Conversaciones WHERE IdCuidadora = ? AND IdUsuarioFamilia = ?').get(c.Id, f.Id)?.Id;
      if (!convId) {
        convId = db.prepare('INSERT INTO Conversaciones (IdCuidadora, IdUsuarioFamilia, FechaCreacion, FechaUltimoMensaje) VALUES (?, ?, ?, ?)').run(c.Id, f.Id, fec, fec).lastInsertRowid;
      }
      for (let m = 0; m < rand(2, 4); m++) {
        const rem = m % 2 === 0 ? f.Id : c.IdUsuario;
        db.prepare('INSERT INTO Mensajes (IdConversacion, IdRemitente, Contenido, Leido, FechaEnvio) VALUES (?, ?, ?, ?, ?)').run(convId, rem,
          pick(['Hola, ¿qué tal?', 'Me interesa su perfil.', '¿Tiene disponibilidad para esta semana?', 'Sí, claro.', 'Perfecto, lo agendo.', 'Muchas gracias.']),
          rand(0, 1), dateAgo(rand(1, 60)));
      }
    }
  }

  // ========== 8. ÓRDENES Y PAGOS ==========
  if (db.prepare('SELECT COUNT(*) AS c FROM Ordenes').get().c < 5) {
    for (let i = 0; i < 15; i++) {
      const c = pick(cuidadoras);
      const f = pick(familias.filter(ff => ff.Id !== c.IdUsuario));
      const tarifa = c.TarifaHora;
      const horas = randDec(2, 8, 1);
      const subtotal = +(tarifa * horas).toFixed(2);
      const plataforma = +(subtotal * 0.15).toFixed(2);
      const total = +(subtotal + plataforma).toFixed(2);
      const esExito = i < 10;
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

  // ========== 9. NOTIFICACIONES ==========
  if (db.prepare('SELECT COUNT(*) AS c FROM Notificaciones').get().c < 5) {
    for (const u of [...familias, ...cuidadoras.map(c => ({ Id: c.IdUsuario }))]) {
      if (!u.Id) continue;
      for (let i = 0; i < rand(2, 4); i++) {
        db.prepare('INSERT INTO Notificaciones (IdUsuarioDestino, Titulo, Descripcion, Tipo, Leido, FechaCreacion) VALUES (?, ?, ?, ?, ?, ?)').run(u.Id,
          pick(['Recordatorio de cita', 'Nuevo mensaje', 'Pago confirmado', 'Reseña recibida']),
          pick(['Tienes una cita programada para mañana.', 'Has recibido un nuevo mensaje.', 'Tu pago ha sido confirmado.']),
          pick(['recordatorio', 'mensaje', 'pago']), rand(0, 1), dateAgo(rand(1, 60)));
      }
    }
  }

  // ========== 10. POSTULACIONES ==========
  if (db.prepare('SELECT COUNT(*) AS c FROM Postulaciones').get().c === 0) {
    const cuidadorasUsers = db.prepare('SELECT Id, Nombres, Apellidos FROM Usuarios WHERE IdRol = 3').all();
    const tiposDoc = [['DNI', '120 KB'], ['Antecedentes PNP', '340 KB'], ['Certificado Salud', '210 KB'], ['Certificado Estudios', '180 KB'], ['Carta Presentacion', '95 KB']];
    const estadosPos = ['Pendiente', 'Pendiente', 'Pendiente', 'Aprobada'];
    let j = 0;
    for (const u of cuidadorasUsers.slice(0, 6)) {
      const estado = estadosPos[j % estadosPos.length];
      const diasAgo = rand(1, 45);
      const r = db.prepare(`INSERT INTO Postulaciones (IdUsuario, Estado, FechaPostulacion) VALUES (?, ?, datetime('now', '-${diasAgo} days'))`).run(u.Id, estado);
      const docs = [...tiposDoc].sort(() => Math.random() - 0.5).slice(0, rand(2, 4));
      for (const [tipo, peso] of docs) {
        db.prepare('INSERT INTO DocumentosPostulacion (IdPostulacion, TipoRequisito, NombreArchivo, Peso) VALUES (?, ?, ?, ?)').run(r.lastInsertRowid, tipo, `${tipo.toLowerCase().replace(/\s/g, '_')}_${u.Nombres.toLowerCase()}_${u.Apellidos.toLowerCase()}.pdf`, peso);
      }
      j++;
    }
  }

  console.log('✅ Datos demo generados:');
  console.log(`   ${db.prepare('SELECT COUNT(*) AS c FROM Usuarios').get().c} usuarios`);
  console.log(`   ${db.prepare('SELECT COUNT(*) AS c FROM Cuidadoras').get().c} cuidadoras`);
  console.log(`   ${db.prepare('SELECT COUNT(*) AS c FROM Resenas').get().c} reseñas`);
  console.log(`   ${db.prepare('SELECT COUNT(*) AS c FROM Citas').get().c} citas`);
  console.log(`   ${db.prepare('SELECT COUNT(*) AS c FROM Ordenes').get().c} órdenes`);
  console.log(`   ${db.prepare('SELECT COUNT(*) AS c FROM Pagos').get().c} pagos`);
}

// Ejecutar directamente si es llamado como script
if (process.argv[1] && (process.argv[1].endsWith('seed-data.mjs') || process.argv[1].endsWith('seed-data'))) {
  const db = getDb();
  seed(db);
  closeDb();
}
