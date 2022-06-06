import {Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import Session from "./session";

export enum userRole {
  READER = "READER",
  MODERATOR = "MODERATOR",
  ADMIN = "ADMIN"
}

@Entity()
export default class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column({nullable: false})
  name: string

  @Column({nullable: false})
  email: string

  @Column({nullable: false})
  passwordHash: string

  @Column({default: userRole.READER, nullable: false})
  role: userRole

  @OneToMany(() => Session, session => session.user, {nullable: false})
  sessions: Session[];

  @Column({default: new Date(), nullable: false})
  public createdAt: Date;
}