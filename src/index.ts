import { myDataSource } from "./config/database.config"
import express, { Express, Request, Response } from 'express'
import helmet from 'helmet'
import userRouter from "./routes/user";
import authRouter from "./routes/auth";
import { verifyUser } from "./controllers/userController";

const app:Express = express();

const dotenv = require('dotenv');
dotenv.config();

const puerto = process.env.PORT || 3000;

app.use(helmet());
app.use(express.json());
app.use('/activar/:token',verifyUser)
app.use('/api/usarios', userRouter)
app.use('/api/auth', authRouter)
app.use((req:Request, res:Response) =>{
  return res.status(404).json({message: 'Ruta no encontrada'}) 
})
myDataSource.initialize()
    .then(() => {
    })
    .catch((error) => console.log(error))

const server = app.listen(puerto, () =>
    console.log(`
    Servidor escuchando a la ruta: http://localhost:${puerto}`),
  )

