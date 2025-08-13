import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Calculation } from '../calculation/calculation.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  email!: string;

  @Column({ type: 'int', nullable: true })
  icon?: number;

  @Column()
  password!: string;

  @Column()
  Nom!: string;
  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  department?: string;

  @Column({ type: 'date', nullable: true })
  joinDate?: string;

  @Column({ type: 'datetime', nullable: true })
  lastLogin?: Date;

  @Column({ type: 'int', default: 0 })
  calculationsCount!: number;

  @OneToMany(() => Calculation, calculation => calculation.user)
  calculations!: Calculation[];
}
