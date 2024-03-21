import { BaseEntity } from '@cool-midway/core';
import { Column, Entity } from 'typeorm';
import { v1 as uuid } from 'uuid';

/**
 * 阴阳师活动记录表
 */
@Entity('base_onmyoji_active')
export class BaseOnmyojiActiveEntity extends BaseEntity {
  @Column({ comment: '活动ID', unique: true, default: uuid() })
  activeId: string;

  @Column({ comment: '活动名称', nullable: true })
  activeName: string;

  @Column({ comment: '活动描述' })
  activeDesc: string;

  @Column({ comment: '活动开始时间' })
  activeBeginDate: Date;

  @Column({ comment: '活动结束时间' })
  activeEndDate: Date;
}
