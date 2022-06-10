import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import User from "./user";

export enum articleState {
  DRAFT = "DRAFT",
  PROPOSAL = "PROPOSAL",
  PUBLISHED = "PUBLISHED"
}

@Entity()
export default class Article {
  @PrimaryGeneratedColumn()
  id: number

  @Column({nullable: false, unique: true})
  title: string

  @Column()
  thumbnailText: string

  @Column({nullable: false})
  content: string;

  @Column({nullable: false, default: articleState.DRAFT})
  state: articleState;

  @ManyToOne(() => User, user => user.articles, {cascade: ["remove"], nullable: false})
  author: User;

  @Column({default: new Date(), nullable: false})
  createdAt: Date;
}
