import { Context } from '@midwayjs/socketio';

/*
 * @Description: 消息实体
 * @Autor: 池樱千幻
 * @Change: 池樱千幻
 * @Date: 2024-06-02 23:00:30
 * @LastEditTime: 2024-06-02 23:45:45
 */
export class MessageEntity {
  sendTime?: Date = new Date();
  sendUserId: number;
  sendUserName: string;
  roomId: string;
  message?: string;
  messageType: string;
  messageTypeDesc?: string;
  isRead: Boolean = false;

  constructor(obj: any) {
    Object.assign(this, obj);
  }

  /**
   * @description:  发送消息
   * @param {Context} ctx 上下文
   * @param {string} eventName 事件名称
   * @return {*}
   * @author: 池樱千幻
   */
  send(ctx: Context, eventName: string) {
    ctx.to(this.roomId).emit(eventName, this);
  }
}
