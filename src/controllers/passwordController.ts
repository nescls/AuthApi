import { Request, Response } from 'express';

import { PasswordReset } from '../entity/PasswordReset';
import { User } from '../entity/User';
import { myDataSource } from '../config/database.config';
import { sendMail } from '../services/emailService';

const userRepository = myDataSource.getRepository(User);
const passwordResetCodeRepository = myDataSource.getRepository(PasswordReset);


async function sendPasswordResetCode(req: Request, res: Response) {
  const { email } = req.body;

  try {
    const user = await userRepository.findOne({ where: { correo: email } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const passwordResetCode = new PasswordReset();
    passwordResetCode.code = code;
    passwordResetCode.userId = user.id;
    passwordResetCode.createdAt = new Date();
    passwordResetCode.expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await passwordResetCodeRepository.save(passwordResetCode);

    await sendMail(
      email,
      'Password Reset Code',
      `Your password reset code is: ${code}`,
      `<p>Your password reset code is: <b>${code}</b></p>`,
    );

    return res.json({ message: 'Password reset code sent successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error sending password reset code' });
  }
}

export { sendPasswordResetCode };