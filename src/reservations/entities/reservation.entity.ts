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
import { User } from '../../users/entities/user.entity';
import { Showtime } from '../../showtimes/entities/showtime.entity';
import { Ticket } from '../../tickets/entities/ticket.entity';

export enum StatutReservation {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
}

@Entity('reservations')
export class Reservation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nbPlaces: number;

  @Column({ type: 'float' })
  prixTotal: number;

  @Column({
    type: 'enum',
    enum: StatutReservation,
    default: StatutReservation.PENDING,
  })
  statut: StatutReservation;

  @Column({ nullable: true })
  orderId?: string;

  @Column({ type: 'float', nullable: true })
  montantAPayer?: number;

  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.reservations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  showtimeId: string;

  @ManyToOne(() => Showtime, (showtime) => showtime.reservations, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'showtimeId' })
  showtime: Showtime;

  @OneToMany(() => Ticket, (ticket) => ticket.reservation, {
    cascade: true,
    eager: true,
  })
  tickets: Ticket[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
