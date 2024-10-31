import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import { User } from '../entity/User';
import { RefreshToken } from '../entity/RefreshToken';
import { myDataSource } from '../config/database.config';
const userRepository = myDataSource.getRepository(User);
const refreshTokenRepository = myDataSource.getRepository(RefreshToken);

const dotenv = require('dotenv');
dotenv.config();
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET || 'default';

// Controlador para login
async function handleLogin(req: Request, res: Response) {
  const { username, correo, password } = req.body;

  try {
    if ((!username && !correo) || !password) {
      return res.status(400).json({ message: 'Username/Correo y password son requeridos.' });
    }

    // Validación del usuario
    const usuario = await userRepository.findOne({
      where: [
        { username, isActive: true },
        { correo, isActive: true },
      ],
    });

    if (!usuario) {
      return res.status(401).json({ message: "Credenciales inválidas" }); // Unauthorized
    }

    const match = await bcrypt.compare(password, usuario.password);
    if (match) {
      // Crear token JWTs
      const accessToken = jwt.sign(
        {
          UserInfo: {
            id: usuario.id,
            username: usuario.username,
            role: usuario.rol,
          },
        },
        refreshTokenSecret,
        { expiresIn: '1d' }
      );

      const refreshToken = jwt.sign(
        { username: usuario.username },
        refreshTokenSecret,
        { expiresIn: '1d' }
      );

      // Guardado del token
      const newRefreshToken = new RefreshToken();
      newRefreshToken.token = refreshToken;
    //   newRefreshToken.deviceId = req.;
    //   newRefreshToken.deviceType = req.deviceType;
      newRefreshToken.user = usuario;

      await refreshTokenRepository.save(newRefreshToken);

      res.cookie('jwt', refreshToken, {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
        maxAge: 24 * 60 * 60 * 1000,
      });

      return res.json({ accessToken });
    } else {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}

export { handleLogin };