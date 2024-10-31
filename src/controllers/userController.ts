
import { Request, Response } from 'express';
import * as bcrypt from 'bcrypt';
import { User } from '../entity/User';
import { myDataSource } from '../config/database.config';
import { validate } from 'email-validator';
import { sendMail } from '../services/emailService';
import nanoid  from "nanoid";

const userRepository = myDataSource.getRepository(User)
// Función para registrar un nuevo usuario o creacion de usuario por parte del administrativo

export async function registro(req: Request, res: Response) {
  const { username, telefono, direccion, correo, password, passwordConfirmation, rol } = req.body;

  if (!username || !correo || !password || !passwordConfirmation) {
    return res.status(400).json({ message: 'Campos requeridos: nombre de usuario, correo electrónico, contraseña y confirmación de contraseña son obligatorios.' });
  }

  if (password !== passwordConfirmation) {
    return res.status(400).json({ message: 'Las contraseñas no coinciden.' });
  }

  if (telefono && isNaN(telefono)) {
    return res.status(400).json({ message: 'El número de teléfono debe contener solo números.' });
  }
  const usuearioExistente = await userRepository.findOne({
    where: [
      { username },
      { correo },
    ],
  });
console.log(usuearioExistente);

  if (usuearioExistente) {
    return res.status(400).json({ message: 'El usuario ya existe.' });
  }

  const hashedPwd = await bcrypt.hash(password, 10); // Contraseña encriptada
  try {
    // Buscar usuario existente por nombre de usuario o correo electrónico
    const nuevoUsuario = new User();

    nuevoUsuario.username = username;
    nuevoUsuario.telefono = telefono;
    nuevoUsuario.direccion = direccion;
    nuevoUsuario.correo = correo;
    nuevoUsuario.password = hashedPwd;
    nuevoUsuario.rol = rol ?? '2';
    nuevoUsuario.confirmationCodeUrl = nanoid.nanoid();
    await userRepository.save(nuevoUsuario);

    await sendMail(
      process.env.MAIL_USERNAME,
      nuevoUsuario.correo,
      'Active su usuario',
      `
      <h1>Activa tu cuenta</h1>
      <p>Para activar tu cuenta, da clic en el siguiente enlace:</p>
      <a href="http://localhost:/activar/${nuevoUsuario.confirmationCodeUrl}">Activar cuenta</a>
      `
    )

    res.status(201).json(); // Regresar información del usuario creado
  } catch (error) {
    return res.status(500).json({ message: 'Ocurrió un error durante el registro. Intente más tarde.' });
  }
}

export async function verifyUser(req: Request, res: Response) {
  // Obtener el ID del usuario y el código de verificación desde la URL
  const userId: string  = req.params.id;
  const verificationCode: string = req.params.verificationCode;

  // Buscar el usuario en la base de datos mediante el código de verificación
  const user = await userRepository.findOne({
    where: { confirmationCodeUrl: verificationCode },
  });

  // Si no se encuentra el usuario, devolver un error 404
  if (!user) {
    return res.status(404).send('Usuario no encontrado');
  }

  // Si el usuario ya está verificado, devolver un error 400
  if (user.isVerified) {
    return res.status(400).send('Usuario ya verificado');
  }

  // Marcar al usuario como verificado
  user.isVerified = true;

  // Guardar los cambios en la base de datos
  await userRepository.save(user);

  // Devolver un mensaje de éxito
  return  res.send(`
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verificación exitosa</title>
    </head>
    <body>
      <h1>¡Verificación exitosa!</h1>
      <p>Su cuenta ha sido verificada con éxito.</p>
      <p>Puede ahora acceder a su cuenta y disfrutar de nuestros servicios.</p>
      <a href="/login">Iniciar sesión</a>
    </body>
    </html>
  `);
}


