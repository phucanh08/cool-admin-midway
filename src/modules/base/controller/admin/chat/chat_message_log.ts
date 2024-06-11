import {
  CoolController,
  BaseController,
  TagTypes,
  CoolUrlTag,
  CoolTag,
} from '@cool-midway/core';
import { ChatMessageLogEntity } from '../../../entity/chat/message_log';
import { Body, Inject, Post } from '@midwayjs/core';
import { ChatMessageLogService } from '../../../service/chat/chat.message_log';
import { BaseSysUserService } from '../../../service/sys/user';

/**
 * 描述
 */
@CoolController({
  api: ['update', 'info', 'list', 'page'],
  entity: ChatMessageLogEntity,
  service: ChatMessageLogService,
})
@CoolUrlTag({
  key: TagTypes.IGNORE_TOKEN,
  value: ['getMsgLogByUserId', 'getUserInfoByAccessToken'],
})
export class ChatMessageLogController extends BaseController {
  @Inject()
  chatMessageLogService: ChatMessageLogService;

  @Inject()
  baseSysUserService: BaseSysUserService;

  // 根据发送人id或者接收人id查询聊天记录
  @CoolTag(TagTypes.IGNORE_TOKEN)
  @Post('/getMsgLogByUserId')
  async getMsgLogByUserId(@Body('userId') userId: string) {
    console.log('userId: ', userId);
    return this.ok(await this.chatMessageLogService.getMsgLogByUserId(userId));
  }

  // 根据发送人id或者接收人id查询聊天记录
  @CoolTag(TagTypes.IGNORE_TOKEN)
  @Post('/getUserInfoByAccessToken')
  async getUserInfoByAccessToken(@Body('userId') userId: string) {
    return this.ok(await this.baseSysUserService.person(userId));
  }
}
