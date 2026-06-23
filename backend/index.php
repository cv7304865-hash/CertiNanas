<?php
header('Access-Control-Allow-Origin: ' . CORS_ORIGIN);
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, x-user-id, x-admin-user');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/helpers/Database.php';
require_once __DIR__ . '/helpers/Response.php';
require_once __DIR__ . '/middleware/AuthMiddleware.php';

// Autoload controllers
require_once __DIR__ . '/controllers/AuthController.php';
require_once __DIR__ . '/controllers/AdminController.php';
require_once __DIR__ . '/controllers/FamiliaController.php';
require_once __DIR__ . '/controllers/CuidadoraController.php';
require_once __DIR__ . '/controllers/SearchController.php';
require_once __DIR__ . '/controllers/MensajesController.php';
require_once __DIR__ . '/controllers/EntrevistaControlador.php';
require_once __DIR__ . '/controllers/TareasNegociacionController.php';

$method = $_SERVER['REQUEST_METHOD'];
$uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri    = rtrim($uri, '/');

// Remove /backend prefix if present
$uri = preg_replace('#^/backend#', '', $uri);
$uri = $uri ?: '/';

$body = json_decode(file_get_contents('php://input'), true) ?? [];

$authCtrl       = new AuthController();
$adminCtrl      = new AdminController();
$familiaCtrl    = new FamiliaController();
$cuidadoraCtrl  = new CuidadoraController();
$searchCtrl     = new SearchController();
$mensajesCtrl   = new MensajesController();
$entrevistaCtrl = new EntrevistaControlador();
$tareasCtrl     = new TareasNegociacionController();

try {
    // ============================================================
    // AUTH
    // ============================================================
    if ($uri === '/api/auth/login' && $method === 'POST') {
        $authCtrl->login($body);
    }
    if ($uri === '/api/auth/register' && $method === 'POST') {
        $authCtrl->register($body);
    }
    if ($uri === '/api/auth/resena' && $method === 'POST') {
        $authCtrl->submitReview($body);
    }
    if ($uri === '/api/usuarios/foto-perfil' && $method === 'POST') {
        $authCtrl->uploadProfilePhoto();
    }

    // ============================================================
    // SEARCH
    // ============================================================
    if ($uri === '/api/search/cuidadoras' && $method === 'GET') {
        $searchCtrl->buscarCuidadoras();
    }
    if (preg_match('#^/api/search/cuidadora/(\d+)/perfil$#', $uri, $m) && $method === 'GET') {
        $searchCtrl->getPerfilCompleto((int)$m[1]);
    }
    if ($uri === '/api/casos/exito' && $method === 'GET') {
        $searchCtrl->getCasosExito();
    }

    // ============================================================
    // FAMILIA
    // ============================================================
    if ($uri === '/api/familia/solicitudes' && $method === 'GET') {
        $familiaCtrl->getSolicitudes();
    }
    if (preg_match('#^/api/familia/solicitudes/(\d+)$#', $uri, $m) && $method === 'GET') {
        $familiaCtrl->getSolicitud((int)$m[1]);
    }
    if (preg_match('#^/api/familia/pagar/(\d+)$#', $uri, $m) && $method === 'POST') {
        $familiaCtrl->pagar((int)$m[1], $body);
    }
    if ($uri === '/api/familia/agendar-entrevista' && $method === 'POST') {
        $familiaCtrl->agendarEntrevista($body);
    }
    if (preg_match('#^/api/familia/solicitudes/(\d+)/detalle$#', $uri, $m) && $method === 'GET') {
        $familiaCtrl->getDetalleSolicitud((int)$m[1]);
    }
    if (preg_match('#^/api/familia/orden/(\d+)/liberar-pago$#', $uri, $m) && $method === 'POST') {
        $familiaCtrl->liberarPago((int)$m[1]);
    }
    if ($uri === '/api/familia/reportar-incidencia' && $method === 'POST') {
        $familiaCtrl->reportarIncidencia($body);
    }

    // ============================================================
    // CUIDADORA
    // ============================================================
    if ($uri === '/api/cuidadora/perfil' && $method === 'GET') {
        $cuidadoraCtrl->getPerfil();
    }
    if ($uri === '/api/cuidadora/perfil' && $method === 'PUT') {
        $cuidadoraCtrl->updatePerfil($body);
    }
    if ($uri === '/api/cuidadora/servicios' && $method === 'GET') {
        $cuidadoraCtrl->getServicios();
    }
    if ($uri === '/api/cuidadora/documentos' && $method === 'POST') {
        $cuidadoraCtrl->subirDocumento();
    }

    // ============================================================
    // TAREAS Y NEGOCIACION
    // ============================================================
    if ($uri === '/api/categorias' && $method === 'GET') {
        $tareasCtrl->getCategorias();
    }
    if ($uri === '/api/tareas/categorias' && $method === 'GET') {
        $tareasCtrl->getCategorias();
    }
    if ($uri === '/api/tareas' && $method === 'GET') {
        $tareasCtrl->getTareasAll();
    }
    if (preg_match('#^/api/tareas/categoria/(\d+)$#', $uri, $m) && $method === 'GET') {
        $tareasCtrl->getTareasByCategoria((int)$m[1]);
    }
    if (preg_match('#^/api/orden/(\d+)/tareas$#', $uri, $m) && $method === 'GET') {
        $tareasCtrl->getOrdenTareas((int)$m[1]);
    }
    if (preg_match('#^/api/orden/(\d+)/tareas$#', $uri, $m) && $method === 'POST') {
        $tareasCtrl->saveOrdenTareas((int)$m[1], $body);
    }
    // CAREGIVER: enviar matriz de decisiones sobre tareas
    if ($uri === '/api/negociacion' && $method === 'POST') {
        $tareasCtrl->enviarRespuestaNegociacionBody($body);
    }
    // CAREGIVER: aceptar orden directamente
    if (preg_match('#^/api/cuidadora/orden/(\d+)/aceptar-negociacion$#', $uri, $m) && $method === 'POST') {
        $tareasCtrl->aceptarOrden((int)$m[1]);
    }
    // CAREGIVER: rechazar orden
    if (preg_match('#^/api/cuidadora/orden/(\d+)/rechazar-negociacion$#', $uri, $m) && $method === 'POST') {
        $tareasCtrl->rechazarOrden((int)$m[1], $body);
    }
    // CAREGIVER: ver solicitudes pendientes con negociacion
    if ($uri === '/api/cuidadora/solicitudes-pendientes' && $method === 'GET') {
        $tareasCtrl->solicitudesPendientesCuidadora();
    }
    // FAMILY: ver negociaciones activas
    if ($uri === '/api/familia/negociaciones' && $method === 'GET') {
        $tareasCtrl->getNegociacionesFamilia();
    }
    // FAMILY: responder a una negociacion
    if (preg_match('#^/api/familia/negociacion/(\d+)/responder$#', $uri, $m) && $method === 'POST') {
        $tareasCtrl->responderNegociacionFamilia((int)$m[1], $body);
    }
    // FAMILY: ver historial de negociaciones de una orden
    if (preg_match('#^/api/familia/orden/(\d+)/propuestas$#', $uri, $m) && $method === 'GET') {
        $tareasCtrl->getPropuestasOrden((int)$m[1]);
    }
    // CAREGIVER: ver historial de negociaciones de una orden
    if (preg_match('#^/api/cuidadora/orden/(\d+)/propuestas$#', $uri, $m) && $method === 'GET') {
        $tareasCtrl->getPropuestasOrden((int)$m[1]);
    }
    // ADMIN: ver todas las negociaciones
    if ($uri === '/api/admin/negociaciones' && $method === 'GET') {
        $tareasCtrl->getNegociacionesAdmin();
    }
    // ADMIN: mediar en una negociacion
    if (preg_match('#^/api/admin/negociaciones/(\d+)/mediar$#', $uri, $m) && $method === 'POST') {
        $tareasCtrl->mediarNegociacion((int)$m[1], $body);
    }

    // ============================================================
    // MENSAJES
    // ============================================================
    if ($uri === '/api/mensajes/conversaciones' && $method === 'GET') {
        $mensajesCtrl->getConversaciones();
    }
    if (preg_match('#^/api/mensajes/conversaciones/(\d+)/mensajes$#', $uri, $m) && $method === 'GET') {
        $mensajesCtrl->getMensajes((int)$m[1]);
    }
    if (preg_match('#^/api/mensajes/conversaciones/(\d+)/mensajes$#', $uri, $m) && $method === 'POST') {
        $mensajesCtrl->enviarMensaje((int)$m[1], $body);
    }
    if ($uri === '/api/mensajes/reportar-incidencia' && $method === 'POST') {
        $mensajesCtrl->reportarIncidencia($body);
    }
    if ($uri === '/api/mensajes/solicitar-contrato' && $method === 'POST') {
        $mensajesCtrl->solicitarContrato($body);
    }

    // ============================================================
    // ENTREVISTAS
    // ============================================================
    if ($uri === '/entrevista/agendar' && $method === 'POST') {
        $entrevistaCtrl->agendar($body);
    }
    if (preg_match('#^/entrevista/(\d+)/admin-join$#', $uri, $m) && $method === 'POST') {
        $entrevistaCtrl->registrarIngresoAdmin((int)$m[1]);
    }
    if (preg_match('#^/entrevista/(\d+)/finalizar$#', $uri, $m) && $method === 'POST') {
        $entrevistaCtrl->finalizar((int)$m[1]);
    }
    if ($uri === '/entrevista/supervision' && $method === 'GET') {
        $entrevistaCtrl->listarSupervision();
    }
    if (preg_match('#^/entrevista/(\d+)/justificar$#', $uri, $m) && $method === 'POST') {
        $entrevistaCtrl->justificarFalta((int)$m[1], $body);
    }

    // ============================================================
    // ADMIN
    // ============================================================
    if ($uri === '/api/admin/stats' && $method === 'GET') {
        $adminCtrl->getStats();
    }
    if ($uri === '/api/admin/dashboard' && $method === 'GET') {
        $adminCtrl->getDashboard();
    }
    if ($uri === '/api/admin/usuarios' && $method === 'GET') {
        $adminCtrl->getUsuarios();
    }
    if ($uri === '/api/admin/casos' && $method === 'GET') {
        $adminCtrl->getCasos();
    }
    if ($uri === '/api/admin/postulaciones' && $method === 'GET') {
        $adminCtrl->getPostulaciones();
    }
    if (preg_match('#^/api/admin/postulaciones/(\d+)/documentos$#', $uri, $m) && $method === 'GET') {
        $adminCtrl->getPostulacionDocumentos((int)$m[1]);
    }
    if (preg_match('#^/api/admin/postulaciones/(\d+)/aprobar$#', $uri, $m) && $method === 'POST') {
        $adminCtrl->aprobarPostulacion((int)$m[1], $body);
    }
    if (preg_match('#^/api/admin/postulaciones/(\d+)/rechazar$#', $uri, $m) && $method === 'POST') {
        $adminCtrl->rechazarPostulacion((int)$m[1], $body);
    }
    if ($uri === '/api/admin/contratos' && $method === 'GET') {
        $adminCtrl->getContratos();
    }
    if (preg_match('#^/api/admin/contratos/(\d+)/aprobar$#', $uri, $m) && $method === 'PUT') {
        $adminCtrl->aprobarContrato((int)$m[1]);
    }
    if (preg_match('#^/api/admin/contratos/(\d+)/rechazar$#', $uri, $m) && $method === 'PUT') {
        $adminCtrl->rechazarContrato((int)$m[1]);
    }
    if ($uri === '/api/admin/incidencias' && $method === 'GET') {
        $adminCtrl->getIncidencias();
    }
    if (preg_match('#^/api/admin/incidencias/(\d+)/cerrar$#', $uri, $m) && $method === 'PUT') {
        $adminCtrl->cerrarIncidencia((int)$m[1]);
    }
    if ($uri === '/api/admin/perfiles-validados' && $method === 'GET') {
        $adminCtrl->getPerfilesValidados();
    }
    if ($uri === '/api/admin/reportes' && $method === 'GET') {
        $adminCtrl->getReportes();
    }
    if ($uri === '/api/admin/conversaciones' && $method === 'GET') {
        $adminCtrl->getConversaciones();
    }
    if (preg_match('#^/api/admin/contratos/(\d+)$#', $uri, $m) && $method === 'GET') {
        $adminCtrl->getContratoDetalle((int)$m[1]);
    }
    if (preg_match('#^/api/admin/incidencias/(\d+)$#', $uri, $m) && $method === 'GET') {
        $adminCtrl->getIncidenciaDetalle((int)$m[1]);
    }
    if ($uri === '/api/admin/mediaciones' && $method === 'GET') {
        $adminCtrl->getMediaciones();
    }
    if (preg_match('#^/api/admin/mediaciones/(\d+)$#', $uri, $m) && $method === 'GET') {
        $adminCtrl->getMediacionDetalle((int)$m[1]);
    }
    if ($uri === '/api/admin/mediaciones/agendar' && $method === 'POST') {
        $adminCtrl->agendarMediacion($body);
    }
    if ($uri === '/api/admin/escrows' && $method === 'GET') {
        $adminCtrl->getEscrows();
    }
    if (preg_match('#^/api/admin/escrows/(\d+)$#', $uri, $m) && $method === 'GET') {
        $adminCtrl->getEscrowDetalle((int)$m[1]);
    }
    if ($uri === '/api/admin/transacciones' && $method === 'GET') {
        $adminCtrl->getTransacciones();
    }
    if (preg_match('#^/api/admin/usuarios/(\d+)/suspender$#', $uri, $m) && $method === 'POST') {
        $adminCtrl->suspenderUsuario((int)$m[1]);
    }
    if (preg_match('#^/api/admin/usuarios/(\d+)/quejas$#', $uri, $m) && $method === 'GET') {
        $adminCtrl->getQuejasUsuario((int)$m[1]);
    }
    if (preg_match('#^/api/admin/postulaciones/(\d+)/documentos/(\d+)/aprobar$#', $uri, $m) && $method === 'POST') {
        $adminCtrl->aprobarDocumentoPostulacion((int)$m[1], (int)$m[2]);
    }
    if (preg_match('#^/api/admin/postulaciones/(\d+)/documentos/(\d+)/rechazar$#', $uri, $m) && $method === 'POST') {
        $adminCtrl->rechazarDocumentoPostulacion((int)$m[1], (int)$m[2], $body);
    }
    if ($uri === '/api/admin/reportes/full' && $method === 'GET') {
        $adminCtrl->getReportesFull();
    }
    // ADMIN: Visto Bueno Rapido
    if (preg_match('#^/api/admin/visto-bueno/(\d+)$#', $uri, $m) && $method === 'POST') {
        $adminCtrl->vistoBuenoRapido((int)$m[1]);
    }
    // ADMIN: guardar acuerdo de negociacion
    if (preg_match('#^/api/admin/negociaciones/(\d+)/acuerdo$#', $uri, $m) && $method === 'POST') {
        $adminCtrl->guardarAcuerdoNegociacion((int)$m[1], $body);
    }

    // ============================================================
    // 404
    // ============================================================
    Response::notFound("Ruta no encontrada: {$method} {$uri}");

} catch (PDOException $e) {
    Response::error('Error de base de datos: ' . $e->getMessage(), 500);
} catch (Exception $e) {
    Response::error('Error interno: ' . $e->getMessage(), 500);
}
