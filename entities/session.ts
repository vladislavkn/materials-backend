import {CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import User from "./user"

@Entity()
export default class Session {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(() => User, user => user.sessions, { cascade: ["remove"], nullable: false })
  user: User;

  public createdAt: Date;
}