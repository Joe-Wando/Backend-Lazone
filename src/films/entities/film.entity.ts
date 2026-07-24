import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Showtime } from '../../showtimes/entities/showtime.entity';

@Entity('films')
export class Film {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  tmdbId: number;

  @Column()
  titre: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  affiche: string;

  @Column({ nullable: true })
  duree: number;

  @Column({ nullable: true })
  genre: string;

  @Column({ type: 'float', nullable: true })
  note: number;

  @OneToMany(() => Showtime, (showtime) => showtime.film)
  showtimes: Showtime[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
