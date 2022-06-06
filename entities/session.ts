import {CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import User from "./user"

@Entity()
export default class Session {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(() => User, user => user.sessions)
  user: User;

  @CreateDateColumn()
  public created_at: Date;
}