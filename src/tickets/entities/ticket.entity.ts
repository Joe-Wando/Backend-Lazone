import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Reservation } from '../../reservations/entities/reservation.entity';

@Entity('tickets')
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  numeroSiege: string;

  @Column({ unique: true })
  numeroTicket: string;

  @Column({ nullable: true })
  qrcode: string;

  @Column()
  reservationId: string;

  @ManyToOne(() => Reservation, (reservation) => reservation.tickets, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'reservationId' })
  reservation: Reservation;

  @CreateDateColumn()
  createdAt: Date;
}
