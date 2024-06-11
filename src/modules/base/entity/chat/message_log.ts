import { BaseEntity } from '@cool-midway/core';
import { Column, Entity, Generated } from 'typeorm';

/**
 * 消息记录
 */
@Entity('chat_message_log')
export class ChatMessageLogEntity extends BaseEntity {
  @Generated('uuid')
  messageId: string;

  @Column({ comment: '发送人id' })
  sendUserId: number;
  @Column({ comment: '发送名称' })
  sendUserName: string;

  @Column({ comment: '接收人id' })
  receiveUserId: number;
  @Column({ comment: '接收人名称' })
  receiveUserName: string;

  @Column({ comment: '消息内容' })
  message: string;

  @Column({ comment: '消息类型' })
  messageType: string;

  @Column({ comment: '房间ID' })
  roomId: string;

  @Column({ comment: '发送时间' })
  messageTime: Date;
}
