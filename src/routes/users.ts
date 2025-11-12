/**
 * Rutas relacionadas con los usuarios
 * =============================================
 * Este archivo define las rutas para la gestión de usuarios.
 * Utiliza un router de Express para manejar las solicitudes.
 * ============================================
 * 
 */


import express from 'express'; // Importar Express
import { getUsers, createUser } from "../controllers/userController"; // Importar controladores de usuarios

// Crear un router para las rutas de usuarios
const router = express.Router(); // Inicializar el router

// Definir las rutas para 
/**
 * =============================================
 *  
 * */

router.get('/', getUsers); // Obtener la lista de usuarios

router.post('/', createUser);// Crear un nuevo usuario


// 
export default router;