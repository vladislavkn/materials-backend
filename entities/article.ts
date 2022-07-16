import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import User from "./user";

export enum articleState {
  DRAFT = "DRAFT",
  PROPOSAL = "PROPOSAL",
  PUBLISHED = "PUBLISHED",
}

@Entity()
export default class Article {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false, unique: true })
  title: string;

  @Column({ nullable: true })
  thumbnailText: string;

  @Column({ nullable: false })
  text: string;

  @Column({ nullable: false, default: articleState.DRAFT })
  state: articleState;

  @ManyToOne(() => User, (user) => user.articles, {
    cascade: ["remove"],
    nullable: false,
  })
  author: User;

  @CreateDateColumn()
  createdAt: Date;
}
