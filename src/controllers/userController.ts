/**
 * Controladores relacionados con los usuarios.
 * =============================================
 * Este archivo define las funciones que manejan las solicitudes
 * relacionadas con los usuarios.
 * 
 */
import { Request, Response } from 'express'; // Importar tipos de Express
import sql from '../config/db'; // Importar la configuración de la base de datos
/**
 * 
 * @param req 
 * @param res 
 */

// Controlador para obtener la lista de usuarios.
export const getUsers = async (req: Request, res: Response) => {
    // Lógica para obtener la lista de usuarios (Reales de la base de datos).
    try{
        const users = await sql`SELECT * FROM users`; // Consultar todos los usuarios
        if (users.length === 0) {
            return res.status(404).json({ message: 'No se encontraron usuarios' }); // No hay usuarios
        }
        res.json(users); // Enviar la lista de usuarios como respuesta JSON
        
    }catch(error){
        console.error('Error al obtener los usuarios:', error);
        res.status(500).json({ message: 'Error del servidor' }); // Error del servidor

    }
    
    
}


// Controlador para crear un nuevo usuario
export const createUser = (req: Request, res: Response) => {
    // Lógica para crear un nuevo usuario (simulada aquí)
    const { name, email } = req.body; // Obtener datos del cuerpo de la solicitud
    const newUser = { id: Date.now(), name, email }; // Crear un nuevo usuario con ID único
    res.status(201).json(newUser); // Enviar el nuevo usuario como respuesta con estado 201
}


// Controlador para obtener un usuario por ID
export const getUserById = async (req: Request, res: Response) => {
    const { id } = req.params; // Obtener el ID del usuario desde los parámetros de la ruta

    try {
        // Consultar la base de datos para obtener el usuario por ID
        const user = await sql`SELECT * FROM users WHERE id = ${id}`;
        if (user.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' }); // Usuario no encontrado
        }   
        res.json(user[0]); // Enviar el usuario encontrado como respuesta JSON
    } catch (error) {
        console.error('Error al obtener el usuario:', error);
        res.status(500).json({ message: 'Error del servidor' }); // Error del servidor
    }
}


// Controlador para actualizar un usuario por ID
export const updateUser = async (req: Request, res: Response) => {
    const { id } = req.params; // Obtener el ID del usuario desde los parámetros de la ruta
    const { name, email } = req.body; // Obtener los datos actualizados desde el cuerpo de la solicitud
    try {
        // Actualizar el usuario en la base de datos
        const result = await sql`UPDATE users SET name = ${name}, email = ${email} WHERE id = ${id} RETURNING *`;   
        if (result.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' }); // Usuario no encontrado
        }   
        res.json(result[0]); // Enviar el usuario actualizado como respuesta JSON
    } catch (error) {
        console.error('Error al actualizar el usuario:', error);
        res.status(500).json({ message: 'Error del servidor' }); // Error del servidor
    }
}


// Controlador para eliminar un usuario por ID
export const deleteUser = async (req: Request, res: Response) => {
    const { id } = req.params; // Obtener el ID del usuario desde los parámetros de la ruta
    try {
        // Eliminar el usuario de la base de datos
        const result = await sql`DELETE FROM users WHERE id = ${id} RETURNING *`;
        if (result.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' }); // Usuario no encontrado
        }

        res.json({ message: 'Usuario eliminado correctamente' }); // Confirmación de eliminación
    } catch (error) {
        console.error('Error al eliminar el usuario:', error);
        res.status(500).json({ message: 'Error del servidor' }); // Error del servidor
    }
}