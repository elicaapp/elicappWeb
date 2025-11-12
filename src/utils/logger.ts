/**
 * ═══════════════════════════════════════════════════════════
 * SISTEMA DE LOGGING PROFESIONAL - WINSTON
 * ═══════════════════════════════════════════════════════════
 *
 * Este módulo configura Winston como el sistema de logging centralizado
 * para toda la aplicación. Proporciona logging estructurado con:
 * - Diferentes niveles (error, warn, info, http, debug)
 * - Rotación automática de archivos
 * - Formato consistente y legible
 * - Logging tanto en consola como en archivos
 * - Colores para mejor visualización en desarrollo
 */

import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";

// ═══════════════════════════════════════════════════════════
// CONFIGURACIÓN DE NIVELES DE LOG
// ═══════════════════════════════════════════════════════════

/**
 * Niveles de logging en orden de severidad:
 *
 * error: 0   - Errores críticos que requieren atención inmediata
 * warn: 1    - Advertencias de problemas potenciales
 * info: 2    - Información general sobre el flujo de la aplicación
 * http: 3    - Requests HTTP (útil para debugging de APIs)
 * debug: 4   - Información detallada para debugging
 */
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// ═══════════════════════════════════════════════════════════
// CONFIGURACIÓN DE COLORES (SOLO PARA CONSOLA)
// ═══════════════════════════════════════════════════════════

const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "cyan",
};

winston.addColors(colors);

// ═══════════════════════════════════════════════════════════
// DETERMINAR NIVEL DE LOG SEGÚN ENTORNO
// ═══════════════════════════════════════════════════════════

/**
 * En desarrollo, mostrar todos los logs (debug)
 * En producción, solo mostrar info, warn y error
 */
const level = () => {
  const env = process.env.NODE_ENV || "development";
  const isDevelopment = env === "development";
  return isDevelopment ? "debug" : "info";
};

// ═══════════════════════════════════════════════════════════
// FORMATOS DE LOG
// ═══════════════════════════════════════════════════════════

/**
 * Formato para archivos de log (JSON estructurado)
 * Facilita el parsing y análisis automatizado
 */
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

/**
 * Formato para consola (legible para humanos)
 * Con colores y formato más amigable para desarrollo
 */
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} [${info.level}]: ${info.message}`
  )
);

// ═══════════════════════════════════════════════════════════
// DETECTAR ENTORNO SERVERLESS PRIMERO
// ═══════════════════════════════════════════════════════════

/**
 * Detecta si estamos en un entorno serverless (Vercel, AWS Lambda, etc.)
 * Estos entornos tienen sistema de archivos de solo lectura
 * 
 * IMPORTANTE: Esta verificación debe hacerse ANTES de crear los file transports
 */
const isServerless = () => {
  return !!(
    process.env.VERCEL ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.FUNCTION_NAME || // Google Cloud Functions
    process.env.K_SERVICE || // Google Cloud Run
    process.env.NETLIFY // Netlify Functions
  );
};

// ═══════════════════════════════════════════════════════════
// CONFIGURACIÓN DE TRANSPORTS (DESTINOS DE LOGS)
// ═══════════════════════════════════════════════════════════

/**
 * Transport para consola (siempre disponible)
 *
 * Funciona en todos los entornos (local, serverless, VPS)
 */
const consoleTransport = new winston.transports.Console({
  format: consoleFormat,
});

/**
 * Función para crear file transports solo cuando no estamos en serverless
 * Esto evita el error EROFS al intentar crear carpetas en sistemas de solo lectura
 */
const createFileTransports = () => {
  // Solo crear file transports en entornos NO serverless
  if (isServerless()) {
    return [];
  }

  try {
    return [
      // Transport para logs generales con rotación diaria
      new DailyRotateFile({
        filename: path.join("logs", "combined-%DATE%.log"),
        datePattern: "YYYY-MM-DD",
        zippedArchive: true,
        maxSize: "20m",
        maxFiles: "14d",
        format: fileFormat,
      }),
      // Transport solo para errores con rotación diaria
      new DailyRotateFile({
        level: "error",
        filename: path.join("logs", "error-%DATE%.log"),
        datePattern: "YYYY-MM-DD",
        zippedArchive: true,
        maxSize: "20m",
        maxFiles: "30d",
        format: fileFormat,
      }),
      // Transport para logs HTTP con rotación diaria
      new DailyRotateFile({
        level: "http",
        filename: path.join("logs", "http-%DATE%.log"),
        datePattern: "YYYY-MM-DD",
        zippedArchive: true,
        maxSize: "20m",
        maxFiles: "7d",
        format: fileFormat,
      }),
    ];
  } catch (error) {
    // Si falla la creación de file transports, solo usar console
    console.error('⚠️ No se pudieron crear file transports, usando solo console logs');
    return [];
  }
};

// ═══════════════════════════════════════════════════════════
// CONFIGURAR TRANSPORTS SEGÚN ENTORNO
// ═══════════════════════════════════════════════════════════

/**
 * Obtiene los transports apropiados según el entorno
 * - Serverless (Vercel, Lambda, etc.): Solo console
 * - Servidores tradicionales (VPS, Heroku): Console + Files
 */
const getTransports = () => {
  const fileTransports = createFileTransports();
  return [consoleTransport, ...fileTransports];
};

// ═══════════════════════════════════════════════════════════
// CREAR INSTANCIA DEL LOGGER
// ═══════════════════════════════════════════════════════════

const logger = winston.createLogger({
  level: level(),
  levels,
  transports: getTransports(),
  // No salir en errores no capturados
  exitOnError: false,
});

// Log informativo sobre la configuración de logging
const loggerEnv = isServerless() ? 'serverless (console only)' : 'traditional (console + files)';
logger.info(`🔧 Logger configurado para entorno: ${loggerEnv}`);

// ═══════════════════════════════════════════════════════════
// EXPORTAR LOGGER Y FUNCIONES AUXILIARES
// ═══════════════════════════════════════════════════════════

export default logger;

/**
 * Función auxiliar para logging de errores con contexto
 * 
 * IMPORTANTE: Stack traces solo se loguean en desarrollo, NO en producción
 * para no exponer información interna del sistema.
 *
 * @param message - Mensaje descriptivo del error en español
 * @param error - Objeto de error
 * @param context - Contexto adicional (userId, requestId, etc.) SIN datos sensibles
 */
export const logError = (
  message: string,
  error: unknown,
  context?: Record<string, any>
) => {
  logger.error(message, {
    error: error instanceof Error ? error.message : String(error),
    // Stack solo en desarrollo, NO en producción (seguridad)
    ...(process.env.NODE_ENV !== 'production' && error instanceof Error && { 
      stack: error.stack 
    }),
    ...context,
  });
};

/**
 * Función auxiliar para logging de warnings
 *
 * @param message - Mensaje de advertencia
 * @param context - Contexto adicional
 */
export const logWarn = (message: string, context?: Record<string, any>) => {
  logger.warn(message, context);
};

/**
 * Función auxiliar para logging de información
 *
 * @param message - Mensaje informativo
 * @param context - Contexto adicional
 */
export const logInfo = (message: string, context?: Record<string, any>) => {
  logger.info(message, context);
};

/**
 * Función auxiliar para logging HTTP
 *
 * @param message - Mensaje del request
 * @param context - Información del request (method, url, status, duration)
 */
export const logHttp = (message: string, context?: Record<string, any>) => {
  logger.http(message, context);
};

/**
 * Función auxiliar para logging de debug
 *
 * @param message - Mensaje de debug
 * @param context - Contexto adicional
 */
export const logDebug = (message: string, context?: Record<string, any>) => {
  logger.debug(message, context);
};
