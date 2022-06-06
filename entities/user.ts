import {Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import Session from "./session";

@Entity()
export default class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string

  @Column()
  email: string

  @Column()
  passwordHash: string

  @OneToMany(() => Session, session => session.user)
  sessions: Session[];

  @CreateDateColumn()
  public created_at: Date;
}