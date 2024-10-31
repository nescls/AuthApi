import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { User } from "./User";

@Entity('otp')
export class Otp {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  otpCode: string;

  @Column({ type: 'timestamptz' })
  expirationDate: Date;

  @ManyToOne(() => User, user => user.otps)
  user: User;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
