import { getDb, closeDb } from './db.js';

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randDec(min, max, d = 2) { return +(min + Math.random() * (max - min)).toFixed(d); }
function pick(arr) { return arr[rand(0, arr.length - 1)]; }
function dateStr(daysAgo) { const d = new Date(); d.setDate(d.getDate() - daysAgo); return d.toISOString().slice(0, 10); }
function dateTimeStr(daysAgo) { const d = new Date(); d.setDate(d.getDate() - daysAgo); return d.toISOString().slice(0, 19).replace('T', ' '); }
function randomDays() {
  const w = Math.random();
  if (w < 0.15) return rand(1, 30);
  if (w < 0.40) return rand(31, 120);
  if (w < 0.65) return rand(121, 210);
  if (w < 0.85) return rand(211, 300);
  return rand(301, 364);
}

const familiasData = [
  { nombres: 'Familia Demo',  apellidos: 'Test',                 email: 'familia@test.com' },
  { nombres: 'Maria Elena',   apellidos: 'Gonzalez Torres',      email: 'mariagonzalez79@gmail.com' },
  { nombres: 'Carlos Alberto',apellidos: 'Lopez Ramirez',       email: 'carlos.lopez@outlook.com' },
  { nombres: 'Ana Lucia',     apellidos: 'Martinez Rios',        email: 'anamlr@yahoo.com' },
  { nombres: 'Jose Antonio',  apellidos: 'Diaz Vargas',          email: 'jose.diazv@icloud.com' },
  { nombres: 'Claudia Sofia', apellidos: 'Morales Castillo',     email: 'clausofia.mc@gmail.com' },
  { nombres: 'Pedro Pablo',   apellidos: 'Torres Mendoza',       email: 'pedro.torres@outlook.com' },
  { nombres: 'Valentina Milagros', apellidos: 'Ortiz Herrera',   email: 'vale.ortiz@hotmail.com' },
  { nombres: 'Ricardo',       apellidos: 'Rivas Paredes',        email: 'ricardo.rp@gmail.com' },
  { nombres: 'Camila Andrea', apellidos: 'Flores Sanchez',       email: 'camilaflores.s@gmail.com' },
  { nombres: 'Miguel Angel',  apellidos: 'Vega Cordova',         email: 'miguelvega@yahoo.com' },
  { nombres: 'Silvia Patricia',apellidos: 'Reyes Navarro',        email: 'silvia.reyesn@icloud.com' },
  { nombres: 'Fernando Jesus',apellidos: 'Aguilar Campos',       email: 'faguilar@outlook.com' },
  { nombres: 'Laura Cristina',apellidos: 'Medina Solis',         email: 'lauramedina90@gmail.com' },
  { nombres: 'Diego Alonso',  apellidos: 'Guerrero Rojas',       email: 'diego.guerrero@hotmail.com' },
  { nombres: 'Pamela Estefania',apellidos: 'Delgado Pizarro',    email: 'pamela.delgado@gmail.com' },
];

const cuidadorasData = [
  { nombres: 'Cuidadora Demo',   apellidos: 'Test',                  email: 'cuidadora@test.com' },
  { nombres: 'Lucia Fernanda',   apellidos: 'Martinez Rios',         email: 'luciamartinez.cuidadora@gmail.com' },
  { nombres: 'Carmen Rosa',      apellidos: 'Rodriguez Paredes',    email: 'carmen.rodriguez@outlook.com' },
  { nombres: 'Katherine Lizeth', apellidos: 'Garcia Huaman',        email: 'katherine.garcia@yahoo.com' },
  { nombres: 'Veronica Beatriz', apellidos: 'Morales Castillo',     email: 'vero.morales@icloud.com' },
  { nombres: 'Milagros del Carmen', apellidos: 'Torres Quispe',     email: 'milagrostorres.cuidadora@gmail.com' },
  { nombres: 'Diana Carolina',   apellidos: 'Ramos Salazar',        email: 'dianaramos@hotmail.com' },
  { nombres: 'Andrea Paola',     apellidos: 'Vargas Mendoza',       email: 'andrea.vargas@gmail.com' },
  { nombres: 'Natalia Belen',    apellidos: 'Sanchez Guerrero',     email: 'nataliasanchez@outlook.com' },
  { nombres: 'Monica Patricia',  apellidos: 'Castro Campos',        email: 'monica.castro@yahoo.com' },
  { nombres: 'Rosa Alejandra',   apellidos: 'Flores Rojas',         email: 'rosa.flores.cuidadora@gmail.com' },
];

const zonas = ['Trujillo Centro', 'Victor Larco', 'La Esperanza', 'Moche', 'Buenos Aires'];
const diagnosticoList = ['TEA', 'TDAH', 'Sindrome de Down', 'Discapacidad Motriz', null, null, null];
const nombresNinos = ['Mateo', 'Sofia', 'Liam', 'Valentina', 'Sebastian', 'Emilia', 'Benjamin', 'Camila', 'Lucas', 'Isabella', 'Santiago', 'Martina', 'Daniel', 'Victoria', 'Gabriel', 'Thiago', 'Mia', 'Joaquin', 'Julieta', 'Bruno'];
const tiposServicio = ['Cuidado domiciliario', 'Acompaniamiento escolar', 'Terapia de estimulacion'];
const especialidadesList = [1, 2, 3, 4, 5];
const areasList = [1, 2, 3];

const mensajesFamilia = [
  'Hola, buenos dias. Me interesaria saber si tiene disponibilidad para cuidar a mi hijo.',
  'Muchas gracias por aceptar. Podemos coordinar los detalles?',
  'Le escribo para confirmar el servicio del dia de manana.',
  'Que tal? Queria saber como le fue con mi hijo en la ultima sesion.',
  'Buenas tardes, necesito cambiar el horario de la proxima semana.',
  'Gracias por su excelente trabajo. Mi hijo esta muy contento.',
  'Disculpe la demora, aun tiene disponibilidad para los sabados?',
  'Hola, le escribo porque mi esposo quiere conocerla antes del servicio.',
  'Todo perfecto, muchas gracias por su puntualidad.',
  'Podria traer material adicional para la terapia de estimulacion?',
  'Mi hijo ha mejorado mucho desde que trabaja con usted. Gracias.',
  'Lamentablemente tendremos que cancelar la cita de manana por una emergencia familiar.',
];

const mensajesCuidadora = [
  'Hola! Claro que si, tengo disponibilidad. Cuenteme un poco sobre las necesidades de su hijo.',
  'Perfecto, quedo atenta a los detalles. Muchas gracias.',
  'Confirmado, estare alli a la hora acordada.',
  'La sesion fue muy productiva. Su hijo participo activamente en todas las actividades.',
  'No hay problema, podemos reajustar el horario. Que le parece el jueves?',
  'Muchas gracias, eso significa mucho para mi.',
  'Si, claro. Los sabados tengo algunos espacios libres por la manana.',
  'Por supuesto, sera un gusto conocerlo. Que dia les parece bien?',
  'Gracias a usted por confiar en mi trabajo.',
  'Si, llevare algunos materiales nuevos que pueden serle de mucha utilidad.',
  'Me alegra mucho escuchar eso. Es un nino muy especial y talentoso.',
  'Entiendo, lamento mucho escuchar eso. Espero que todo se resuelva bien.',
];

const comentariosResenaBuena = [
  'Excelente profesional, dedicada y con mucha paciencia. Mi hijo la adora.',
  'Muy responsable y puntual. Se nota que ama lo que hace.',
  'Gran apoyo para nuestra familia. Ha sido un antes y despues en el desarrollo de nuestro hijo.',
  'La recomiendo ampliamente. Tiene una vocacion increible para el cuidado infantil.',
  'Mi hijo ha progresado muchisimo desde que trabaja con ella. Estamos muy agradecidos.',
  'Muy atenta y carinosa con los ninos. Super recomendada.',
  'Profesional comprometida y con excelentes habilidades de comunicacion.',
  'Cumplio con todo lo acordado. Muy buena experiencia.',
  'Llego puntual y se adapto rapidamente a las necesidades de mi hijo. Una bendicion.',
  'Excelente trato y preparacion. Volveremos a contratar sus servicios sin dudarlo.',
];

const comentariosResenaMala = [
  'Llegaba tarde con frecuencia. No cumplio con el horario acordado.',
  'No se adapto al perfil de mi hijo. Tuvimos que cambiar de cuidadora.',
  'Falto a varias sesiones sin previo aviso. Poco profesional.',
  'La comunicacion fue dificil. No respondia los mensajes a tiempo.',
];

export function seed(db) {
  const hasOldData = db.prepare("SELECT COUNT(*) AS c FROM Usuarios WHERE Email LIKE '%cuidadora%' OR Email LIKE '%familia%'").get().c > 1;

  const ALL_TABLES = ['Incidencias', 'Notificaciones', 'DocumentosPostulacion', 'Postulaciones', 'Pagos', 'Menores', 'Ordenes', 'Mensajes', 'Conversaciones', 'Citas', 'Favoritos', 'Resenas', 'CuidadoraCertificaciones', 'CuidadoraFormacion', 'CuidadoraDocumentos', 'CuidadoraAreas', 'CuidadoraEspecialidades', 'Cuidadoras', 'Usuarios'];

  if (hasOldData) {
    console.log('Detectados datos con formato antiguo. Limpiando y regenerando...');
    db.exec('PRAGMA foreign_keys = OFF');
    for (const t of ALL_TABLES) db.exec(`DELETE FROM ${t}`);
    for (const t of ALL_TABLES) db.exec(`DELETE FROM sqlite_sequence WHERE name='${t}'`);
    db.exec('PRAGMA foreign_keys = ON');
  }

  // ========== 1. FAMILIAS ==========
  const famCount = db.prepare('SELECT COUNT(*) AS c FROM Usuarios WHERE IdRol = 2').get().c;
  if (famCount === 0) {
    for (const f of familiasData) {
      const tel = `9${String(rand(10000000, 99999999))}`;
      const dni = String(rand(10000000, 99999999));
      db.prepare('INSERT INTO Usuarios (Email, PasswordHash, Nombres, Apellidos, NumeroDocumento, Telefono, IdRol, TerminosAceptados, FechaCreacion) VALUES (?, ?, ?, ?, ?, ?, 2, 1, ?)').run(f.email, '123456', f.nombres, f.apellidos, dni, tel, dateTimeStr(rand(300, 365)));
    }
  }
  const familias = db.prepare('SELECT Id, Nombres, Apellidos FROM Usuarios WHERE IdRol = 2').all();

  const menoresCount = db.prepare('SELECT COUNT(*) AS c FROM Menores').get().c;
  if (menoresCount === 0) {
    for (const f of familias) {
      const cant = rand(1, 2);
      for (let i = 0; i < cant; i++) {
        const diag = pick(diagnosticoList);
        const fecNac = `${rand(2016, 2023)}-${String(rand(1, 12)).padStart(2, '0')}-${String(rand(1, 28)).padStart(2, '0')}`;
        db.prepare('INSERT INTO Menores (IdUsuarioFamilia, Nombre, Diagnostico, FechaNacimiento) VALUES (?, ?, ?, ?)').run(f.Id, pick(nombresNinos), diag, fecNac);
      }
    }
  }
  const menores = db.prepare('SELECT * FROM Menores').all();

  // ========== 2. CUIDADORAS ==========
  const cuiCount = db.prepare('SELECT COUNT(*) AS c FROM Usuarios WHERE IdRol = 3').get().c;
  if (cuiCount === 0) {
    for (const c of cuidadorasData) {
      const tel = `9${String(rand(10000000, 99999999))}`;
      const dni = String(rand(10000000, 99999999));
      db.prepare('INSERT INTO Usuarios (Email, PasswordHash, Nombres, Apellidos, NumeroDocumento, Telefono, IdRol, TerminosAceptados, FechaCreacion) VALUES (?, ?, ?, ?, ?, ?, 3, 1, ?)').run(c.email, '123456', c.nombres, c.apellidos, dni, tel, dateTimeStr(rand(300, 365)));
    }
  }
  const cuidadorasUsers = db.prepare('SELECT Id, Nombres, Apellidos FROM Usuarios WHERE IdRol = 3').all();

  const perfiles = [
    { exp: 12, tarifa: 42, zona: 'Victor Larco',    descCorta: 'Especialista en TEA con 12 anos de experiencia.', descLarga: 'Trabajo con ninos dentro del espectro autista usando tecnicas ABA y de integracion sensorial. Formacion continua en terapias modernas.' },
    { exp: 8,  tarifa: 35, zona: 'Trujillo Centro',  descCorta: 'Profesional en Estimulacion Temprana.',         descLarga: 'Apasionada por el desarrollo infantil temprano. Certificada en primeros auxilios y terapia de lenguaje basica.' },
    { exp: 15, tarifa: 50, zona: 'La Esperanza',     descCorta: 'Psicologa infantil con amplia trayectoria.',     descLarga: 'Mas de 15 anos trabajando con ninos con necesidades especiales. Experta en TDAH y trastornos de conducta.' },
    { exp: 5,  tarifa: 30, zona: 'Moche',            descCorta: 'Cuidadora paciente y creativa.',                 descLarga: 'Joven profesional con energia y dedicacion. Especializada en terapia ocupacional y juegos didacticos.' },
    { exp: 10, tarifa: 40, zona: 'Buenos Aires',     descCorta: 'Especialista en Sindrome de Down.',            descLarga: 'Amplia experiencia en inclusion y estimulacion de ninos con Sindrome de Down. Talleres de integracion social.' },
    { exp: 7,  tarifa: 38, zona: 'Trujillo Centro',  descCorta: 'Terapeuta de lenguaje y aprendizaje.',          descLarga: 'Licenciada en Educacion Especial con enfoque en comunicacion aumentativa y alternativa.' },
    { exp: 20, tarifa: 55, zona: 'Victor Larco',     descCorta: 'Maestra de educacion especial jubilada.',       descLarga: 'Una vida dedicada a la ensenanza. Experta en diseno de planes de intervencion individualizados.' },
    { exp: 3,  tarifa: 28, zona: 'La Esperanza',     descCorta: 'Cuidadora con vocacion y calidez.',             descLarga: 'Iniciando mi carrera pero con enorme compromiso. Certificada en RCP y primeros auxilios infantiles.' },
    { exp: 6,  tarifa: 35, zona: 'Moche',            descCorta: 'Especialista en discapacidad motriz.',          descLarga: 'Experiencia en fisioterapia infantil y estimulacion sensorial. Trabajo con ninos con paralisis cerebral.' },
    { exp: 9,  tarifa: 45, zona: 'Buenos Aires',     descCorta: 'Profesional integral en cuidado infantil.',      descLarga: 'Combinacion de formacion en psicologia y educacion especial. Terapias personalizadas segun cada nino.' },
  ];

  for (let idx = 0; idx < cuidadorasUsers.length; idx++) {
    const u = cuidadorasUsers[idx];
    const p = perfiles[idx] || pick(perfiles);
    const existe = db.prepare('SELECT Id FROM Cuidadoras WHERE IdUsuario = ?').get(u.Id);
    if (!existe) {
      const r = db.prepare(`INSERT INTO Cuidadoras (IdUsuario, AniosExperiencia, TarifaHora, DescripcionCorta, DescripcionLarga, CalificacionPromedio, TotalResenas, Disponible, Zona)
        VALUES (?, ?, ?, ?, ?, 0, 0, 1, ?)`).run(u.Id, p.exp, p.tarifa, p.descCorta, p.descLarga, p.zona);
      const cId = r.lastInsertRowid;
      for (const e of [...especialidadesList].sort(() => Math.random() - 0.5).slice(0, rand(2, 3)))
        db.prepare('INSERT OR IGNORE INTO CuidadoraEspecialidades (IdCuidadora, IdEspecialidad) VALUES (?, ?)').run(cId, e);
      for (const a of [...areasList].sort(() => Math.random() - 0.5).slice(0, rand(1, 2)))
        db.prepare('INSERT OR IGNORE INTO CuidadoraAreas (IdCuidadora, IdArea) VALUES (?, ?)').run(cId, a);
      db.prepare('INSERT INTO CuidadoraFormacion (IdCuidadora, Titulo, Institucion, AnioObtencion, Orden) VALUES (?, ?, ?, ?, 1)').run(cId,
        pick(['Educacion Especial', 'Psicologia Infantil', 'Terapia Ocupacional', 'Educacion Inicial']),
        pick(['Universidad Nacional de Trujillo', 'Universidad Privada Antenor Orrego', 'Instituto Superior Pedagogico']),
        rand(2008, 2022));
      db.prepare('INSERT INTO CuidadoraCertificaciones (IdCuidadora, Nombre, EntidadEmisora, FechaObtencion) VALUES (?, ?, ?, ?)').run(cId,
        pick(['Curso de Intervencion en TEA', 'RCP y Primeros Auxilios', 'Estimulacion Temprana', 'Terapia de Lenguaje Basico']),
        pick(['MINSA', 'Cruz Roja Peruana', 'Instituto Peruano de Educacion Especial']),
        dateStr(rand(30, 365)));
    }
  }
  const cuidadoras = db.prepare('SELECT c.Id, c.IdUsuario, c.AniosExperiencia, c.TarifaHora, c.Zona, u.Nombres, u.Apellidos, u.Email FROM Cuidadoras c INNER JOIN Usuarios u ON u.Id = c.IdUsuario').all();

  // ========== 3. FAVORITOS ==========
  if (db.prepare('SELECT COUNT(*) AS c FROM Favoritos').get().c === 0) {
    for (const f of familias) {
      for (const c of [...cuidadoras].sort(() => Math.random() - 0.5).slice(0, rand(1, 3)))
        db.prepare('INSERT OR IGNORE INTO Favoritos (IdUsuarioFamilia, IdCuidadora, FechaCreacion) VALUES (?, ?, ?)').run(f.Id, c.Id, dateTimeStr(rand(30, 300)));
    }
  }

  // ========== 4. ORDENES (60-70 distribuidas en 365 dias) ==========
  const nivelesUso = [12, 8, 6, 5, 7, 4, 3, 9, 5, 2, 4, 6, 3, 1, 2];
  if (db.prepare('SELECT COUNT(*) AS c FROM Ordenes').get().c === 0) {
    let ordenGlobalIdx = 0;
    for (let fi = 0; fi < familias.length; fi++) {
      const f = familias[fi];
      const nroOrdenes = nivelesUso[fi] || rand(2, 6);
      for (let oi = 0; oi < nroOrdenes; oi++) {
        const c = pick(cuidadoras);
        const m = menores.filter(mm => mm.IdUsuarioFamilia === f.Id);
        const menor = m.length > 0 ? pick(m) : pick(menores);
        const diasAgo = randomDays();
        const fechaOrd = dateStr(diasAgo);
        const horaInicio = `${String(rand(7, 16)).padStart(2, '0')}:00`;
        const horas = randDec(2, 8, 1);
        const horaFin = `${String(parseInt(horaInicio) + Math.ceil(horas)).padStart(2, '0')}:00`;
        const tarifa = c.TarifaHora + randDec(-2, 3);
        const subtotal = +(tarifa * horas).toFixed(2);
        const plataforma = +(subtotal * 0.15).toFixed(2);
        const total = +(subtotal + plataforma).toFixed(2);

        let estado;
        if (diasAgo > 180) estado = 'Finalizada';
        else if (diasAgo > 60) estado = pick(['Finalizada', 'Finalizada', 'Finalizada', 'Cancelada']);
        else if (diasAgo > 15) estado = pick(['Finalizada', 'En curso', 'Cancelada']);
        else estado = pick(['Pendiente', 'Confirmada', 'En curso', 'Cancelada']);

        const fechaCreacion = dateTimeStr(diasAgo + rand(3, 10));
        const r = db.prepare(`INSERT INTO Ordenes (IdCuidadora, IdUsuarioFamilia, TipoServicio, FechaServicio, TotalHoras, TarifaHora, Subtotal, TarifaPlataforma, Total, Estado, FechaCreacion, IdMenor, HoraInicio, HoraFin)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(c.Id, f.Id,
          pick(tiposServicio), fechaOrd, horas, +tarifa.toFixed(2), subtotal, plataforma, total, estado, fechaCreacion, menor?.Id || null, horaInicio, horaFin);
        ordenGlobalIdx++;
      }
    }

    const ordenes = db.prepare("SELECT Id, Total, FechaCreacion FROM Ordenes WHERE Estado != 'Cancelada'").all();
    for (const o of ordenes) {
      const diasPago = rand(0, 5);
      const fecBase = new Date(o.FechaCreacion.replace(' ', 'T'));
      fecBase.setDate(fecBase.getDate() + diasPago);
      const fecPago = fecBase.toISOString().slice(0, 19).replace('T', ' ');
      db.prepare('INSERT INTO Pagos (IdOrden, Monto, MetodoPago, Estado, FechaPago) VALUES (?, ?, ?, ?, ?)').run(o.Id, o.Total, pick(['Tarjeta', 'Yape', 'Transferencia', 'Efectivo']), 'Completado', fecPago);
    }
  }

  // ========== 5. RESENAS ==========
  if (db.prepare('SELECT COUNT(*) AS c FROM Resenas').get().c === 0) {
    const ordenesFinalizadas = db.prepare('SELECT o.Id, o.IdCuidadora, o.IdUsuarioFamilia, o.FechaServicio FROM Ordenes o WHERE o.Estado = ? OR o.Estado = ?').all('Finalizada', 'En curso');
    for (const o of ordenesFinalizadas) {
      if (Math.random() > 0.2) {
        const esBuena = Math.random() > 0.15;
        const diasResena = rand(1, 15);
        const fecResena = new Date(o.FechaServicio + 'T00:00:00');
        fecResena.setDate(fecResena.getDate() + diasResena);
        const fechaStr = fecResena.toISOString().slice(0, 19).replace('T', ' ');
        db.prepare('INSERT INTO Resenas (IdCuidadora, IdUsuarioFamilia, Calificacion, Comentario, FechaResena, FechaCreacion) VALUES (?, ?, ?, ?, ?, ?)').run(
          o.IdCuidadora, o.IdUsuarioFamilia, esBuena ? rand(4, 5) : rand(1, 2),
          pick(esBuena ? comentariosResenaBuena : comentariosResenaMala),
          fechaStr, fechaStr);
      }
    }
    for (const c of cuidadoras) {
      const avg = db.prepare('SELECT AVG(Calificacion) AS prom, COUNT(*) AS tot FROM Resenas WHERE IdCuidadora = ?').get(c.Id);
      if (avg.prom) db.prepare('UPDATE Cuidadoras SET CalificacionPromedio = ?, TotalResenas = ? WHERE Id = ?').run(+avg.prom.toFixed(1), avg.tot, c.Id);
    }
  }

  // ========== 6. CITAS ==========
  if (db.prepare('SELECT COUNT(*) AS c FROM Citas').get().c === 0) {
    for (let i = 0; i < 45; i++) {
      const c = pick(cuidadoras);
      const f = pick(familias.filter(ff => ff.Id !== c.IdUsuario));
      const diasAgo = randomDays();
      const modalidad = Math.random() > 0.4 ? 'Virtual' : 'Presencial';
      const estado = diasAgo > 30 ? pick(['Completada', 'Completada', 'Completada', 'Cancelada']) : pick(['Pendiente', 'Confirmada', 'Completada']);
      db.prepare('INSERT INTO Citas (IdCuidadora, IdUsuarioFamilia, FechaCita, HoraCita, DuracionMinutos, Modalidad, Estado, FechaCreacion) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(
        c.Id, f.Id, dateStr(diasAgo), `${String(rand(8, 18)).padStart(2, '0')}:00:00`, rand(30, 180),
        modalidad, estado, dateTimeStr(diasAgo + rand(3, 15)));
    }
  }

  // ========== 7. CONVERSACIONES Y MENSAJES ==========
  if (db.prepare('SELECT COUNT(*) AS c FROM Conversaciones').get().c === 0) {
    for (let i = 0; i < 25; i++) {
      const c = pick(cuidadoras);
      const f = pick(familias.filter(ff => ff.Id !== c.IdUsuario));
      const diasAgo = randomDays();
      const fecConv = dateTimeStr(diasAgo);
      let convId = db.prepare('SELECT Id FROM Conversaciones WHERE IdCuidadora = ? AND IdUsuarioFamilia = ?').get(c.Id, f.Id)?.Id;
      if (!convId) {
        convId = db.prepare('INSERT INTO Conversaciones (IdCuidadora, IdUsuarioFamilia, FechaCreacion, FechaUltimoMensaje) VALUES (?, ?, ?, ?)').run(c.Id, f.Id, fecConv, fecConv).lastInsertRowid;
      }
      const numMensajes = rand(2, 6);
      for (let m = 0; m < numMensajes; m++) {
        const rem = m % 2 === 0 ? f.Id : c.IdUsuario;
        const msgDaysAgo = Math.max(0, diasAgo - m * rand(0, 2));
        db.prepare('INSERT INTO Mensajes (IdConversacion, IdRemitente, Contenido, Leido, FechaEnvio) VALUES (?, ?, ?, ?, ?)').run(convId, rem,
          pick(rem === f.Id ? mensajesFamilia : mensajesCuidadora),
          1, dateTimeStr(msgDaysAgo));
      }
      const ultMsg = db.prepare('SELECT FechaEnvio FROM Mensajes WHERE IdConversacion = ? ORDER BY FechaEnvio DESC LIMIT 1').get(convId);
      if (ultMsg) db.prepare('UPDATE Conversaciones SET FechaUltimoMensaje = ? WHERE Id = ?').run(ultMsg.FechaEnvio, convId);
    }
  }

  // ========== 8. NOTIFICACIONES ==========
  if (db.prepare('SELECT COUNT(*) AS c FROM Notificaciones').get().c === 0) {
    const allUserIds = [...familias.map(f => f.Id), ...cuidadoras.map(c => c.IdUsuario)];
    for (const uid of allUserIds) {
      const numNotif = rand(3, 6);
      for (let i = 0; i < numNotif; i++) {
        const diasAgo = randomDays();
        const tipo = pick(['recordatorio', 'mensaje', 'pago', 'resena']);
        const titulos = { recordatorio: 'Recordatorio de cita', mensaje: 'Nuevo mensaje recibido', pago: 'Pago confirmado', resena: 'Nueva resena recibida' };
        const descs = { recordatorio: 'Tienes una cita programada para manana.', mensaje: 'Has recibido un nuevo mensaje en tu bandeja.', pago: 'Tu pago ha sido procesado exitosamente.', resena: 'Una familia ha dejado una resena sobre tu servicio.' };
        db.prepare('INSERT INTO Notificaciones (IdUsuarioDestino, Titulo, Descripcion, Tipo, Leido, FechaCreacion) VALUES (?, ?, ?, ?, ?, ?)').run(uid,
          titulos[tipo], descs[tipo], tipo, diasAgo > 30 ? 1 : rand(0, 1), dateTimeStr(diasAgo));
      }
    }
  }

  // ========== 9. INCIDENCIAS ==========
  const descsInc = [
    'La cuidadora llego 45 minutos tarde sin avisar. El menor quedo solo durante ese tiempo.',
    'La familia no entrego los materiales de terapia acordados para la sesion.',
    'Se reporto un leve retraso de 10 minutos. Sin mayor impacto en el servicio.',
    'El menor presento una crisis de ansiedad durante la sesion. La cuidadora siguio el protocolo.',
    'Hubo un malentendido con el horario acordado. Se resolvio conversando.',
    'Desacuerdo sobre la metodologia de estimulacion aplicada. Se programo reunion.',
    'La cuidadora reporto que el hogar no contaba con las condiciones minimas de seguridad.',
  ];
  if (db.prepare('SELECT COUNT(*) AS c FROM Incidencias').get().c === 0) {
    const ordenes = db.prepare('SELECT Id, IdCuidadora, IdUsuarioFamilia FROM Ordenes ORDER BY Id').all();
    const paresInc = [
      { ordenIdx: 9,  tipo: 'Grave',    estado: 'Abierta' },
      { ordenIdx: 0,  tipo: 'Moderada', estado: 'Abierta' },
      { ordenIdx: 38, tipo: 'Leve',     estado: 'En revision' },
      { ordenIdx: 10, tipo: 'Leve',     estado: 'En revision' },
      { ordenIdx: 17, tipo: 'Leve',     estado: 'En revision' },
      { ordenIdx: 33, tipo: 'Leve',     estado: 'Cerrada' },
    ];
    for (const p of paresInc) {
      const o = ordenes[p.ordenIdx];
      if (!o) continue;
      const diasAgo = rand(5, 60);
      db.prepare('INSERT INTO Incidencias (IdOrden, Tipo, Estado, Descripcion, FechaCreacion) VALUES (?, ?, ?, ?, ?)').run(o.Id, p.tipo, p.estado, pick(descsInc), dateTimeStr(diasAgo));
    }
  }

  // ========== 10. POSTULACIONES (con documentos) ==========
  if (db.prepare('SELECT COUNT(*) AS c FROM Postulaciones').get().c === 0) {
    const tiposDoc = [
      ['DNI', '120 KB'],
      ['Antecedentes penales', '340 KB'],
      ['Certificado de salud', '210 KB'],
      ['Titulo profesional', '180 KB'],
      ['Carta de presentacion', '95 KB'],
    ];
    const estadosPos = ['Pendiente', 'Pendiente', 'Rechazada', 'Rechazada', 'Aprobada', 'Aprobada', 'Pendiente', 'Aprobada', 'Aprobada', 'Rechazada', 'Pendiente'];
    const motivosRechazo = [
      'Documentos incompletos: falta certificado de antecedentes penales vigente.',
      'No cumple con el minimo de 3 anos de experiencia requerido.',
      'Antecedentes penales no verificables con la PNP.',
    ];
    const docsMotivoRechazo = {
      'DNI': 'Documento ilegible, no se puede confirmar identidad.',
      'Antecedentes penales': 'Certificado vencido, no coincide con la consulta en linea.',
      'Certificado de salud': 'Certificado tiene mas de 6 meses de antiguedad.',
      'Titulo profesional': 'Titulo no corresponde a institucion reconocida por MINEDU.',
      'Carta de presentacion': 'Carta no esta firmada ni tiene datos de contacto verificables.',
    };
    for (let j = 0; j < cuidadorasUsers.length; j++) {
      const u = cuidadorasUsers[j];
      const estado = estadosPos[j];
      const diasAgo = rand(10, 180);
      const motivoRechazo = estado === 'Rechazada' ? motivosRechazo[j % motivosRechazo.length] : null;
      const r = db.prepare(`INSERT INTO Postulaciones (IdUsuario, Estado, MotivoRechazo, FechaPostulacion) VALUES (?, ?, ?, datetime('now', '-${diasAgo} days'))`).run(u.Id, estado, motivoRechazo);
      const docs = [...tiposDoc].sort(() => Math.random() - 0.5).slice(0, rand(2, 5));
      for (const [tipo, peso] of docs) {
        const docEstado = estado === 'Aprobada' ? 'Aprobado' : estado === 'Rechazada' ? 'Rechazado' : 'Pendiente';
        const docMotivo = estado === 'Rechazada' ? (docsMotivoRechazo[tipo] || 'Documento no cumple con los requisitos.') : null;
        const nombreArchivo = `${tipo.toLowerCase().replace(/[\saeiou]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '')}_${u.Nombres.split(' ')[0].toLowerCase()}_${u.Apellidos.toLowerCase()}.pdf`;
        db.prepare('INSERT INTO DocumentosPostulacion (IdPostulacion, TipoRequisito, NombreArchivo, Peso, Estado, MotivoRechazo) VALUES (?, ?, ?, ?, ?, ?)').run(r.lastInsertRowid, tipo, nombreArchivo, peso, docEstado, docMotivo);
      }
    }
  }

  // ========== 11. DEMO DATA: GeolocalizacionRegistros ==========
  if (db.prepare('SELECT COUNT(*) AS c FROM GeolocalizacionRegistros').get().c === 0) {
    const ordenesEnCurso = db.prepare("SELECT Id, IdCuidadora FROM Ordenes WHERE Estado = 'En curso' LIMIT 3").all();
    for (const o of ordenesEnCurso) {
      const lat = -8.1 + Math.random() * 0.05;
      const lon = -79.0 + Math.random() * 0.05;
      db.prepare("INSERT INTO GeolocalizacionRegistros (IdOrden, IdCuidadora, Tipo, Latitud, Longitud, DistanciaMetros, Validado) VALUES (?, ?, 'CheckIn', ?, ?, ?, 1)").run(o.Id, o.IdCuidadora, lat, lon, rand(10, 45));
    }
    const ordenesFinalizadas = db.prepare("SELECT Id, IdCuidadora FROM Ordenes WHERE Estado = 'Finalizada' LIMIT 5").all();
    for (const o of ordenesFinalizadas) {
      const latIn = -8.1 + Math.random() * 0.05;
      const lonIn = -79.0 + Math.random() * 0.05;
      const latOut = latIn + (Math.random() - 0.5) * 0.001;
      const lonOut = lonIn + (Math.random() - 0.5) * 0.001;
      db.prepare("INSERT INTO GeolocalizacionRegistros (IdOrden, IdCuidadora, Tipo, Latitud, Longitud, DistanciaMetros, Validado) VALUES (?, ?, 'CheckIn', ?, ?, ?, 1)").run(o.Id, o.IdCuidadora, latIn, lonIn, rand(5, 30));
      db.prepare("INSERT INTO GeolocalizacionRegistros (IdOrden, IdCuidadora, Tipo, Latitud, Longitud) VALUES (?, ?, 'CheckOut', ?, ?)").run(o.Id, o.IdCuidadora, latOut, lonOut);
    }
  }

  // ========== 12. DEMO DATA: ReportesDiarios ==========
  if (db.prepare('SELECT COUNT(*) AS c FROM ReportesDiarios').get().c === 0) {
    const estadosGeneral = ['Excelente', 'Bueno', 'Regular', 'Requiere Observacion'];
    const ordenesActivas = db.prepare("SELECT Id, IdCuidadora, IdMenor FROM Ordenes WHERE IdMenor IS NOT NULL AND Estado IN ('En curso', 'Finalizada', 'Pagada') LIMIT 10").all();
    const stmt = db.prepare("INSERT INTO ReportesDiarios (IdOrden, IdCuidadora, IdMenor, EstadoGeneral, Alimentacion, Medicamentos, ActividadesRealizadas, Observaciones, FechaReporte) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    for (const o of ordenesActivas) {
      const diasAgo = rand(1, 30);
      const d = new Date();
      d.setDate(d.getDate() - diasAgo);
      const fechaReporte = d.toISOString().slice(0, 10);
      stmt.run(
        o.Id, o.IdCuidadora, o.IdMenor,
        pick(estadosGeneral),
        pick(['Comio bien toda la porcion', 'Comio la mitad de la porcion', 'Se nego a comer', 'Comio con ayuda']),
        pick(['Ninguno', 'Vitamina D recetada', 'Antibiotico recetado', 'Solo medicacion de emergencia']),
        pick(['Juego libre, lectura', 'Terapia sensorial, pintura', 'Ejercicios de motricidad, canciones', 'Paseo al parque, juegos educativos']),
        pick(['Sin novedades', 'Tuvo un buen dia', 'Un poco inquieto pero colaborador', 'Se durmio temprano']),
        fechaReporte
      );
    }
  }

  // ========== 13. DEMO DATA: ReservasCalendario ==========
  if (db.prepare('SELECT COUNT(*) AS c FROM ReservasCalendario').get().c === 0) {
    const ordenesMultiples = db.prepare("SELECT Id, IdCuidadora, IdUsuarioFamilia FROM Ordenes WHERE Estado = 'Pagada' OR Estado = 'En curso' LIMIT 5").all();
    for (const o of ordenesMultiples) {
      const diasAgo = rand(5, 15);
      const fechaIni = dateStr(diasAgo);
      const fechaFin = dateStr(diasAgo - rand(0, 2));
      db.prepare("INSERT INTO ReservasCalendario (IdOrden, IdUsuarioFamilia, IdCuidadora, FechaInicio, FechaFin, TipoRecurrencia, Estado) VALUES (?, ?, ?, ?, ?, ?, ?)").run(
        o.Id, o.IdUsuarioFamilia, o.IdCuidadora, fechaIni, fechaFin,
        pick(['Unico', 'Semanal', 'Mensual']), 'Programada'
      );
    }
    const ordenesFuturas = db.prepare("SELECT Id, IdCuidadora, IdUsuarioFamilia FROM Ordenes WHERE Estado = 'Pendiente' OR Estado = 'Confirmada' LIMIT 3").all();
    for (const o of ordenesFuturas) {
      const fechaIni = dateStr(-rand(3, 10));
      const fechaFin = dateStr(-rand(3, 10) + 1);
      db.prepare("INSERT INTO ReservasCalendario (IdOrden, IdUsuarioFamilia, IdCuidadora, FechaInicio, FechaFin, TipoRecurrencia, Estado) VALUES (?, ?, ?, ?, ?, ?, ?)").run(
        o.Id, o.IdUsuarioFamilia, o.IdCuidadora, fechaIni, fechaFin, 'Unico', 'Programada'
      );
    }
  }

  // ========== 14. DEMO DATA: FamiliaMiembros ==========
  if (db.prepare('SELECT COUNT(*) AS c FROM FamiliaMiembros').get().c === 0) {
    const familiasConMiembros = familias.slice(0, 5);
    for (const f of familiasConMiembros) {
      db.prepare("INSERT INTO FamiliaMiembros (IdUsuarioFamiliaPrincipal, Nombre, Email, Telefono, Rol) VALUES (?, ?, ?, ?, ?)").run(f.Id, f.Nombres + ' ' + f.Apellidos + ' (Conyuge)', 'conyuge_' + f.Id + '@email.com', '987654321', 'Administrador');
      if (Math.random() > 0.5) {
        db.prepare("INSERT INTO FamiliaMiembros (IdUsuarioFamiliaPrincipal, Nombre, Email, Telefono, Rol) VALUES (?, ?, ?, ?, ?)").run(f.Id, 'Abuela ' + f.Apellidos, 'abuela_' + f.Id + '@email.com', '987654322', 'Observador');
      }
    }
    db.prepare("INSERT INTO FamiliaMiembros (IdUsuarioFamiliaPrincipal, Nombre, Email, Telefono, Rol) VALUES (?, ?, ?, ?, ?)").run(familias[0].Id, 'Juan Perez (Familiar Autorizado)', 'juan.perez@email.com', '999888777', 'Administrador');
  }

  // ========== 15. DEMO DATA: ReputacionCuidadora ==========
  if (db.prepare('SELECT COUNT(*) AS c FROM ReputacionCuidadora').get().c === 0) {
    const carmen = db.prepare("SELECT Id FROM Cuidadoras WHERE Id = (SELECT Id FROM Cuidadoras ORDER BY Id LIMIT 1 OFFSET 2)").get();
    if (carmen) {
      const nivelPlata = db.prepare("SELECT Id FROM NivelesReputacion WHERE Nombre = 'Plata'").get();
      db.prepare("INSERT INTO ReputacionCuidadora (IdCuidadora, PuntajeTotal, IdNivelActual, ServiciosCompletados, Recontrataciones, PuntualidadPromedio) VALUES (?, ?, ?, ?, ?, ?)").run(
        carmen.Id, 350, nivelPlata?.Id || 2, 28, 5, 4.5
      );
      db.prepare("INSERT INTO HistorialReputacion (IdCuidadora, PuntajeAnterior, PuntajeNuevo, Concepto, FechaCreacion) VALUES (?, 0, 50, 'Registro inicial', datetime('now', '-180 days'))").run(carmen.Id);
      db.prepare("INSERT INTO HistorialReputacion (IdCuidadora, PuntajeAnterior, PuntajeNuevo, Concepto, FechaCreacion) VALUES (?, 50, 150, 'Servicio completado #1', datetime('now', '-150 days'))").run(carmen.Id);
      db.prepare("INSERT INTO HistorialReputacion (IdCuidadora, PuntajeAnterior, PuntajeNuevo, Concepto, FechaCreacion) VALUES (?, 150, 200, 'Resena positiva recibida', datetime('now', '-120 days'))").run(carmen.Id);
      db.prepare("INSERT INTO HistorialReputacion (IdCuidadora, PuntajeAnterior, PuntajeNuevo, Concepto, FechaCreacion) VALUES (?, 200, 280, 'Ascenso a Plata', datetime('now', '-90 days'))").run(carmen.Id);
      db.prepare("INSERT INTO HistorialReputacion (IdCuidadora, PuntajeAnterior, PuntajeNuevo, Concepto, FechaCreacion) VALUES (?, 280, 350, 'Recontratacion con familia Garcia', datetime('now', '-30 days'))").run(carmen.Id);
    }

    for (const c of cuidadoras.slice(0, 5)) {
      const exists = db.prepare('SELECT Id FROM ReputacionCuidadora WHERE IdCuidadora = ?').get(c.Id);
      if (!exists) {
        const nivelBronce = db.prepare("SELECT Id FROM NivelesReputacion WHERE Nombre = 'Bronce'").get();
        db.prepare("INSERT INTO ReputacionCuidadora (IdCuidadora, PuntajeTotal, IdNivelActual, ServiciosCompletados, Recontrataciones, PuntualidadPromedio) VALUES (?, ?, ?, ?, ?, ?)").run(
          c.Id, rand(50, 180), nivelBronce?.Id || 1, rand(3, 15), rand(0, 2), randDec(3, 5, 1)
        );
      }
    }
  }

  // ========== 16. DEMO DATA: Capacitaciones Progreso ==========
  if (db.prepare('SELECT COUNT(*) AS c FROM ProgresoCapacitacion').get().c === 0) {
    const capacitaciones = db.prepare('SELECT Id FROM Capacitaciones').all();
    for (let idx = 0; idx < Math.min(cuidadoras.length, 5); idx++) {
      const c = cuidadoras[idx];
      for (let ci = 0; ci < Math.min(capacitaciones.length, 3); ci++) {
        const cap = capacitaciones[ci];
        if (Math.random() > 0.3) {
          const puntaje = rand(65, 100);
          const aprobado = puntaje >= 70 ? 1 : 0;
          db.prepare("INSERT OR IGNORE INTO ProgresoCapacitacion (IdCuidadora, IdCapacitacion, PuntajeObtenido, Aprobado, CertificadoGenerado, CertificadoUrl, FechaCompletado) VALUES (?, ?, ?, ?, ?, ?, datetime('now', '-? days'))").run(
            c.Id, cap.Id, puntaje, aprobado, aprobado,
            aprobado ? `/certificados/${c.Nombres.toLowerCase()}_${cap.Id}.pdf` : null,
            rand(10, 60)
          );
        }
      }
    }
  }

  // ========== 17. REPORTE ==========
  const stats = {
    usuarios: db.prepare('SELECT COUNT(*) AS c FROM Usuarios').get().c,
    cuidadoras: db.prepare('SELECT COUNT(*) AS c FROM Cuidadoras').get().c,
    resenas: db.prepare('SELECT COUNT(*) AS c FROM Resenas').get().c,
    citas: db.prepare('SELECT COUNT(*) AS c FROM Citas').get().c,
    ordenes: db.prepare('SELECT COUNT(*) AS c FROM Ordenes').get().c,
    pagos: db.prepare('SELECT COUNT(*) AS c FROM Pagos').get().c,
    postulaciones: db.prepare('SELECT COUNT(*) AS c FROM Postulaciones').get().c,
    incidencias: db.prepare('SELECT COUNT(*) AS c FROM Incidencias').get().c,
  };
  console.log('Datos demo generados con aspecto real:');
  Object.entries(stats).forEach(([k, v]) => console.log(`   ${k}: ${v}`));
}

if (process.argv[1] && (process.argv[1].endsWith('seed-data.mjs') || process.argv[1].endsWith('seed-data'))) {
  const db = getDb();
  seed(db);
  closeDb();
}
