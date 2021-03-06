import {Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import Session from "./session";
import crypto from "crypto";
import config from "../config";
import Article from "./article";

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

  @Column({nullable: false, unique: true})
  email: string

  @Column({nullable: false})
  passwordHash: string

  @Column({ nullable: false})
  public salt: string;

  @Column({default: userRole.READER, nullable: false})
  role: userRole

  @OneToMany(() => Session, session => session.user, {nullable: false})
  sessions: Session[];

  @OneToMany(() => Article, article => article.author, {nullable: false})
  articles: Article[];

  @CreateDateColumn()
  createdAt: Date;

  get data() {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      role: this.role,
    }
  }

  static async hashPassword(password: string, salt: string): Promise<string> {
    return new Promise<Buffer>((resolve, reject) =>
      crypto.pbkdf2(password, config.PASSWORD_SALT, 1000, 64, `sha512`, (err, res) => {
        if(err) reject(err);
        else resolve(res);
      })
    ).then<string>((res) => res.toString(`hex`));
  }

  async validatePassword(passwordToCheck: string): Promise<boolean> {
    return this.passwordHash === await User.hashPassword(passwordToCheck, this.salt);
  }
}
