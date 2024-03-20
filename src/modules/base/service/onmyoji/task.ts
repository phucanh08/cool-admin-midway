import { BaseOnmyojiTaskEntity, TaskStatus } from './../../entity/onmyoji/task';
import { Init, Inject, Provide } from '@midwayjs/decorator';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { OnmyojiTaskQueue } from '../../queue/onmyoji_task';
import { WeChatyBot } from '../sys/weChatyBot';
import { ILogger } from '@midwayjs/core';

/**
 * 描述
 */
@Provide()
export class BaseOnmyojiTaskService extends BaseService {
  @InjectEntityModel(BaseOnmyojiTaskEntity)
  baseOnmyojiTaskEntity: Repository<BaseOnmyojiTaskEntity>;

  @Inject()
  onmyojiTaskQueue: OnmyojiTaskQueue;

  @Inject()
  weChatyBot: WeChatyBot;

  @Inject()
  logger: ILogger;

  @Init()
  async init() {
    await super.init();
    // 设置实体
    this.setEntity(this.baseOnmyojiTaskEntity);
  }

  /**
   * task添加之前, 将数据添加进队列中.
   * @param data
   * @param type
   */
  async modifyBefore(
    data: BaseOnmyojiTaskEntity,
    type: 'delete' | 'update' | 'add'
  ) {
    if (type === 'add') {
      // 根据data的开始时间与间隔,计算结束时间
      data.taskEndTime = new Date(new Date().getTime() + data.delayTime);
    }
  }

  /**
   * 修改之后
   * @param data
   * @param type
   */
  async modifyAfter(
    data: BaseOnmyojiTaskEntity,
    type: 'delete' | 'update' | 'add'
  ) {
    if (type === 'add') {
      console.log('新增之后,将数据插入队列', data);
      this.onmyojiTaskQueue.add(data, {
        delay: data.delayTime,
      });

      this.weChatyBot.sendMessageByName('0.0', `新增任务:${data.taskName}`);
    }
  }

  /**
   * @description: 初始化任务
   * @return {*}
   * @author: 池樱千幻
   */
  async initTask() {
    this.logger.info('初始化阴阳师任务');
    // 查找所有未完成并且结束时间小于当前时间的任务

    const taskList = await this.baseOnmyojiTaskEntity
      .createQueryBuilder()
      .where('taskStatus = :taskStatus', { taskStatus: TaskStatus.ONGOING })
      .andWhere('taskEndTime > :currentTime', { currentTime: new Date() })
      .getMany();

    this.logger.info('正在进行中的任务数量:%s', taskList.length);

    // 根据当前时间减去任务结束时间,计算延迟时间,并将任务加入队列
    taskList.forEach(task => {
      const delayTime = task.taskEndTime.getTime() - new Date().getTime();
      this.onmyojiTaskQueue.add(task, {
        delay: delayTime,
      });
    });

    // 查询已经过期的任务, 将任务状态置为结束(过期)
    const result = await this.baseOnmyojiTaskEntity
      .createQueryBuilder()
      .update(BaseOnmyojiTaskEntity)
      .set({ taskStatus: TaskStatus.EXPIRED }) // 设置状态为过期
      .where('taskStatus = :taskStatus', { taskStatus: TaskStatus.ONGOING }) // 未完成
      .andWhere('taskEndTime < :currentTime', { currentTime: new Date() }) // 结束时间大于当前时间
      .execute();
    this.logger.info(`${result.affected}条数据已过期`);
  }
}
