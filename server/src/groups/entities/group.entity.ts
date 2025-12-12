import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'groups' })
export class Group {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  idx!: number;

  @Column('float')
  start!: number;

  @Column('float')
  end!: number;

  @Column('text')
  text!: string;
}
