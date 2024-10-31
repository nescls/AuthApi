import { Entity, PrimaryGeneratedColumn, Column, Unique, UpdateDateColumn, CreateDateColumn, OneToMany } from "typeorm"
import { PastPassword } from "./Password";
import { Otp } from "./PasswordOtp";
import { RefreshToken } from "./RefreshToken";

@Entity()
@Unique(['username'])
@Unique(['correo'])
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    username: string;

    @Column({ nullable: true })
    telefono: string;

    @Column({ nullable: true })
    direccion: string;

    @Column()
    correo: string;

    @Column()
    password: string;

    @Column( { nullable: true})
    confirmationCodeUrl: string;

    @Column({ nullable: false, default: false })
    isVerified: boolean;

    @Column({ default: true })
    isActive: boolean;

    @Column({ default: 1 })
    rol: number;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;

    @Column({ type: 'timestamptz', nullable: true })
    deletedAt: Date;

    @OneToMany(() => PastPassword, pastPassword => pastPassword.user)
    pastPasswords: PastPassword[];

    @OneToMany(() => RefreshToken, refreshToken => refreshToken.user)
    refreshTokens: RefreshToken[];

    @OneToMany(() => Otp, otp => otp.user)
    otps: Otp[];
}
