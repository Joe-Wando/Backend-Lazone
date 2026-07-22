import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Film } from '../../films/entities/film.entity';
import { Salle } from '../../salles/entities/salle.entity';

@Entity('showtimes')
export class Showtime {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamp' })
  dateHeure: Date;

  @Column({ type: 'float' })
  prix: number;

  @Column({ default: 0 })
  placesReservees: number;

  @Column()
  filmId: string;

  @ManyToOne(() => Film, (film) => film.showtimes, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'filmId' })
  film: Film;

  @Column()
  salleId: string;

  @ManyToOne(() => Salle, (salle) => salle.showtimes, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'salleId' })
  salle: Salle;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
