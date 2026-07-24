import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Film } from '../../films/entities/film.entity';
import { Salle } from '../../salles/entities/salle.entity';
import { Reservation } from '../../reservations/entities/reservation.entity';

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

  @OneToMany(() => Reservation, (reservation) => reservation.showtime)
  reservations: Reservation[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
