import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../user/user.entity';

@Entity()
export class Calculation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  expression: string;

  @Column()
  operator: string;

  @Column()
  result: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ManyToOne(() => User, user => user.calculations, { onDelete: 'CASCADE' })
  user: User;
}
