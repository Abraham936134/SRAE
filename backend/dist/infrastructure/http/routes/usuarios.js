"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const usuariosController_1 = require("../controllers/usuariosController");
const validate_1 = require("../middlewares/validate");
const router = (0, express_1.Router)();
const controller = new usuariosController_1.UsuariosController();
/**
 * @openapi
 * tags:
 *   name: Usuarios
 *   description: Endpoints para la gestión de usuarios y autenticación
 */
/**
 * @openapi
 * /api/usuarios/register:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - email
 *               - password
 *               - rol
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre del usuario
 *                 example: Juan Pérez
 *               email:
 *                 type: string
 *                 description: Correo electrónico institucional
 *                 example: juan.perez@urp.edu.pe
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Contraseña del usuario (mínimo 6 caracteres)
 *                 example: secret123
 *               rol:
 *                 type: string
 *                 enum: [docente, administrador, auxiliar]
 *                 description: Rol del usuario
 *                 example: docente
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 nombre:
 *                   type: string
 *                 email:
 *                   type: string
 *                 rol:
 *                   type: string
 *       422:
 *         description: Error de validación de datos
 *       500:
 *         description: Error interno del servidor
 */
router.post('/register', (0, validate_1.validateBody)(usuariosController_1.registerSchema), (req, res) => controller.register(req, res));
/**
 * @openapi
 * /api/usuarios/login:
 *   post:
 *     summary: Iniciar sesión
 *     description: Permite ingresar con el nombre de usuario o correo electrónico y contraseña. Retorna un token JWT.
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 description: Usuario o correo electrónico
 *                 example: admin@urp.edu.pe
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Contraseña
 *                 example: admin123
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso. Retorna el token y la información del usuario.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     nombre:
 *                       type: string
 *                     email:
 *                       type: string
 *                     rol:
 *                       type: string
 *       422:
 *         description: Credenciales inválidas o datos faltantes
 *       500:
 *         description: Error interno del servidor
 */
router.post('/login', (0, validate_1.validateBody)(usuariosController_1.loginSchema), (req, res) => controller.login(req, res));
exports.default = router;
