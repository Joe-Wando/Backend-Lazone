import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Cinema } from '../../cinemas/entities/cinema.entity';
import { Showtime } from '../../showtimes/entities/showtime.entity';

@Entity('salles')
export class Salle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nom: string;

  @Column()
  capacite: number;

  @Column()
  cinemaId: string;

  @ManyToOne(() => Cinema, (cinema) => cinema.salles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cinemaId' })
  cinema: Cinema;

  @OneToMany(() => Showtime, (showtime) => showtime.salle)
  showtimes: Showtime[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
