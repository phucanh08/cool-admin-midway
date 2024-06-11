import { Init, Provide } from '@midwayjs/decorator';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { ChatMessageLogEntity } from '../../entity/chat/message_log';

/**
 * 描述
 */
@Provide()
export class ChatMessageLogService extends BaseService {
  @InjectEntityModel(ChatMessageLogEntity)
  chatMessageLogEntity: Repository<ChatMessageLogEntity>;

  @Init()
  async init() {
    await super.init();
    this.setEntity(this.chatMessageLogEntity);
  }

  /**
   * @description:  根据发送人id或者接收人id查询聊天记录
   * @param {string} userId
   * @return {*}
   * @author: 池樱千幻
   */
  async getMsgLogByUserId(userId: string) {
    return await this.chatMessageLogEntity
      .createQueryBuilder()
      .where('sendUserId = :userId or  receiveUserId = :userId', { userId })
      .getMany();
  }
}
