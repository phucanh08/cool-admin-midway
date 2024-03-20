import { BaseEntity } from '@cool-midway/core';
import { Column, CreateDateColumn, Entity } from 'typeorm';
import { v1 as uuid } from 'uuid';

export enum TaskStatus {
  ONGOING = 'ongoing',
  END = 'end',
  EXPIRED = 'expired',
}

export enum TaskType {
  COUNTDOWN = 'countdown',
}

/**
 * 阴阳师任务列表
 */
@Entity('base_onmyoji_task')
export class BaseOnmyojiTaskEntity extends BaseEntity {
  @Column({ comment: '任务ID', unique: true, default: uuid() })
  taskId: string;

  @Column({ comment: '任务名称' })
  taskName: string;

  @Column({
    comment: '任务类型',
    type: 'enum',
    enum: TaskType,
    default: TaskType.COUNTDOWN,
  })
  taskType: TaskType;

  @Column({ comment: '任务描述', nullable: true })
  taskDesc: string;

  // 枚举

  @Column({
    comment: '任务状态',
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.END,
  })
  taskStatus: TaskStatus;

  @CreateDateColumn({ comment: '任务开始时间' })
  taskStartTime: Date;

  @Column({ comment: '任务结束时间', nullable: true })
  taskEndTime: Date;

  @Column({ comment: '任务延迟多久执行' })
  delayTime: number;
}
