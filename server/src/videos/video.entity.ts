import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum VideoStatus {
  VERIFIED = 'verified',
  UNVERIFIED = 'unverified',
  ERROR = 'error',
}

export interface VideoMeta {
  acceptRanges?: string;
  contentLength?: number;
  [key: string]: unknown;
}

@Entity('videos')
export class Video {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar' })
  userId!: string;

  @Column({ type: 'text' })
  originalUrl!: string;

  @Column({ type: 'text' })
  directUrl!: string;

  @Column({
    type: 'enum',
    enum: VideoStatus,
    default: VideoStatus.UNVERIFIED,
  })
  status!: VideoStatus;

  @Column({ type: 'json', nullable: true })
  meta?: VideoMeta;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
