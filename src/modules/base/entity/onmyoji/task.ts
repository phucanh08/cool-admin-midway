import { BaseEntity } from '@cool-midway/core';
import { Column, Entity } from 'typeorm';

export enum TaskStatus {
  ONGOING = 'ongoing',
  END = 'end',
}

/**
 * 阴阳师任务列表
 */
@Entity('base_onmyoji_task')
export class BaseOnmyojiTask extends BaseEntity {
  @Column({ comment: '任务ID' })
  taskId: string;

  @Column({ comment: '任务名称' })
  taskName: string;

  @Column({ comment: '任务类型' })
  taskType: string;

  @Column({ comment: '任务描述' })
  taskDesc: string;

  // 枚举

  @Column({
    comment: '任务状态',
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.END,
  })
  taskStatus: TaskStatus;

  @Column({ comment: '任务开始时间' })
  taskStartTime: Date;

  @Column({ comment: '任务结束时间' })
  taskEndTime: string;
}
