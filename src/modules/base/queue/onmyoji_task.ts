/*
 * @Description:用于处理阴阳师定时任务的队列
 * @Autor: 池樱千幻
 * @Change: 池樱千幻
 * @Date: 2024-03-19 13:10:38
 * @LastEditTime: 2024-03-20 16:49:18
 */
import { BaseCoolQueue, CoolQueue } from '@cool-midway/task';
import { ILogger, Inject } from '@midwayjs/core';
import { BaseOnmyojiTaskService } from '../service/onmyoji/task';
import { BaseOnmyojiTaskEntity, TaskStatus } from '../entity/onmyoji/task';
import { WeChatyBot } from '../service/sys/weChatyBot';

/**
 * 队列
 */
@CoolQueue()
export abstract class OnmyojiTaskQueue extends BaseCoolQueue {
  @Inject()
  baseOnmyojiTaskService: BaseOnmyojiTaskService;

  @Inject()
  weChatyBot: WeChatyBot;

  @Inject()
  logger: ILogger;

  async data(job: any, done: any) {
    this.logger.info('收到的数据: %j', job.data);
    // 延时队列执行, 将加入到队列的数据发送到微信去
    let onmyojiTask: BaseOnmyojiTaskEntity = job.data;
    onmyojiTask.taskStatus = TaskStatus.END;
    this.baseOnmyojiTaskService.update(onmyojiTask);

    this.weChatyBot.sendMessageByName(
      '0.0',
      `任务：[${onmyojiTask.taskName}]\n内容：${onmyojiTask.taskDesc}\n完成!`
    );

    done();
  }
}
