import bcrypt from 'bcryptjs';
import { getDb, closeDb } from './db.js';
import { setupDatabase } from './setup.js';

const HASHED_PASSWORD = bcrypt.hashSync('123456', 10);

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
  // Enriched: casos reales
  { nombres: 'Maria Teresa',  apellidos: 'Torres Garcia',        email: 'familia.torres@certinanas.pe' },
  { nombres: 'Carolina',      apellidos: 'Rojas Mendoza',        email: 'familia.rojas@certinanas.pe' },
  { nombres: 'Fernando',      apellidos: 'Ruiz Flores',          email: 'familia.ruiz@certinanas.pe' },
  { nombres: 'Patricia',      apellidos: 'Sanchez Morales',      email: 'familia.sanchez@certinanas.pe' },
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
  // Enriched: casos reales
  { nombres: 'Ana',             apellidos: 'Perez Lopez',           email: 'ana.perez.cuidadora@certinanas.pe' },
  { nombres: 'Maria del Rosario',apellidos: 'Cardenas Vega',        email: 'maria.cardenas@certinanas.pe' },
  { nombres: 'Elena Beatriz',   apellidos: 'Salazar Rios',         email: 'elena.salazar@certinanas.pe' },
  { nombres: 'Paola Andrea',    apellidos: 'Mendoza Torres',       email: 'paola.mendoza@certinanas.pe' },
  { nombres: 'Ruth Noemi',      apellidos: 'Paredes Lozano',       email: 'ruth.paredes@certinanas.pe' },
  { nombres: 'Cinthya',         apellidos: 'Villegas Nuñez',       email: 'cinthya.villegas@certinanas.pe' },
  { nombres: 'Gloria Marlene',  apellidos: 'Soto Huaman',          email: 'gloria.soto@certinanas.pe' },
  { nombres: 'Jessica Paola',   apellidos: 'Quispe Condori',       email: 'jessica.quispe@certinanas.pe' },
  { nombres: 'Liliana',         apellidos: 'Maldonado Rivas',      email: 'liliana.maldonado@certinanas.pe' },
  { nombres: 'Sandra',          apellidos: 'Guerrero Luna',        email: 'sandra.guerrero@certinanas.pe' },
  { nombres: 'Tatiana',         apellidos: 'Cruzado Medina',       email: 'tatiana.cruzado@certinanas.pe' },
  { nombres: 'Vanessa',         apellidos: 'Vega Paredes',         email: 'vanessa.vega@certinanas.pe' },
  { nombres: 'Rossana',         apellidos: 'Diaz Saldivar',        email: 'rossana.diaz@certinanas.pe' },
  { nombres: 'Fiorella',        apellidos: 'Rivas Guerrero',       email: 'fiorella.rivas@certinanas.pe' },
  { nombres: 'Daniela',         apellidos: 'Torres Gomez',         email: 'daniela.torres@certinanas.pe' },
  { nombres: 'Brenda',          apellidos: 'Carrasco Zevallos',    email: 'brenda.carrasco@certinanas.pe' },
  { nombres: 'Karla',           apellidos: 'Sanchez Prada',        email: 'karla.sanchez@certinanas.pe' },
  { nombres: 'Ingrid',          apellidos: 'Nuñez Bellido',        email: 'ingrid.nunez@certinanas.pe' },
  { nombres: 'Margarita',       apellidos: 'Espinoza Rojas',       email: 'margarita.espinoza@certinanas.pe' },
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
      db.prepare('INSERT INTO Usuarios (Email, PasswordHash, Nombres, Apellidos, NumeroDocumento, Telefono, IdRol, TerminosAceptados, FechaCreacion) VALUES (?, ?, ?, ?, ?, ?, 2, 1, ?)').run(f.email, HASHED_PASSWORD, f.nombres, f.apellidos, dni, tel, dateTimeStr(rand(300, 365)));
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
      db.prepare('INSERT INTO Usuarios (Email, PasswordHash, Nombres, Apellidos, NumeroDocumento, Telefono, IdRol, TerminosAceptados, FechaCreacion) VALUES (?, ?, ?, ?, ?, ?, 3, 1, ?)').run(c.email, HASHED_PASSWORD, c.nombres, c.apellidos, dni, tel, dateTimeStr(rand(300, 365)));
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
  // Enriched perfiles for real cases
  { exp: 7,  tarifa: 23, zona: 'Trujillo Centro',  descCorta: 'Especialista en TEA con enfoque ABA.',          descLarga: 'Certificada en analisis conductual aplicado para ninos con TEA. Experiencia en terapia de lenguaje y habilidades sociales.' },
  { exp: 5,  tarifa: 25, zona: 'La Esperanza',     descCorta: 'Terapeuta ocupacional con experiencia en TDAH.',descLarga: 'Formacion en integracion sensorial y manejo conductual para ninos con deficit de atencion. Tecnicas de refuerzo positivo.' },
  { exp: 9,  tarifa: 30, zona: 'Victor Larco',     descCorta: 'Profesional en estimulacion temprana.',          descLarga: 'Experta en desarrollo de autonomia para ninos con Sindrome de Down. Talleres de habilidades sociales e inclusion.' },
  { exp: 11, tarifa: 35, zona: 'Moche',            descCorta: 'Fisioterapeuta infantil especializada.',         descLarga: 'Amplia experiencia en rehabilitacion motriz y acompanamiento a ninos con paralisis cerebral y discapacidad motriz.' },
  { exp: 4,  tarifa: 22, zona: 'Buenos Aires',     descCorta: 'Cuidadora carinosa con enfoque ludico.',         descLarga: 'Joven profesional con vocacion de servicio. Capacitada en primeros auxilios y manejo de conductas desafiantes.' },
  { exp: 14, tarifa: 40, zona: 'Trujillo Centro',  descCorta: 'Psicopedagoga con amplia trayectoria.',          descLarga: 'Mas de 14 anos apoyando a ninos con necesidades educativas especiales. Evaluaciones funcionales y planes individualizados.' },
  { exp: 6,  tarifa: 28, zona: 'La Esperanza',     descCorta: 'Especialista en lenguaje y comunicacion.',       descLarga: 'Licenciada en terapia de lenguaje con enfoque en comunicacion aumentativa. Trabajo con ninos no verbales y sus familias.' },
  { exp: 18, tarifa: 50, zona: 'Victor Larco',     descCorta: 'Educadora especial con amplia experiencia.',     descLarga: 'Toda una vida dedicada a la educacion inclusiva. Experta en diseno de materiales adaptados y curriculos flexibles.' },
  { exp: 3,  tarifa: 20, zona: 'Moche',            descCorta: 'Cuidadora entusiasta y creativa.',              descLarga: 'Iniciando carrera con gran entusiasmo. Talleres de arte-terapia y musicoterapia para ninos con necesidades especiales.' },
  { exp: 8,  tarifa: 32, zona: 'Buenos Aires',     descCorta: 'Terapeuta integral en neurodesarrollo.',        descLarga: 'Combinacion de terapia ocupacional y psicologia. Programas de estimulacion temprana personalizados por nino.' },
  { exp: 10, tarifa: 38, zona: 'Trujillo Centro',  descCorta: 'Especialista en conducta y aprendizaje.',        descLarga: 'Enfoque en terapia cognitivo-conductual para ninos con TDAH y trastornos del neurodesarrollo. Trabajo colaborativo con escuelas.' },
  { exp: 5,  tarifa: 25, zona: 'La Esperanza',     descCorta: 'Profesional en inclusion educativa.',            descLarga: 'Experiencia en acompanamiento escolar inclusivo y adaptacion curricular. Manejo de grupos heterogeneos.' },
  { exp: 16, tarifa: 48, zona: 'Victor Larco',     descCorta: 'Maestra de educacion especial jubilada activa.',descLarga: 'Jubilada activa con 16 anos de experiencia. Apasionada por la ensenanza multisensorial y el aprendizaje a traves del juego.' },
  { exp: 7,  tarifa: 33, zona: 'Moche',            descCorta: 'Terapeuta de lenguaje y aprendizaje.',          descLarga: 'Especialista en trastornos de la comunicacion. Trabajo con sistemas PECS y dispositivos de comunicacion aumentativa.' },
  { exp: 4,  tarifa: 24, zona: 'Buenos Aires',     descCorta: 'Cuidadora paciente y dedicada.',                descLarga: 'Con experiencia en cuidado de ninos con TEA y TDAH. Certificada en RCP pediatrico y manejo de crisis.' },
  { exp: 12, tarifa: 38, zona: 'Trujillo Centro',  descCorta: 'Coordinadora de centros de estimulacion.',      descLarga: 'Experiencia liderando equipos de estimulacion temprana. Enfoque en evaluacion del desarrollo y derivacion oportuna.' },
  { exp: 6,  tarifa: 28, zona: 'La Esperanza',     descCorta: 'Cuidadora con experiencia en discapacidad.',    descLarga: 'Trabajo con ninos con paralisis cerebral y otras discapacidades motoras. Tecnicas de posicionamiento y movilizacion.' },
  { exp: 9,  tarifa: 30, zona: 'Victor Larco',     descCorta: 'Especialista en ninos con Sindrome de Down.',  descLarga: 'Amplia experiencia en programas de autonomia y vida diaria para ninos con Sindrome de Down. Terapia ocupacional.' },
  { exp: 5,  tarifa: 26, zona: 'Moche',            descCorta: 'Cuidadora con vocacion educativa.',              descLarga: 'Formacion en educacion inicial con especializacion en inclusion. Actividades ludico-educativas personalizadas.' },
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
      ['Antecedentes penales', '340 KB'],
      ['Certificado de salud', '210 KB'],
      ['Titulo profesional', '180 KB'],
      ['Carta de presentacion', '95 KB'],
    ];
    const estadosPos = ['Pendiente', 'Pendiente', 'Rechazada', 'Rechazada', 'Aprobada', 'Aprobada', 'Pendiente', 'Aprobada', 'Aprobada', 'Rechazada', 'Pendiente', 'Pendiente', 'Aprobada', 'Rechazada', 'Aprobada', 'Pendiente', 'Rechazada', 'Pendiente', 'Aprobada', 'Aprobada', 'Pendiente', 'Rechazada', 'Pendiente', 'Aprobada', 'Aprobada', 'Pendiente', 'Pendiente', 'Rechazada', 'Rechazada', 'Aprobada'];
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
          const diasCap = rand(10, 60);
          db.prepare(`INSERT OR IGNORE INTO ProgresoCapacitacion (IdCuidadora, IdCapacitacion, PuntajeObtenido, Aprobado, CertificadoGenerado, CertificadoUrl, FechaCompletado) VALUES (?, ?, ?, ?, ?, ?, datetime('now', '-${diasCap} days'))`).run(
            c.Id, cap.Id, puntaje, aprobado, aprobado,
            aprobado ? `/certificados/${c.Nombres.toLowerCase()}_${cap.Id}.pdf` : null
          );
        }
      }
    }
  }

  // ========== 17-25. Admin demo data (wrapped in try-catch per section) ==========
  try {
    if (db.prepare('SELECT COUNT(*) AS c FROM Negociaciones').get().c === 0) {
      const ordenesPendientes = db.prepare("SELECT Id, IdCuidadora, IdUsuarioFamilia, TarifaHora, TotalHoras FROM Ordenes LIMIT 8").all();
      const familias = db.prepare('SELECT Id FROM Usuarios WHERE IdRol = 2').all();
      for (const o of ordenesPendientes) {
        const propPor = Math.random() > 0.5 ? o.IdUsuarioFamilia : (familias[0]?.Id || o.IdUsuarioFamilia);
        const diasNeg = Math.floor(Math.random() * 15) + 1;
        db.prepare(`INSERT INTO Negociaciones (IdOrden, IdPropuestoPor, TarifaHora, TotalHoras, Mensaje, Estado, FechaCreacion, Propuestas) VALUES (?, ?, ?, ?, ?, ?, datetime('now', '-${diasNeg} days'), ?)`).run(
          o.Id, propPor,
          o.TarifaHora + (Math.random() - 0.5) * 10,
          o.TotalHoras + (Math.random() - 0.5) * 2,
          Math.random() > 0.5 ? 'Solicito ajustar la tarifa por el tipo de cuidado requerido.' : 'Acepto las condiciones propuestas.',
          Math.random() > 0.3 ? 'activa' : 'aceptada',
          JSON.stringify([{ propuesta: 'Tarifa: S/ ' + (o.TarifaHora + (Math.random() - 0.5) * 10).toFixed(2), estado: 'pendiente' }])
        );
      }
    }
  } catch(e) { console.log('Seed 17 (Negociaciones) omitido:', e.message); }

  try {
    if (db.prepare('SELECT COUNT(*) AS c FROM Escrow').get().c === 0) {
      const ordenes = db.prepare("SELECT Id, Total FROM Ordenes WHERE Estado NOT IN ('Cancelada', 'Pendiente') LIMIT 15").all();
      for (const o of ordenes) {
        const montoTotal = o.Total;
        const montoCuidadora = +(montoTotal * 0.85).toFixed(2);
        const montoPlataforma = +(montoTotal * 0.15).toFixed(2);
        const diasEsc = Math.floor(Math.random() * 60) + 1;
        db.prepare(`INSERT INTO Escrow (IdOrden, MontoTotal, MontoCuidadora, MontoPlataforma, Estado, FechaCreacion) VALUES (?, ?, ?, ?, ?, datetime('now', '-${diasEsc} days'))`).run(
          o.Id, montoTotal, montoCuidadora, montoPlataforma,
          Math.random() > 0.6 ? 'Liberado' : 'Retenido'
        );
      }
    }
  } catch(e) { console.log('Seed 18 (Escrow) omitido:', e.message); }

  try {
    if (db.prepare('SELECT COUNT(*) AS c FROM Contratos').get().c === 0) {
      const ordenes = db.prepare("SELECT Id FROM Ordenes WHERE Estado NOT IN ('Cancelada') LIMIT 10").all();
      for (const o of ordenes) {
        const diasCont = Math.floor(Math.random() * 30) + 1;
        db.prepare(`INSERT INTO Contratos (IdOrden, Terminos, AceptadoFamilia, AceptadoCuidadora, FechaCreacion) VALUES (?, ?, ?, ?, datetime('now', '-${diasCont} days'))`).run(
          o.Id, 'Terminos y condiciones estandar de servicio de cuidado infantil.',
          Math.random() > 0.2 ? 1 : 0, Math.random() > 0.2 ? 1 : 0
        );
      }
    }
  } catch(e) { console.log('Seed 19 (Contratos) omitido:', e.message); }

  try {
    if (db.prepare('SELECT COUNT(*) AS c FROM MetricasAnalytics').get().c === 0) {
      const stmt = db.prepare("INSERT INTO MetricasAnalytics (Tipo, Clave, Valor, Periodo, FechaRegistro) VALUES (?, ?, ?, ?, datetime('now'))");
      for (const [tipo, clave, valor, periodo] of [
        ['servicios', 'activos', 12, '2026-06'],
        ['servicios', 'completados_mes', 45, '2026-06'],
        ['servicios', 'cancelados_mes', 5, '2026-06'],
        ['ingresos', 'total_mes', 28500, '2026-06'],
        ['ingresos', 'comisiones_mes', 4275, '2026-06'],
        ['escrow', 'recaudado_mes', 32000, '2026-06'],
        ['escrow', 'liberado_mes', 18000, '2026-06'],
        ['usuarios', 'familias_activas', 45, '2026-06'],
        ['usuarios', 'cuidadoras_activas', 38, '2026-06'],
        ['postulaciones', 'nuevas_mes', 15, '2026-06'],
        ['postulaciones', 'aprobadas_mes', 8, '2026-06'],
      ]) stmt.run(tipo, clave, valor, periodo);
    }
  } catch(e) { console.log('Seed 20 (MetricasAnalytics) omitido:', e.message); }

  try {
    if (db.prepare('SELECT COUNT(*) AS c FROM PrediccionRiesgos').get().c === 0) {
      const ordenes = db.prepare("SELECT Id FROM Ordenes LIMIT 10").all();
      for (const o of ordenes) {
        const score = Math.floor(Math.random() * 100);
        const variables = JSON.stringify([
          { variable: 'Antiguedad cuidadora', peso: Math.floor(Math.random() * 30) + 10 },
          { variable: 'Historial de incidencias', peso: Math.floor(Math.random() * 25) },
          { variable: 'Tiempo desde ultima resena', peso: Math.floor(Math.random() * 20) },
          { variable: 'Consistencia de horarios', peso: Math.floor(Math.random() * 15) },
        ]);
        const diasPred = Math.floor(Math.random() * 45) + 1;
        db.prepare(`INSERT INTO PrediccionRiesgos (IdOrden, NivelRiesgo, PuntajeRiesgo, VariablesAnalizadas, AlertaGenerada, FechaCreacion) VALUES (?, ?, ?, ?, ?, datetime('now', '-${diasPred} days'))`).run(
          o.Id, score >= 50 ? 'Alto' : score >= 25 ? 'Medio' : 'Bajo', score, variables, score >= 25 ? 1 : 0
        );
      }
    }
  } catch(e) { console.log('Seed 21 (PrediccionRiesgos) omitido:', e.message); }

  try {
    if (db.prepare('SELECT COUNT(*) AS c FROM CuidadoraDocumentos').get().c === 0) {
      const cuidadoras = db.prepare('SELECT Id FROM Cuidadoras LIMIT 5').all();
      for (const c of cuidadoras) {
        for (const tipo of ['DNI', 'Antecedentes penales', 'Certificado de salud', 'Titulo profesional', 'Carta de presentacion']) {
          const archivo = tipo.toLowerCase().replace(/\s+/g, '_') + '_cuidadora_' + c.Id + '.pdf';
          db.prepare("INSERT INTO CuidadoraDocumentos (IdCuidadora, TipoDocumento, NombreArchivo, RutaArchivo, Verificado) VALUES (?, ?, ?, ?, ?)").run(
            c.Id, tipo, archivo, '/uploads/cuidadora/' + archivo, Math.random() > 0.3 ? 1 : 0
          );
        }
      }
    }
  } catch(e) { console.log('Seed 22 (CuidadoraDocumentos) omitido:', e.message); }

  try {
    if (db.prepare('SELECT COUNT(*) AS c FROM Incidentes').get().c === 0) {
      const ordenes = db.prepare("SELECT Id, IdCuidadora FROM Ordenes WHERE Estado IN ('En curso', 'Finalizada') LIMIT 5").all();
      for (const o of ordenes) {
        const diasInc = Math.floor(Math.random() * 30) + 1;
        db.prepare(`INSERT INTO Incidentes (IdOrden, IdUsuarioReporta, Latitud, Longitud, Tipo, Estado, Descripcion, FechaActivacion) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now', '-${diasInc} days'))`).run(
          o.Id, Math.floor(Math.random() * 10) + 2,
          -8.1 + Math.random() * 0.05, -79.0 + Math.random() * 0.05,
          Math.random() > 0.7 ? 'Emergencia' : 'Panico',
          Math.random() > 0.5 ? 'Resuelto' : 'Activo',
          'Incidente reportado durante la sesion de cuidado.'
        );
      }
    }
  } catch(e) { console.log('Seed 23 (Incidentes) omitido:', e.message); }

  try {
    if (db.prepare('SELECT COUNT(*) AS c FROM ContratosDigitales').get().c === 0) {
      const ordenes = db.prepare("SELECT Id FROM Ordenes WHERE Estado NOT IN ('Cancelada') LIMIT 5").all();
      for (const o of ordenes) {
        const codigo = 'CT-' + String(o.Id).padStart(4, '0') + '-' + String(Math.floor(Math.random() * 9000) + 1000);
        const diasCd = Math.floor(Math.random() * 15) + 1;
        db.prepare(`INSERT INTO ContratosDigitales (IdOrden, CodigoContrato, FechaEmision, Estado, FechaCreacion) VALUES (?, ?, datetime('now', '-${diasCd} days'), ?, datetime('now', '-${diasCd} days'))`).run(
          o.Id, codigo,
          Math.random() > 0.5 ? 'Completado' : 'Pendiente'
        );
      }
    }
  } catch(e) { console.log('Seed 24 (ContratosDigitales) omitido:', e.message); }

  try {
    if (db.prepare('SELECT COUNT(*) AS c FROM ReemplazoEmergencia').get().c === 0) {
      const ordenes = db.prepare("SELECT Id, IdCuidadora FROM Ordenes LIMIT 3").all();
      for (const o of ordenes) {
        const diasReemp = Math.floor(Math.random() * 20) + 1;
        db.prepare(`INSERT INTO ReemplazoEmergencia (IdOrden, IdCuidadoraOriginal, Motivo, Estado, TiempoBusquedaSegundos, FechaCreacion) VALUES (?, ?, ?, ?, ?, datetime('now', '-${diasReemp} days'))`).run(
          o.Id, o.IdCuidadora,
          Math.random() > 0.5 ? 'Emergencia familiar de la cuidadora' : 'Cuidadora reporta malestar repentino',
          Math.random() > 0.7 ? 'Encontrado' : 'Buscando', Math.floor(Math.random() * 3600) + 120
        );
      }
    }
  } catch(e) { console.log('Seed 25 (ReemplazoEmergencia) omitido:', e.message); }

  // ========== 26. ENRIQUECIDO: CASOS ESTRUCTURADOS ==========
  try {
    const getEmailId = (email) => db.prepare('SELECT Id FROM Usuarios WHERE Email = ?').get(email)?.Id;
    const getCuiId = (email) => db.prepare('SELECT c.Id FROM Cuidadoras c INNER JOIN Usuarios u ON u.Id = c.IdUsuario WHERE u.Email = ?').get(email)?.Id;
    const getFamId = db.prepare('SELECT Id FROM Usuarios WHERE Email = ?');
    const getCui = db.prepare('SELECT c.Id, c.IdUsuario FROM Cuidadoras c INNER JOIN Usuarios u ON u.Id = c.IdUsuario WHERE u.Email = ?');

    const torresFam = getFamId.get('familia.torres@certinanas.pe')?.Id;
    const rojasFam  = getFamId.get('familia.rojas@certinanas.pe')?.Id;
    const ruizFam   = getFamId.get('familia.ruiz@certinanas.pe')?.Id;
    const sanchezFam= getFamId.get('familia.sanchez@certinanas.pe')?.Id;

    // --- Menores especificos ---
    const menoresIns = db.prepare('INSERT OR IGNORE INTO Menores (IdUsuarioFamilia, Nombre, Diagnostico, FechaNacimiento) VALUES (?, ?, ?, ?)');
    const getMenor = db.prepare('SELECT Id FROM Menores WHERE IdUsuarioFamilia = ? AND Nombre = ?');
    if (torresFam) {
      menoresIns.run(torresFam, 'Mateo Torres Garcia', 'Trastorno del Espectro Autista (TEA) Nivel 1', '2019-03-15');
    }
    if (rojasFam) {
      menoresIns.run(rojasFam, 'Valentina Rojas Mendoza', 'Trastorno por Deficit de Atencion e Hiperactividad (TDAH)', '2020-07-22');
    }
    if (ruizFam) {
      menoresIns.run(ruizFam, 'Sebastian Ruiz Flores', 'Sindrome de Down', '2018-11-08');
    }
    if (sanchezFam) {
      menoresIns.run(sanchezFam, 'Diego Sanchez Morales', 'Paralisis Cerebral Leve', '2019-05-30');
    }

    const mateoId   = getMenor.get(torresFam, 'Mateo Torres Garcia')?.Id;
    const valentinaId = getMenor.get(rojasFam, 'Valentina Rojas Mendoza')?.Id;
    const sebastianId = getMenor.get(ruizFam, 'Sebastian Ruiz Flores')?.Id;
    const diegoId   = getMenor.get(sanchezFam, 'Diego Sanchez Morales')?.Id;

    // --- Cuidadoras especificas por email ---
    const ana = getCui.get('ana.perez.cuidadora@certinanas.pe');
    const mariaCardenas = getCui.get('maria.cardenas@certinanas.pe');
    const elena = getCui.get('elena.salazar@certinanas.pe');
    const paola = getCui.get('paola.mendoza@certinanas.pe');
    const ruth = getCui.get('ruth.paredes@certinanas.pe');
    const cinthya = getCui.get('cinthya.villegas@certinanas.pe');
    const gloria = getCui.get('gloria.soto@certinanas.pe');

    // CASO 1: Mateo Torres (TEA) – Orden Pendiente, negociacion activa
    if (mateoId && ana && torresFam) {
      const exO1 = db.prepare('SELECT Id FROM Ordenes WHERE IdMenor = ? AND IdUsuarioFamilia = ?').get(mateoId, torresFam);
      if (!exO1) {
        const r = db.prepare(`INSERT INTO Ordenes (IdCuidadora, IdUsuarioFamilia, TipoServicio, FechaServicio, TotalHoras, TarifaHora, Subtotal, TarifaPlataforma, Total, Estado, FechaCreacion, IdMenor, HoraInicio, HoraFin) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
          ana.Id, torresFam, 'Cuidado en casa', '2026-07-06', 6, 23.00, 138.00, 20.70, 158.70, 'Pendiente', '2026-06-28 10:30:00', mateoId, '08:00', '14:00');
        const o1Id = r.lastInsertRowid;
        const tareas = [
          [1, 'Alimentacion supervisada del menor', '08:00', '09:00'],
          [3, 'Apoyo con tareas escolares y material adaptado', '09:00', '10:30'],
          [4, 'Asistencia en cambio de ropa y aseo personal', '10:30', '11:00'],
          [6, 'Ejercicios de terapia de lenguaje', '11:00', '12:00'],
          [9, 'Juego dirigido estructurado con material sensorial', '12:00', '13:00'],
          [11, 'Supervision durante la siesta del menor', '13:00', '13:30'],
          [13, 'Coordinacion con terapeutas externos', '13:30', '14:00'],
        ];
        for (const [, desc, hi, hf] of tareas)
          db.prepare('INSERT INTO OrdenTareasPersonalizadas (IdOrden, Descripcion) VALUES (?, ?)').run(o1Id, `${hi}-${hf}: ${desc}`);
        // Contrato con terminos completos
        db.prepare(`INSERT OR IGNORE INTO Contratos (IdOrden, Terminos, AceptadoFamilia, AceptadoCuidadora, FechaCreacion) VALUES (?, ?, ?, ?, ?)`).run(o1Id,
          JSON.stringify({ duracion: '3 meses', renovacion: 'automatica', periodoPrueba: 15, clausulaSalida: '7 dias de aviso' }),
          0, 0, '2026-06-28 11:00:00');
        // Negociacion activa (S/20 -> S/25 -> S/23)
        const negMsg = 'Propongo ajustar la tarifa a S/25 por hora debido al nivel de especializacion que requiere el menor con TEA.';
        const aceptMsg = 'Entendemos, pero nuestro presupuesto maximo es S/23 por hora. Podemos aceptar ese monto.';
        db.prepare(`INSERT OR IGNORE INTO Negociaciones (IdOrden, IdPropuestoPor, TarifaHora, TotalHoras, Mensaje, Estado, FechaCreacion, Propuestas) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(
          o1Id, ana.IdUsuario, 25.00, 6, negMsg, 'activa', '2026-06-29 09:15:00',
          JSON.stringify([
            { propuesta: 'Tarifa inicial: S/ 20.00/hora', autor: 'familia', estado: 'rechazada' },
            { propuesta: 'Contrapropuesta: S/ 25.00/hora', autor: 'cuidadora', estado: 'pendiente' },
            { propuesta: 'Contrapropuesta: S/ 23.00/hora', autor: 'familia', estado: 'pendiente' },
          ]));
        // Conversacion y mensajes
        const conv = db.prepare('INSERT OR IGNORE INTO Conversaciones (IdCuidadora, IdUsuarioFamilia, FechaCreacion, FechaUltimoMensaje) VALUES (?, ?, ?, ?)').run(ana.Id, torresFam, '2026-06-29 09:00:00', '2026-07-02 18:30:00');
        const convId = conv.lastInsertRowid || db.prepare('SELECT Id FROM Conversaciones WHERE IdCuidadora = ? AND IdUsuarioFamilia = ?').get(ana.Id, torresFam)?.Id;
        if (convId) {
          const msgs = [
            [torresFam, 'Hola Ana, gracias por postularte al cuidado de Mateo.', '2026-06-29 09:00:00'],
            [ana.IdUsuario, 'Hola Maria Teresa! Muchas gracias a ustedes. Me encantaria conocer a Mateo.', '2026-06-29 09:15:00'],
            [torresFam, 'El diagnostico de Mateo es TEA nivel 1. Es muy importante mantener una rutina constante.', '2026-06-30 10:00:00'],
            [ana.IdUsuario, 'Entiendo perfectamente. Tengo experiencia con ninos TEA y uso tecnicas ABA. Podriamos coordinar una visita.', '2026-06-30 10:30:00'],
            [torresFam, 'Suena excelente. Te esperamos el miercoles a las 10am para que conozcas a Mateo.', '2026-07-01 11:00:00'],
            [ana.IdUsuario, 'Perfecto! Llegare con material sensorial para romper el hielo con el.', '2026-07-01 11:30:00'],
            [torresFam, 'Que bien! Por cierto, respecto a la tarifa, podemos negociarlo cuando nos veamos.', '2026-07-02 18:00:00'],
            [ana.IdUsuario, 'Si, hablamos. Estoy segura de que llegaremos a un acuerdo.', '2026-07-02 18:30:00'],
          ];
          for (const [rem, txt, fecha] of msgs)
            db.prepare('INSERT OR IGNORE INTO Mensajes (IdConversacion, IdRemitente, Contenido, Leido, FechaEnvio) VALUES (?, ?, ?, ?, ?)').run(convId, rem, txt, 1, fecha);
        }
        // Resena de ejemplo sobre Ana (positiva)
        db.prepare(`INSERT OR IGNORE INTO Resenas (IdCuidadora, IdUsuarioFamilia, Calificacion, Comentario, FechaResena, FechaCreacion) VALUES (?, ?, ?, ?, ?, ?)`).run(
          ana.Id, torresFam, 5, 'Ana es una cuidadora excepcional. Muy paciente y profesional con Mateo. Lo recomiendo ampliamente.', '2026-07-03 14:00:00', '2026-07-03 14:00:00');
      }
    }

    // CASO 2: Valentina Rojas (TDAH) – Orden Pagada, iniciando
    if (valentinaId && mariaCardenas && rojasFam) {
      const exO2 = db.prepare('SELECT Id FROM Ordenes WHERE IdMenor = ? AND IdUsuarioFamilia = ?').get(valentinaId, rojasFam);
      if (!exO2) {
        const r = db.prepare(`INSERT INTO Ordenes (IdCuidadora, IdUsuarioFamilia, TipoServicio, FechaServicio, TotalHoras, TarifaHora, Subtotal, TarifaPlataforma, Total, Estado, FechaCreacion, IdMenor, HoraInicio, HoraFin) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
          mariaCardenas.Id, rojasFam, 'Cuidado en casa', '2026-07-10', 5, 25.00, 125.00, 18.75, 143.75, 'Pagada', '2026-07-01 08:00:00', valentinaId, '09:00', '14:00');
        const o2Id = r.lastInsertRowid;
        for (const desc of [
          '09:00-09:30: Preparacion y supervision del desayuno',
          '09:30-11:00: Apoyo con tareas escolares con tecnicas de enfoque',
          '11:00-11:45: Supervision de tareas cortas con descansos programados',
          '11:45-12:45: Actividad fisica al aire libre para canalizar energia',
          '12:45-13:45: Juego dirigido con reglas claras y refuerzo positivo',
        ])
          db.prepare('INSERT INTO OrdenTareasPersonalizadas (IdOrden, Descripcion) VALUES (?, ?)').run(o2Id, desc);
        db.prepare(`INSERT OR IGNORE INTO Contratos (IdOrden, Terminos, AceptadoFamilia, AceptadoCuidadora, FechaCreacion) VALUES (?, ?, ?, ?, ?)`).run(o2Id,
          JSON.stringify({ duracion: '2 meses', renovacion: 'manual', periodoPrueba: 7, clausulaSalida: '3 dias de aviso' }),
          1, 1, '2026-07-02 10:00:00');
        db.prepare('INSERT OR IGNORE INTO Pagos (IdOrden, Monto, MetodoPago, Estado, FechaPago) VALUES (?, ?, ?, ?, ?)').run(o2Id, 143.75, 'Tarjeta', 'Completado', '2026-07-03 12:00:00');
        db.prepare(`INSERT OR IGNORE INTO Escrow (IdOrden, MontoTotal, MontoCuidadora, MontoPlataforma, Estado, FechaCreacion) VALUES (?, ?, ?, ?, ?, ?)`).run(
          o2Id, 143.75, 122.19, 21.56, 'Retenido', '2026-07-03 12:00:00');
        const conv = db.prepare('INSERT OR IGNORE INTO Conversaciones (IdCuidadora, IdUsuarioFamilia, FechaCreacion, FechaUltimoMensaje) VALUES (?, ?, ?, ?)').run(mariaCardenas.Id, rojasFam, '2026-06-28 14:00:00', '2026-07-02 16:00:00');
        const convId = conv.lastInsertRowid || db.prepare('SELECT Id FROM Conversaciones WHERE IdCuidadora = ? AND IdUsuarioFamilia = ?').get(mariaCardenas.Id, rojasFam)?.Id;
        if (convId) {
          for (const [rem, txt, fecha] of [
            [rojasFam, 'Hola Maria, Valentina esta muy emocionada por conocerte.', '2026-06-28 14:00:00'],
            [mariaCardenas.IdUsuario, 'Hola Carolina! Yo tambien tengo muchas ganas. Tengo experiencia trabajando con ninos con TDAH.', '2026-06-28 14:30:00'],
            [rojasFam, 'Que alivio! Ella necesita mucha paciencia y rutinas claras.', '2026-06-29 09:00:00'],
            [mariaCardenas.IdUsuario, 'Claro, usaremos tecnicas de enfoque con descansos entre actividades. Funciona muy bien.', '2026-06-29 09:30:00'],
            [rojasFam, 'Perfecto, hemos coordinado y aprobamos la tarifa de S/25. Ya realizamos el pago.', '2026-07-02 16:00:00'],
          ])
            db.prepare('INSERT OR IGNORE INTO Mensajes (IdConversacion, IdRemitente, Contenido, Leido, FechaEnvio) VALUES (?, ?, ?, ?, ?)').run(convId, rem, txt, 1, fecha);
        }
      }
    }

    // CASO 3: Sebastian Ruiz (Down) – Orden En curso
    if (sebastianId && elena && ruizFam) {
      const exO3 = db.prepare('SELECT Id FROM Ordenes WHERE IdMenor = ? AND IdUsuarioFamilia = ?').get(sebastianId, ruizFam);
      if (!exO3) {
        const r = db.prepare(`INSERT INTO Ordenes (IdCuidadora, IdUsuarioFamilia, TipoServicio, FechaServicio, TotalHoras, TarifaHora, Subtotal, TarifaPlataforma, Total, Estado, FechaCreacion, IdMenor, HoraInicio, HoraFin) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
          elena.Id, ruizFam, 'Cuidado en casa', '2026-07-12', 5, 28.00, 140.00, 21.00, 161.00, 'En curso', '2026-07-05 09:00:00', sebastianId, '08:00', '13:00');
        const o3Id = r.lastInsertRowid;
        for (const desc of [
          '08:00-08:45: Desayuno adaptado con supervision',
          '08:45-09:15: Apoyo en higiene y vestimenta',
          '09:15-10:15: Actividades educativas con material concreto',
          '10:15-11:00: Ejercicios de estimulacion del lenguaje',
          '11:00-12:00: Psicomotricidad y coordinacion gruesa/fina',
          '12:00-13:00: Juego dirigido para desarrollar habilidades sociales',
        ])
          db.prepare('INSERT INTO OrdenTareasPersonalizadas (IdOrden, Descripcion) VALUES (?, ?)').run(o3Id, desc);
        db.prepare(`INSERT OR IGNORE INTO Contratos (IdOrden, Terminos, AceptadoFamilia, AceptadoCuidadora, FechaCreacion) VALUES (?, ?, ?, ?, ?)`).run(o3Id,
          JSON.stringify({ duracion: '4 meses', renovacion: 'automatica', periodoPrueba: 20, clausulaSalida: '15 dias de aviso' }),
          1, 1, '2026-07-06 14:00:00');
        db.prepare('INSERT OR IGNORE INTO Pagos (IdOrden, Monto, MetodoPago, Estado, FechaPago) VALUES (?, ?, ?, ?, ?)').run(o3Id, 161.00, 'Yape', 'Completado', '2026-07-07 11:00:00');
        db.prepare(`INSERT OR IGNORE INTO Escrow (IdOrden, MontoTotal, MontoCuidadora, MontoPlataforma, Estado, FechaCreacion) VALUES (?, ?, ?, ?, ?, ?)`).run(
          o3Id, 161.00, 136.85, 24.15, 'Liberado', '2026-07-09 10:00:00');
        // Reporte diario de ejemplo
        db.prepare(`INSERT OR IGNORE INTO ReportesDiarios (IdOrden, IdCuidadora, IdMenor, EstadoGeneral, Alimentacion, Medicamentos, ActividadesRealizadas, Observaciones, FechaReporte) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
          o3Id, elena.Id, sebastianId, 'Bueno', 'Desayuno: comio pan con mantequilla y fruta picada con ayuda', 'Ninguno', 'Ejercicios de lenguaje con tarjetas, motricidad fina con plastilina, juego de roles', 'Sebastian estuvo colaborador. Logro armar un rompecabezas de 6 piezas con ayuda minima.', '2026-07-12');
        db.prepare(`INSERT OR IGNORE INTO ReportesDiarios (IdOrden, IdCuidadora, IdMenor, EstadoGeneral, Alimentacion, Medicamentos, ActividadesRealizadas, Observaciones, FechaReporte) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
          o3Id, elena.Id, sebastianId, 'Excelente', 'Comio solo la fruta picada con supervision minima', 'Ninguno', 'Paseo al parque, tiempo de juego libre en columpios, canciones y gestos', 'Muy buen dia. Sebastian estuvo mas comunicativo que de costumbre.', '2026-07-13');
      }
    }

    // CASO 4: Diego Sanchez (Paralisis Cerebral) – Orden Completada (finalizada)
    if (diegoId && gloria && sanchezFam) {
      const exO4 = db.prepare('SELECT Id FROM Ordenes WHERE IdMenor = ? AND IdUsuarioFamilia = ?').get(diegoId, sanchezFam);
      if (!exO4) {
        const r = db.prepare(`INSERT INTO Ordenes (IdCuidadora, IdUsuarioFamilia, TipoServicio, FechaServicio, TotalHoras, TarifaHora, Subtotal, TarifaPlataforma, Total, Estado, FechaCreacion, IdMenor, HoraInicio, HoraFin) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
          gloria.Id, sanchezFam, 'Cuidado en casa', '2026-06-25', 6, 35.00, 210.00, 31.50, 241.50, 'Finalizada', '2026-06-18 10:00:00', diegoId, '09:00', '15:00');
        const o4Id = r.lastInsertRowid;
        for (const desc of [
          '09:00-09:45: Preparacion de alimentos adaptados (textura blanda)',
          '09:45-10:30: Asistencia total para higiene personal y cambio de posicion',
          '10:30-11:30: Terapia fisica: ejercicios de estiramiento y fortalecimiento',
          '11:30-12:15: Ejercicios de movilidad asistida con bipedestador',
          '12:15-12:45: Monitoreo de signos vitales y administracion de medicamentos',
          '12:45-14:30: Juego adaptado en tapete sensorial y cuentos',
        ])
          db.prepare('INSERT INTO OrdenTareasPersonalizadas (IdOrden, Descripcion) VALUES (?, ?)').run(o4Id, desc);
        db.prepare(`INSERT OR IGNORE INTO Contratos (IdOrden, Terminos, AceptadoFamilia, AceptadoCuidadora, FechaCreacion) VALUES (?, ?, ?, ?, ?)`).run(o4Id,
          JSON.stringify({ duracion: '1 mes', renovacion: 'no', periodoPrueba: 5, clausulaSalida: 'inmediata' }),
          1, 1, '2026-06-19 11:00:00');
        db.prepare('INSERT OR IGNORE INTO Pagos (IdOrden, Monto, MetodoPago, Estado, FechaPago) VALUES (?, ?, ?, ?, ?)').run(o4Id, 241.50, 'Transferencia', 'Completado', '2026-06-26 15:00:00');
        db.prepare(`INSERT OR IGNORE INTO Escrow (IdOrden, MontoTotal, MontoCuidadora, MontoPlataforma, Estado, FechaCreacion) VALUES (?, ?, ?, ?, ?, ?)`).run(
          o4Id, 241.50, 205.28, 36.22, 'Liberado', '2026-06-26 16:00:00');
        // Resena
        db.prepare(`INSERT OR IGNORE INTO Resenas (IdCuidadora, IdUsuarioFamilia, Calificacion, Comentario, FechaResena, FechaCreacion) VALUES (?, ?, ?, ?, ?, ?)`).run(
          gloria.Id, sanchezFam, 5, 'Gloria fue increible con Diego. Muy profesional, paciente y dedicada. Diego la extrana mucho.', '2026-06-28 10:00:00', '2026-06-28 10:00:00');
        // Reportes diarios (3)
        for (const [fecha, estGen, ali, meds, acts, obs] of [
          ['2026-06-25', 'Excelente', 'Comio papilla de verduras y pollo desmenuzado', 'Administro Baclofeno segun indicacion', 'Terapia fisica en bipedestador, juego con sonidos', 'Diego respondio muy bien a la terapia. Logro mantener bipedestacion 5 minutos.'],
          ['2026-06-24', 'Bueno', 'Tomo leche fortificada con cereales', 'Ninguno', 'Masajes de relajacion muscular, lectura de cuento', 'Un poco de rigidez muscular por la manana. Mejoro con el masaje.'],
          ['2026-06-23', 'Regular', 'Comio la mitad de la porcion de papilla', 'Administro Baclofeno', 'Ejercicios de estiramiento pasivo, musicoterapia', 'Diego estuvo algo irritado. Dificultad para conciliar el sueno.'],
        ])
          db.prepare(`INSERT OR IGNORE INTO ReportesDiarios (IdOrden, IdCuidadora, IdMenor, EstadoGeneral, Alimentacion, Medicamentos, ActividadesRealizadas, Observaciones, FechaReporte) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
            o4Id, gloria.Id, diegoId, estGen, ali, meds, acts, obs, fecha);
      }
    }

    // --- INCIDENCIA: Retraso en orden de Mateo (por existir, apuntamos a orden random del demo o creamos una extra) ---
    const ordenesAll = db.prepare('SELECT Id, IdCuidadora, IdUsuarioFamilia FROM Ordenes').all();
    if (ordenesAll.length >= 15 && db.prepare('SELECT COUNT(*) AS c FROM Incidencias WHERE Id = (SELECT MAX(Id) FROM Incidencias)').get().c === 0) {
      // Solo si hay pocas incidencias, agregamos una especifica de retraso
      const ordInc = ordenesAll[Math.min(ordenesAll.length - 1, 14)];
      if (ordInc) {
        db.prepare(`INSERT OR IGNORE INTO Incidencias (IdOrden, Tipo, Estado, Descripcion, FechaCreacion) VALUES (?, ?, ?, ?, ?)`).run(
          ordInc.Id, 'Leve', 'En revisión',
          'La cuidadora reporto un retraso de 20 minutos por trafico en la Av. America. El menor espero acompanado de la madre.',
          '2026-07-02 08:30:00');
      }
    }

    // --- EMERGENCIA MEDICA: Incidente en orden simulada ---
    const ordMed = ordenesAll[Math.min(ordenesAll.length - 1, 20)];
    if (ordMed && db.prepare('SELECT COUNT(*) AS c FROM Incidentes').get().c < 8) {
      db.prepare(`INSERT OR IGNORE INTO Incidentes (IdOrden, IdUsuarioReporta, Latitud, Longitud, Tipo, Estado, Descripcion, FechaActivacion) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(
        ordMed.Id, ordMed.IdUsuarioFamilia, -8.1083, -79.0359, 'Emergencia', 'Resuelto',
        'El menor presento una crisis convulsiva leve. La cuidadora siguio el protocolo de emergencia y se contacto a los padres inmediatamente. Menor estable.',
        '2026-07-05 14:30:00');
    }

    // --- REEMPLAZO DE EMERGENCIA ---
    const ordReemp = ordenesAll[Math.min(ordenesAll.length - 1, 30)];
    if (ordReemp && db.prepare('SELECT COUNT(*) AS c FROM ReemplazoEmergencia').get().c < 5) {
      db.prepare(`INSERT OR IGNORE INTO ReemplazoEmergencia (IdOrden, IdCuidadoraOriginal, IdCuidadoraReemplazo, Motivo, Estado, TiempoBusquedaSegundos, FechaCreacion) VALUES (?, ?, ?, ?, ?, ?, ?)`).run(
        ordReemp.Id, ordReemp.IdCuidadora, null,
        'Emergencia familiar: la cuidadora original sufrio un accidente domestico y no puede asistir.',
        'Buscando', 1850, '2026-07-01 07:00:00');
    }

    // --- RELLENAR MENORES restantes para llegar a ~total 50 ---
    const curMenores = db.prepare('SELECT COUNT(*) AS c FROM Menores').get().c;
    if (curMenores < 50) {
      const extraNames = ['Luciana', 'Thiago', 'Emilia', 'Benjamin', 'Camila', 'Matias', 'Isabella', 'Santiago', 'Valeria', 'Gabriel', 'Renata', 'Liam', 'Aitana', 'Mateo', 'Abigail', 'Sebastian', 'Rafaela', 'Maximiliano'];
      const extraDiag = ['Retraso del desarrollo', 'Trastorno del lenguaje', 'Discapacidad intelectual leve', 'Trastorno del aprendizaje', 'Trastorno del procesamiento sensorial', 'Sindrome de Asperger', 'Trastorno oposicionista desafiante', 'Ansiedad infantil', 'Ninguno', 'Ninguno', 'Hipoacusia leve'];
      const extraFams = db.prepare('SELECT Id FROM Usuarios WHERE IdRol = 2 ORDER BY RANDOM()').all();
      for (let i = curMenores; i < 50 && extraFams.length > 0; i++) {
        const fam = extraFams[i % extraFams.length];
        const name = extraNames[(i - curMenores) % extraNames.length];
        const diag = pick(extraDiag);
        const anio = rand(2017, 2023);
        const mes = String(rand(1, 12)).padStart(2, '0');
        const dia = String(rand(1, 28)).padStart(2, '0');
        try { db.prepare('INSERT OR IGNORE INTO Menores (IdUsuarioFamilia, Nombre, Diagnostico, FechaNacimiento) VALUES (?, ?, ?, ?)').run(fam.Id, name + ' ' + fam.Apellidos.split(' ')[0], diag, `${anio}-${mes}-${dia}`); } catch(e) {}
      }
    }

    // --- RELLENAR ORDENES restantes para llegar a ~100 ---
    const curOrdenes = db.prepare('SELECT COUNT(*) AS c FROM Ordenes').get().c;
    if (curOrdenes < 100) {
      const rellenoCuis = db.prepare('SELECT c.Id, c.IdUsuario, c.TarifaHora FROM Cuidadoras c ORDER BY RANDOM()').all();
      const rellenoFams = db.prepare('SELECT Id FROM Usuarios WHERE IdRol = 2 ORDER BY RANDOM()').all();
      const rellenoMen = db.prepare('SELECT Id, IdUsuarioFamilia FROM Menores').all();
      const estadosRelleno = ['Pendiente', 'Confirmada', 'Cancelada', 'Finalizada', 'En curso'];
      for (let i = curOrdenes; i < 100; i++) {
        const c = pick(rellenoCuis);
        const f = pick(rellenoFams);
        const m = pick(rellenoMen.filter(mm => mm.IdUsuarioFamilia === f.Id) || rellenoMen);
        const diasAgo = rand(1, 180);
        const fechaOrd = dateStr(diasAgo);
        const horas = randDec(2, 8, 1);
        const tarifa = c.TarifaHora + randDec(-3, 3);
        const subtotal = +(tarifa * horas).toFixed(2);
        const plataforma = +(subtotal * 0.15).toFixed(2);
        const total = +(subtotal + plataforma).toFixed(2);
        let estado = estadosRelleno[rand(0, 4)];
        if (diasAgo > 120) estado = 'Finalizada';
        else if (diasAgo > 40 && Math.random() > 0.5) estado = 'Finalizada';
        try {
          const r = db.prepare(`INSERT INTO Ordenes (IdCuidadora, IdUsuarioFamilia, TipoServicio, FechaServicio, TotalHoras, TarifaHora, Subtotal, TarifaPlataforma, Total, Estado, FechaCreacion, IdMenor, HoraInicio, HoraFin) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
            c.Id, f.Id, pick(tiposServicio), fechaOrd, horas, +tarifa.toFixed(2), subtotal, plataforma, total, estado, dateTimeStr(diasAgo + rand(0, 5)), m?.Id || null, `${String(rand(7, 12)).padStart(2, '0')}:00`, `${String(rand(13, 18)).padStart(2, '0')}:00`);
          // Add 2-4 random tareas for each
          const tIds = [...new Set(Array(rand(2, 4)).fill(0).map(() => rand(1, 13)))];
          for (const tareasIdx of tIds) {
            const descTarea = db.prepare('SELECT Descripcion FROM Tareas WHERE Id = ?').get(tareasIdx)?.Descripcion || 'Tarea general';
            db.prepare('INSERT OR IGNORE INTO OrdenTareasPersonalizadas (IdOrden, Descripcion) VALUES (?, ?)').run(
              r.lastInsertRowid, descTarea);
          }
          if (estado !== 'Cancelada' && estado !== 'Pendiente') {
            db.prepare('INSERT OR IGNORE INTO Pagos (IdOrden, Monto, MetodoPago, Estado, FechaPago) VALUES (?, ?, ?, ?, ?)').run(
              r.lastInsertRowid, total, pick(['Tarjeta', 'Yape', 'Transferencia']), 'Completado', dateTimeStr(diasAgo + rand(1, 3)));
          }
        } catch(e) {}
      }
    }

    // --- RELLENAR CONTRATOS ---
    const curContratos = db.prepare('SELECT COUNT(*) AS c FROM Contratos').get().c;
    if (curContratos < 100) {
      const ordSinContrato = db.prepare("SELECT Id FROM Ordenes WHERE Id NOT IN (SELECT IdOrden FROM Contratos) AND Estado NOT IN ('Cancelada')").all();
      for (const o of ordSinContrato.slice(0, 100 - curContratos)) {
        try {
          db.prepare(`INSERT OR IGNORE INTO Contratos (IdOrden, Terminos, AceptadoFamilia, AceptadoCuidadora, FechaCreacion) VALUES (?, ?, ?, ?, ?)`).run(
            o.Id, 'Terminos y condiciones estandar de servicio de cuidado infantil.', Math.random() > 0.2 ? 1 : 0, Math.random() > 0.2 ? 1 : 0, dateTimeStr(rand(1, 60)));
        } catch(e) {}
      }
    }

    // --- RELLENAR CONTRATOS DIGITALES ---
    const curContratosDig = db.prepare('SELECT COUNT(*) AS c FROM ContratosDigitales').get().c;
    if (curContratosDig < 100) {
      const ordSinCd = db.prepare("SELECT Id FROM Ordenes WHERE Id NOT IN (SELECT IdOrden FROM ContratosDigitales) AND Estado NOT IN ('Cancelada') LIMIT ?").all(100 - curContratosDig);
      for (const o of ordSinCd) {
        try {
          const codigo = 'CT-' + String(o.Id).padStart(4, '0') + '-' + String(rand(1000, 9999));
          db.prepare(`INSERT OR IGNORE INTO ContratosDigitales (IdOrden, CodigoContrato, FechaEmision, Estado, FechaCreacion) VALUES (?, ?, ?, ?, ?)`).run(
            o.Id, codigo, dateStr(rand(1, 60)), Math.random() > 0.4 ? 'Completado' : 'Pendiente', dateTimeStr(rand(1, 60)));
        } catch(e) {}
      }
    }

    // --- RELLENAR ESCROW ---
    const curEscrow = db.prepare('SELECT COUNT(*) AS c FROM Escrow').get().c;
    if (curEscrow < 100) {
      const ordSinEscrow = db.prepare("SELECT Id, Total FROM Ordenes WHERE Id NOT IN (SELECT IdOrden FROM Escrow) AND Estado NOT IN ('Cancelada', 'Pendiente')").all();
      for (const o of ordSinEscrow.slice(0, 100 - curEscrow)) {
        try {
          const montoCui = +(o.Total * 0.85).toFixed(2);
          const montoPlat = +(o.Total * 0.15).toFixed(2);
          db.prepare(`INSERT OR IGNORE INTO Escrow (IdOrden, MontoTotal, MontoCuidadora, MontoPlataforma, Estado, FechaCreacion) VALUES (?, ?, ?, ?, ?, ?)`).run(
            o.Id, o.Total, montoCui, montoPlat, Math.random() > 0.5 ? 'Liberado' : 'Retenido', dateTimeStr(rand(1, 60)));
        } catch(e) {}
      }
    }

    // ========== 27. ORDENTAREAS POR DIAGNÓSTICO ==========
    try {
      const ordenesSinTareas = db.prepare(`
        SELECT o.Id, o.Estado, m.Diagnostico
        FROM Ordenes o
        LEFT JOIN Menores m ON m.Id = o.IdMenor
        WHERE o.Id NOT IN (SELECT DISTINCT IdOrden FROM OrdenTareas)
      `).all();
      const diagMap = [
        { kw: 'tea', tasks: [1,2,3,4,5,6,7,8,9,10,29,33,38,39,40,42,43] },
        { kw: 'autista', tasks: [1,2,3,4,5,6,7,8,9,10,29,33,38,39,40,42,43] },
        { kw: 'autism', tasks: [1,2,3,4,5,6,7,8,9,10,29,33,38,39,40,42,43] },
        { kw: 'asperger', tasks: [1,2,3,4,5,6,7,8,9,10,29,33,38,39,40,42,43] },
        { kw: 'tdah', tasks: [11,12,13,14,15,16,17,18,27,33,34,36,37,39,40,43,44] },
        { kw: 'hiperactividad', tasks: [11,12,13,14,15,16,17,18,27,33,34,36,37,39,40,43,44] },
        { kw: 'deficit de atencion', tasks: [11,12,13,14,15,16,17,18,27,33,34,36,37,39,40,43,44] },
        { kw: 'down', tasks: [19,20,21,22,23,24,25,26,29,33,34,35,37,39,40,41,44] },
        { kw: 'paralisis', tasks: [19,20,21,22,25,27,28,29,30,31,32,38,39,40,41,42,43] },
        { kw: 'cerebral', tasks: [19,20,21,22,25,27,28,29,30,31,32,38,39,40,41,42,43] },
        { kw: 'lenguaje', tasks: [23,33,34,35,37,39,40,44,45] },
        { kw: 'aprendizaje', tasks: [5,24,33,34,35,36,37,38,45] },
        { kw: 'sensorial', tasks: [3,4,7,9,10,29,39,40,42,43] },
        { kw: 'oposicionista', tasks: [6,11,16,17,37,40,43] },
        { kw: 'ansiedad', tasks: [4,6,7,12,14,15,37,39,43,44] },
        { kw: 'retraso', tasks: [19,20,21,23,24,33,37,39,40] },
        { kw: 'hipoacusia', tasks: [23,33,34,37,39,40,45] },
      ];
      const defaultTasks = [33,37,39,40,42,44,27,29];
      function matchTasks(diag) {
        const d = (diag||'').toLowerCase();
        for (const m of diagMap) { if (d.includes(m.kw)) return m.tasks; }
        return defaultTasks;
      }
      function pickN(arr, n) {
        const shuffled = [...arr].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, Math.min(n, arr.length));
      }
      function variedDecision(estado) {
        const r = Math.random();
        if (['Finalizada','Completada','En curso','Pagada'].includes(estado)) {
          if (r < 0.7) return 'Aceptar';
          if (r < 0.9) return 'Negociar';
          return 'Rechazar';
        }
        if (estado === 'Cancelada') {
          if (r < 0.45) return 'Rechazar';
          if (r < 0.75) return 'Aceptar';
          return 'Pendiente';
        }
        if (estado === 'En revisión') {
          if (r < 0.35) return 'Aceptar';
          if (r < 0.65) return 'Negociar';
          return 'Pendiente';
        }
        return 'Pendiente';
      }
      let n = 0;
      for (const o of ordenesSinTareas) {
        const allTasks = matchTasks(o.Diagnostico);
        if (allTasks.length > 0) {
          // Pick 4-9 random tasks for variety
          const selected = pickN(allTasks, 4 + Math.floor(Math.random() * 6));
          const stmt = db.prepare('INSERT OR IGNORE INTO OrdenTareas (IdOrden, IdTarea, Decision) VALUES (?, ?, ?)');
          for (const t of selected) { stmt.run(o.Id, t, variedDecision(o.Estado)); n++; }
        }
      }
      if (n) console.log(`OrdenTareas insertadas: ${n} registros variados`);
    } catch(e) { console.log('Seed 27 (OrdenTareas) omitido:', e.message); }

    // ========== 28. NEGOCIACIONES PARA TODAS LAS ÓRDENES ==========
    try {
      // Fix any 'activa' negotiations from previous seeds — map to resolved state based on order status
      db.prepare(`
        UPDATE Negociaciones SET Estado = 'aceptada'
        WHERE Estado = 'activa' AND IdOrden IN (SELECT Id FROM Ordenes WHERE Estado IN ('Finalizada','Completada','Pagada'))
      `).run();
      db.prepare(`
        UPDATE Negociaciones SET Estado = 'rechazada'
        WHERE Estado = 'activa' AND IdOrden IN (SELECT Id FROM Ordenes WHERE Estado = 'Cancelada')
      `).run();
      // For remaining 'activa' (Pendiente/En revision), mark as rechazada
      db.prepare(`UPDATE Negociaciones SET Estado = 'rechazada' WHERE Estado = 'activa'`).run();
      const ordenesSinNeg = db.prepare(`
        SELECT o.Id, o.Estado, o.TarifaHora, o.TotalHoras, o.HoraInicio, o.HoraFin,
               o.IdCuidadora, o.IdUsuarioFamilia,
               c.IdUsuario AS CuidadoraUserId
        FROM Ordenes o
        INNER JOIN Cuidadoras c ON c.Id = o.IdCuidadora
        WHERE o.Id NOT IN (SELECT DISTINCT IdOrden FROM Negociaciones)
        LIMIT 80
      `).all();
      const msgs = {
        cuidadora: [
          'Propongo ajustar la tarifa a S/ %s por hora debido al nivel de especialización requerido.',
          'Necesitaría extender el horario de atención hasta las %s para cubrir adecuadamente las necesidades del menor.',
          'Considero que la carga horaria debería ser de %s horas para garantizar una atención de calidad.',
          'Podría ajustar mi tarifa si consideramos un acuerdo por paquete de horas semanales.',
        ],
        familia: [
          'Nuestro presupuesto máximo es S/ %s por hora, podemos negociar los horarios.',
          'Preferimos mantener el horario de %s a %s, pero podemos ajustar la tarifa.',
          'Aceptamos su propuesta de %s horas, pero la tarifa debe mantenerse en S/ %s.',
          'Podemos ofrecer S/ %s por hora si el servicio incluye todas las tareas de cuidado personal.',
        ],
      };
      function pickMsg(arr, ...vals) {
        const m = arr[Math.floor(Math.random() * arr.length)];
        let idx = 0;
        return m.replace(/%s/g, () => String(vals[idx++] ?? ''));
      }
      let n = 0;
      for (const o of ordenesSinNeg) {
        const stmt = db.prepare(`INSERT OR IGNORE INTO Negociaciones (IdOrden, IdPropuestoPor, TarifaHora, TotalHoras, HoraInicio, HoraFin, Mensaje, Estado, FechaCreacion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
        const tarifaBase = o.TarifaHora;
        const horasBase = o.TotalHoras || 4;
        const inicioBase = o.HoraInicio || '08:00';
        const finBase = o.HoraFin || '12:00';
        const estado = o.Estado;
        // Crea 1-3 negociaciones según el estado
        const count = estado === 'Finalizada' || estado === 'Completada' ? rand(2, 3) :
                      estado === 'Cancelada' ? rand(1, 2) : 1;
        for (let i = 0; i < count; i++) {
          const isCuidadora = i % 2 === 0;
          const proponente = isCuidadora ? o.CuidadoraUserId : o.IdUsuarioFamilia;
          const tarifaOff = +(tarifaBase + (isCuidadora ? randDec(2, 5) : randDec(-3, -1))).toFixed(2);
          const horasOff = Math.max(2, horasBase + (isCuidadora ? randDec(0, 2) : randDec(-1, 0)));
          const mensaje = pickMsg(
            isCuidadora ? msgs.cuidadora : msgs.familia,
            tarifaOff, String(Number(inicioBase.split(':')[0]) + rand(0, 1)).padStart(2, '0') + ':00',
            String(Number(finBase.split(':')[0]) + rand(0, 1)).padStart(2, '0') + ':00',
            Math.round(horasOff)
          );
          let estadoNeg;
          if (estado === 'Cancelada') {
            estadoNeg = 'rechazada';
          } else {
            estadoNeg = i === count - 1 ? 'aceptada' : (i === 0 ? 'rechazada' : 'aceptada');
          }
          const diasAtras = rand(5, 60);
          stmt.run(o.Id, proponente, tarifaOff, Math.round(horasOff * 10) / 10,
            inicioBase, finBase, mensaje, estadoNeg, dateTimeStr(diasAtras));
          n++;
        }
      }
      if (n) console.log(`Negociaciones insertadas: ${n}`);
    } catch(e) { console.log('Seed 28 (Negociaciones) omitido:', e.message); }

    console.log('Enriquecimiento de datos completo.');
  } catch(e) { console.log('Seed 26 (Enriquecido) omitido:', e.message); console.error(e); }

  // ========== 28. REPORTE ==========
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
  setupDatabase(db);
  seed(db);
  closeDb();
}
