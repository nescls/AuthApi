import { Entity, PrimaryGeneratedColumn, Column,ManyToOne } from "typeorm"
import { User } from "./User";

@Entity()
export class RefreshToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  token: string;

  @Column()
  deviceId: string;

  @Column()
  deviceType: string;

  @Column({ type: 'timestamptz' })
  createdAt: Date;

  @Column({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  revokedAt: Date;

  @ManyToOne(() => User, user => user.refreshTokens)
  user: User;
}