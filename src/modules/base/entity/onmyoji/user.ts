import { BaseEntity } from '@cool-midway/core';
import { Column, Entity } from 'typeorm';

/**
 * 阴阳师用户
 */
@Entity('base_onmyoji_user')
export class BaseOnmyojiUser extends BaseEntity {
  @Column({ comment: '账号' })
  userId: string;

  @Column({ comment: '用户名' })
  username: string;
}
