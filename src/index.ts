/**
 * =============================================
 * Archivo Principal del Servidor - Elica App
 * =============================================
 *
 * Este archivo es el punto de entrada de la aplicación Express.
 * Configura el servidor, las rutas y los middleware.
 */


// Importaciones de dependencias externas
import express, {Request, Response} from "express"; // Framework web para Node.js
import cors from "cors"; // Middleware para habilitar CORS
import dotenv from "dotenv"; // Cargar variables de entorno desde un archivo .env

// Importar rutas definidas en otros archivos
import userRoutes from "./routes/users"; // Rutas relacionadas con usuarios



// Crear una instancia de la aplicación Express
const app = express(); // Inicializar la aplicación Express

// Configurar el puerto del servidor desde variables de entorno o usar 3003 por defecto
const PORT = process.env.SERVER_PORT || 3003; // Puerto del servidor

// Cargar variables de entorno desde el archivo .env
dotenv.config(); // Cargar configuración desde .env

// Middleware para parsear JSON en las solicitudes
app.use(express.json()); // Parsear JSON en el cuerpo de las solicitudes

// Habilitar CORS para todas las rutas
app.use(cors()); // Habilitar CORS para todas las rutas

// Usar las rutas de usuarios para cualquier solicitud que comience con /api/users
app.use("/api/users", userRoutes); // Rutas de usuarios

// Ruta raíz para verificar que el servidor está funcionando
app.get("/", (req:Request, res:Response) => {
    // Respuesta simple para la ruta raíz
  res.send("<h1>Elica App API!</h1><p>Es una plataforma para la gestion de citas y clientes para diferentes tipos de empresas como salones, barberias, restaurante y más.</p>");

});

// Iniciar el servidor y escuchar en el puerto configurado
app.listen(PORT,()=>{
    // Mensaje en consola al iniciar el servidor
    console.log(`servidor corriendo en: http://localhost:${PORT}`);
});