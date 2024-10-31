import { DataSource } from "typeorm"
import * as dotenv from 'dotenv';
dotenv.config();

export const myDataSource = new DataSource({
    type: 'postgres' ,
    host: process.env.DB_HOST ?? "localhost",
    port: Number(process.env.DB_PORT ?? 5432),
    username: process.env.DB_USERNAME ?? "admin",
    password: process.env.DB_PASSWORD ?? "admin",
    database: process.env.DB_DATABASE ?? "admin",
    schema: process.env.DB_SCHEMA ?? "public",
    entities: ["src/entity/*.ts"],
    logging: false,
    synchronize: false,
})