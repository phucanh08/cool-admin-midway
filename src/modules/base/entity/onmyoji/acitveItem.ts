import { BaseEntity } from '@cool-midway/core';
import { Column, Entity } from 'typeorm';
import { v1 as uuid } from 'uuid';
/**
 * 当前活动的参与项
 */
@Entity('base_onmyoji_active_item')
export class BaseOnmyojiActiveItemEntity extends BaseEntity {
  @Column({ comment: '当前活动的参与项ID', default: uuid() })
  activeItemId: string;

  @Column({ comment: '活动ID' })
  activeId: string;

  @Column({ comment: '参与项名称' })
  activeItemName: string;

  @Column({ comment: '参与项描述' })
  activeItemDesc: string;
}
