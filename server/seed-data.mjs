import { getDb, closeDb } from './db.js';

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randDec(min, max, d = 2) { return +(min + Math.random() * (max - min)).toFixed(d); }
function pick(arr) { return arr[rand(0, arr.length - 1)]; }
function dateStr(daysAgo) { const d = new Date(); d.setDate(d.getDate() - daysAgo); return d.toISOString().slice(0, 10); }
function dateTimeStr(daysAgo) { const d = new Date(); d.setDate(d.getDate() - daysAgo); return d.toISOString().slice(0, 19).replace('T', ' '); }
function randomDays() {
  const w = Math.random();
  if (w < 0.15) return rand(1, 30);       // 15% last month
  if (w < 0.40) return rand(31, 120);     // 25% 1-4 months
  if (w < 0.65) return rand(121, 210);    // 25% 4-7 months
  if (w < 0.85) return rand(211, 300);    // 20% 7-10 months
  return rand(301, 364);                   // 15% 10-12 months
}

const familiasData = [
  { nombres: 'Familia Demo',  apellidos: 'Test',                 email: 'familia@test.com' },
  { nombres: 'María Elena',   apellidos: 'González Torres',      email: 'mariagonzalez79@gmail.com' },
  { nombres: 'Carlos Alberto',apellidos: 'López Ramírez',       email: 'carlos.lopez@outlook.com' },
  { nombres: 'Ana Lucía',     apellidos: 'Martínez Ríos',        email: 'anamlr@yahoo.com' },
  { nombres: 'José Antonio',  apellidos: 'Díaz Vargas',          email: 'jose.diazv@icloud.com' },
  { nombres: 'Claudia Sofía', apellidos: 'Morales Castillo',     email: 'clausofia.mc@gmail.com' },
  { nombres: 'Pedro Pablo',   apellidos: 'Torres Mendoza',       email: 'pedro.torres@outlook.com' },
  { nombres: 'Valentina Milagros', apellidos: 'Ortiz Herrera',   email: 'vale.ortiz@hotmail.com' },
  { nombres: 'Ricardo',       apellidos: 'Rivas Paredes',        email: 'ricardo.rp@gmail.com' },
  { nombres: 'Camila Andrea', apellidos: 'Flores Sánchez',       email: 'camilaflores.s@gmail.com' },
  { nombres: 'Miguel Ángel',  apellidos: 'Vega Córdova',         email: 'miguelvega@yahoo.com' },
  { nombres: 'Silvia Patricia',apellidos: 'Reyes Navarro',        email: 'silvia.reyesn@icloud.com' },
  { nombres: 'Fernando Jesús',apellidos: 'Aguilar Campos',       email: 'faguilar@outlook.com' },
  { nombres: 'Laura Cristina',apellidos: 'Medina Solís',         email: 'lauramedina90@gmail.com' },
  { nombres: 'Diego Alonso',  apellidos: 'Guerrero Rojas',       email: 'diego.guerrero@hotmail.com' },
  { nombres: 'Pamela Estefanía',apellidos: 'Delgado Pizarro',    email: 'pamela.delgado@gmail.com' },
];

const cuidadorasData = [
  { nombres: 'Cuidadora Demo',   apellidos: 'Test',                  email: 'cuidadora@test.com' },
  { nombres: 'Lucía Fernanda',   apellidos: 'Martínez Ríos',         email: 'luciamartinez.cuidadora@gmail.com' },
  { nombres: 'Carmen Rosa',      apellidos: 'Rodríguez Paredes',    email: 'carmen.rodriguez@outlook.com' },
  { nombres: 'Katherine Lizeth', apellidos: 'García Huamán',        email: 'katherine.garcia@yahoo.com' },
  { nombres: 'Verónica Beatriz', apellidos: 'Morales Castillo',     email: 'vero.morales@icloud.com' },
  { nombres: 'Milagros del Carmen', apellidos: 'Torres Quispe',     email: 'milagrostorres.cuidadora@gmail.com' },
  { nombres: 'Diana Carolina',   apellidos: 'Ramos Salazar',        email: 'dianaramos@hotmail.com' },
  { nombres: 'Andrea Paola',     apellidos: 'Vargas Mendoza',       email: 'andrea.vargas@gmail.com' },
  { nombres: 'Natalia Belén',    apellidos: 'Sánchez Guerrero',     email: 'nataliasanchez@outlook.com' },
  { nombres: 'Mónica Patricia',  apellidos: 'Castro Campos',        email: 'monica.castro@yahoo.com' },
  { nombres: 'Rosa Alejandra',   apellidos: 'Flores Rojas',         email: 'rosa.flores.cuidadora@gmail.com' },
];

const zonas = ['Trujillo Centro', 'Víctor Larco', 'La Esperanza', 'Moche', 'Buenos Aires'];
const diagnosticoList = ['TEA', 'TDAH', 'Síndrome de Down', 'Discapacidad Motriz', null, null, null];
const nombresNinos = ['Mateo', 'Sofía', 'Liam', 'Valentina', 'Sebastián', 'Emilia', 'Benjamín', 'Camila', 'Lucas', 'Isabella', 'Santiago', 'Martina', 'Daniel', 'Victoria', 'Gabriel', 'Thiago', 'Mía', 'Joaquín', 'Julieta', 'Bruno'];
const tiposServicio = ['Cuidado domiciliario', 'Acompañamiento escolar', 'Terapia de estimulación'];
const especialidadesList = [1, 2, 3, 4, 5];
const areasList = [1, 2, 3];

const mensajesFamilia = [
  'Hola, buenos días. Me interesaría saber si tiene disponibilidad para cuidar a mi hijo.',
  'Muchas gracias por aceptar. ¿Podemos coordinar los detalles?',
  'Le escribo para confirmar el servicio del día de mañana.',
  '¿Qué tal? Quería saber cómo le fue con mi hijo en la última sesión.',
  'Buenas tardes, necesito cambiar el horario de la próxima semana.',
  'Gracias por su excelente trabajo. Mi hijo está muy contento.',
  'Disculpe la demora, ¿aún tiene disponibilidad para los sábados?',
  'Hola, le escribo porque mi esposo quiere conocerla antes del servicio.',
  'Todo perfecto, muchas gracias por su puntualidad.',
  '¿Podría traer material adicional para la terapia de estimulación?',
  'Mi hijo ha mejorado mucho desde que trabaja con usted. Gracias.',
  'Lamentablemente tendremos que cancelar la cita de mañana por una emergencia familiar.',
];

const mensajesCuidadora = [
  '¡Hola! Claro que sí, tengo disponibilidad. Cuénteme un poco sobre las necesidades de su hijo.',
  'Perfecto, quedo atenta a los detalles. Muchas gracias.',
  'Confirmado, estaré allí a la hora acordada.',
  'La sesión fue muy productiva. Su hijo participó activamente en todas las actividades.',
  'No hay problema, podemos reajustar el horario. ¿Qué le parece el jueves?',
  'Muchas gracias, eso significa mucho para mí.',
  'Sí, claro. Los sábados tengo algunos espacios libres por la mañana.',
  'Por supuesto, será un gusto conocerlo. ¿Qué día les parece bien?',
  'Gracias a usted por confiar en mi trabajo.',
  'Sí, llevaré algunos materiales nuevos que pueden serle de mucha utilidad.',
  'Me alegra mucho escuchar eso. Es un niño muy especial y talentoso.',
  'Entiendo, lamento mucho escuchar eso. Espero que todo se resuelva bien.',
];

const comentariosResenaBuena = [
  'Excelente profesional, dedicada y con mucha paciencia. Mi hijo la adora.',
  'Muy responsable y puntual. Se nota que ama lo que hace.',
  'Gran apoyo para nuestra familia. Ha sido un antes y después en el desarrollo de nuestro hijo.',
  'La recomiendo ampliamente. Tiene una vocación increíble para el cuidado infantil.',
  'Mi hijo ha progresado muchísimo desde que trabaja con ella. Estamos muy agradecidos.',
  'Muy atenta y cariñosa con los niños. Súper recomendada.',
  'Profesional comprometida y con excelentes habilidades de comunicación.',
  'Cumplió con todo lo acordado. Muy buena experiencia.',
  'Llegó puntual y se adaptó rápidamente a las necesidades de mi hijo. Una bendición.',
  'Excelente trato y preparación. Volveremos a contratar sus servicios sin dudarlo.',
];

const comentariosResenaMala = [
  'Llegaba tarde con frecuencia. No cumplió con el horario acordado.',
  'No se adaptó al perfil de mi hijo. Tuvimos que cambiar de cuidadora.',
  'Faltó a varias sesiones sin previo aviso. Poco profesional.',
  'La comunicación fue difícil. No respondía los mensajes a tiempo.',
];

export function seed(db) {
  const hasOldData = db.prepare("SELECT COUNT(*) AS c FROM Usuarios WHERE Email LIKE '%cuidadora%' OR Email LIKE '%familia%'").get().c > 1;

  const ALL_TABLES = ['Incidencias', 'Notificaciones', 'DocumentosPostulacion', 'Postulaciones', 'Pagos', 'Menores', 'Ordenes', 'Mensajes', 'Conversaciones', 'Citas', 'Favoritos', 'Resenas', 'CuidadoraCertificaciones', 'CuidadoraFormacion', 'CuidadoraDocumentos', 'CuidadoraAreas', 'CuidadoraEspecialidades', 'Cuidadoras', 'Usuarios'];

  if (hasOldData) {
    console.log('🗑️  Detectados datos con formato antiguo. Limpiando y regenerando...');
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

  // Hijos de cada familia
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

  // Perfiles de cuidadoras (con datos realistas)
  const perfiles = [
    { exp: 12, tarifa: 42, zona: 'Víctor Larco',    descCorta: 'Especialista en TEA con 12 años de experiencia.', descLarga: 'Trabajo con niños dentro del espectro autista usando técnicas ABA y de integración sensorial. Formación continua en terapias modernas.' },
    { exp: 8,  tarifa: 35, zona: 'Trujillo Centro',  descCorta: 'Profesional en Estimulación Temprana.',         descLarga: 'Apasionada por el desarrollo infantil temprano. Certificada en primeros auxilios y terapia de lenguaje básica.' },
    { exp: 15, tarifa: 50, zona: 'La Esperanza',     descCorta: 'Psicóloga infantil con amplia trayectoria.',     descLarga: 'Más de 15 años trabajando con niños con necesidades especiales. Experta en TDAH y trastornos de conducta.' },
    { exp: 5,  tarifa: 30, zona: 'Moche',            descCorta: 'Cuidadora paciente y creativa.',                 descLarga: 'Joven profesional con energía y dedicación. Especializada en terapia ocupacional y juegos didácticos.' },
    { exp: 10, tarifa: 40, zona: 'Buenos Aires',     descCorta: 'Especialista en Síndrome de Down.',            descLarga: 'Amplia experiencia en inclusión y estimulación de niños con Síndrome de Down. Talleres de integración social.' },
    { exp: 7,  tarifa: 38, zona: 'Trujillo Centro',  descCorta: 'Terapeuta de lenguaje y aprendizaje.',          descLarga: 'Licenciada en Educación Especial con enfoque en comunicación aumentativa y alternativa.' },
    { exp: 20, tarifa: 55, zona: 'Víctor Larco',     descCorta: 'Maestra de educación especial jubilada.',       descLarga: 'Una vida dedicada a la enseñanza. Experta en diseño de planes de intervención individualizados.' },
    { exp: 3,  tarifa: 28, zona: 'La Esperanza',     descCorta: 'Cuidadora con vocación y calidez.',             descLarga: 'Iniciando mi carrera pero con enorme compromiso. Certificada en RCP y primeros auxilios infantiles.' },
    { exp: 6,  tarifa: 35, zona: 'Moche',            descCorta: 'Especialista en discapacidad motriz.',          descLarga: 'Experiencia en fisioterapia infantil y estimulación sensorial. Trabajo con niños con parálisis cerebral.' },
    { exp: 9,  tarifa: 45, zona: 'Buenos Aires',     descCorta: 'Profesional integral en cuidado infantil.',      descLarga: 'Combinación de formación en psicología y educación especial. Terapias personalizadas según cada niño.' },
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
        pick(['Educación Especial', 'Psicología Infantil', 'Terapia Ocupacional', 'Educación Inicial']),
        pick(['Universidad Nacional de Trujillo', 'Universidad Privada Antenor Orrego', 'Instituto Superior Pedagógico']),
        rand(2008, 2022));
      db.prepare('INSERT INTO CuidadoraCertificaciones (IdCuidadora, Nombre, EntidadEmisora, FechaObtencion) VALUES (?, ?, ?, ?)').run(cId,
        pick(['Curso de Intervención en TEA', 'RCP y Primeros Auxilios', 'Estimulación Temprana', 'Terapia de Lenguaje Básico']),
        pick(['MINSA', 'Cruz Roja Peruana', 'Instituto Peruano de Educación Especial']),
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

  // ========== 4. ÓRDENES (60-70 distribuidas en 365 días) ==========
  // Asigno a cada familia un nivel de uso: algunas usan más, otras menos
  const nivelesUso = [12, 8, 6, 5, 7, 4, 3, 9, 5, 2, 4, 6, 3, 1, 2]; // total ~77
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

        // El estado depende de qué tan antiguo es
        let estado;
        if (diasAgo > 180) estado = 'Finalizada';           // > 6 meses: todo finalizado
        else if (diasAgo > 60) estado = pick(['Finalizada', 'Finalizada', 'Finalizada', 'Cancelada']);
        else if (diasAgo > 15) estado = pick(['Finalizada', 'En curso', 'Cancelada']);
        else estado = pick(['Pendiente', 'Confirmada', 'En curso', 'Cancelada']);

        const fechaCreacion = dateTimeStr(diasAgo + rand(3, 10)); // creada días antes del servicio
        const r = db.prepare(`INSERT INTO Ordenes (IdCuidadora, IdUsuarioFamilia, TipoServicio, FechaServicio, TotalHoras, TarifaHora, Subtotal, TarifaPlataforma, Total, Estado, FechaCreacion, IdMenor, HoraInicio, HoraFin)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(c.Id, f.Id,
          pick(tiposServicio), fechaOrd, horas, +tarifa.toFixed(2), subtotal, plataforma, total, estado, fechaCreacion, menor?.Id || null, horaInicio, horaFin);
        ordenGlobalIdx++;
      }
    }

    // Pagos: uno por cada orden no cancelada, con fecha posterior a la orden
    const ordenes = db.prepare("SELECT Id, Total, FechaCreacion FROM Ordenes WHERE Estado != 'Cancelada'").all();
    for (const o of ordenes) {
      const diasPago = rand(0, 5);
      const fecBase = new Date(o.FechaCreacion.replace(' ', 'T'));
      fecBase.setDate(fecBase.getDate() + diasPago);
      const fecPago = fecBase.toISOString().slice(0, 19).replace('T', ' ');
      db.prepare('INSERT INTO Pagos (IdOrden, Monto, MetodoPago, Estado, FechaPago) VALUES (?, ?, ?, ?, ?)').run(o.Id, o.Total, pick(['Tarjeta', 'Yape', 'Transferencia', 'Efectivo']), 'Completado', fecPago);
    }
  }

  // ========== 5. RESEÑAS (una por orden finalizada) ==========
  if (db.prepare('SELECT COUNT(*) AS c FROM Resenas').get().c === 0) {
    const ordenesFinalizadas = db.prepare('SELECT o.Id, o.IdCuidadora, o.IdUsuarioFamilia, o.FechaServicio FROM Ordenes o WHERE o.Estado = ? OR o.Estado = ?').all('Finalizada', 'En curso');
    // Reseña para la mayoría (80%) de órdenes finalizadas
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
    // Actualizar promedios de cuidadoras
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
        const tipo = pick(['recordatorio', 'mensaje', 'pago', 'reseña']);
        const titulos = {
          recordatorio: 'Recordatorio de cita',
          mensaje: 'Nuevo mensaje recibido',
          pago: 'Pago confirmado',
          reseña: 'Nueva reseña recibida',
        };
        const descs = {
          recordatorio: 'Tienes una cita programada para mañana.',
          mensaje: 'Has recibido un nuevo mensaje en tu bandeja.',
          pago: 'Tu pago ha sido procesado exitosamente.',
          reseña: 'Una familia ha dejado una reseña sobre tu servicio.',
        };
        db.prepare('INSERT INTO Notificaciones (IdUsuarioDestino, Titulo, Descripcion, Tipo, Leido, FechaCreacion) VALUES (?, ?, ?, ?, ?, ?)').run(uid,
          titulos[tipo], descs[tipo], tipo, diasAgo > 30 ? 1 : rand(0, 1), dateTimeStr(diasAgo));
      }
    }
  }

  // ========== 9. INCIDENCIAS ==========
  const descsInc = [
    'La cuidadora llegó 45 minutos tarde sin avisar. El menor quedó solo durante ese tiempo.',
    'La familia no entregó los materiales de terapia acordados para la sesión.',
    'Se reportó un leve retraso de 10 minutos. Sin mayor impacto en el servicio.',
    'El menor presentó una crisis de ansiedad durante la sesión. La cuidadora siguió el protocolo.',
    'Hubo un malentendido con el horario acordado. Se resolvió conversando.',
    'Desacuerdo sobre la metodología de estimulación aplicada. Se programó reunión.',
    'La cuidadora reportó que el hogar no contaba con las condiciones mínimas de seguridad.',
  ];
  if (db.prepare('SELECT COUNT(*) AS c FROM Incidencias').get().c === 0) {
    const ordenes = db.prepare('SELECT Id, IdCuidadora, IdUsuarioFamilia FROM Ordenes ORDER BY Id').all();
    const paresInc = [
      { ordenIdx: 9,  tipo: 'Grave',    estado: 'Abierta' },
      { ordenIdx: 0,  tipo: 'Moderada', estado: 'Abierta' },
      { ordenIdx: 38, tipo: 'Leve',     estado: 'En revisión' },
      { ordenIdx: 10, tipo: 'Leve',     estado: 'En revisión' },
      { ordenIdx: 17, tipo: 'Leve',     estado: 'En revisión' },
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
      ['Antecedentes PNP', '340 KB'],
      ['Certificado Salud', '210 KB'],
      ['Certificado Estudios', '180 KB'],
      ['Carta Presentacion', '95 KB'],
    ];
    const estadosPos = ['Pendiente', 'Pendiente', 'Rechazada', 'Rechazada', 'Aprobada', 'Aprobada', 'Pendiente', 'Aprobada', 'Aprobada', 'Rechazada', 'Pendiente'];
    const motivosRechazo = [
      'Documentos incompletos: falta certificado de antecedentes penales vigente.',
      'No cumple con el mínimo de 3 años de experiencia requerido.',
      'Antecedentes penales no verificables con la PNP.',
    ];
    const docsMotivoRechazo = {
      'DNI': 'Documento ilegible, no se puede confirmar identidad.',
      'Antecedentes PNP': 'Certificado vencido, no coincide con la consulta en línea.',
      'Certificado Salud': 'Certificado tiene más de 6 meses de antigüedad.',
      'Certificado Estudios': 'Título no corresponde a institución reconocida por MINEDU.',
      'Carta Presentacion': 'Carta no está firmada ni tiene datos de contacto verificables.',
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
        const nombreArchivo = `${tipo.toLowerCase().replace(/[\sáéíóú]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '')}_${u.Nombres.split(' ')[0].toLowerCase()}_${u.Apellidos.toLowerCase()}.pdf`;
        db.prepare('INSERT INTO DocumentosPostulacion (IdPostulacion, TipoRequisito, NombreArchivo, Peso, Estado, MotivoRechazo) VALUES (?, ?, ?, ?, ?, ?)').run(r.lastInsertRowid, tipo, nombreArchivo, peso, docEstado, docMotivo);
      }
    }
  }

  // ========== 11. REPORTE ==========
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
  console.log('✅ Datos demo generados con aspecto real:');
  Object.entries(stats).forEach(([k, v]) => console.log(`   ${k}: ${v}`));
}

if (process.argv[1] && (process.argv[1].endsWith('seed-data.mjs') || process.argv[1].endsWith('seed-data'))) {
  const db = getDb();
  seed(db);
  closeDb();
}
