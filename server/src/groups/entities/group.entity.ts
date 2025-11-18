import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'groups' })
export class Group {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  idx!: number;

  @Column()
  start!: string;

  @Column({ name: 'end' })
  end!: string;

  @Column('text')
  text!: string;
}
