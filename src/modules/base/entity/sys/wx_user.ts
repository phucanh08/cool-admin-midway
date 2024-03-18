import { BaseEntity } from '@cool-midway/core';
import { Column, Index, Entity } from 'typeorm';

@Entity('base_wx_user')
export class BaseWxUserEntity extends BaseEntity {
  @Index()
  @Column({ comment: '微信ID' })
  wxId: string;

  @Column({ comment: '微信昵称' })
  name: string;

  @Column({ comment: '别名', nullable: true })
  alias: string;

  @Column({ comment: '性别', nullable: true })
  gender: number;

  @Column({ comment: '头像', nullable: true })
  avatar: string;

  @Column({ comment: '是否是自己' })
  self: Boolean;
}
