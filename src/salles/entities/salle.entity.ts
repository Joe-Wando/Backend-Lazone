import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Cinema } from '../../cinemas/entities/cinema.entity';

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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
