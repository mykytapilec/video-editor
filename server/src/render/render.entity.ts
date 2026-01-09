import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum VideoStatus {
  UNVERIFIED = 'unverified',
  UPLOADING = 'uploading',
  VERIFIED = 'verified',
}

export interface VideoMeta {
  duration: number;
  fps: number;
  hasAudio: boolean;
}

@Entity()
export class Video {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  userId!: string;

  @Column()
  originalUrl!: string;

  @Column()
  directUrl!: string;

  @Column({ nullable: true })
  sourcePath?: string;

  @Column({ type: 'json', nullable: true })
  meta?: VideoMeta;

  @Column({ type: 'enum', enum: VideoStatus, default: VideoStatus.UNVERIFIED })
  status!: VideoStatus;
}
