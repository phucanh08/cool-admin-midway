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

  async getTaskListByDate(date: Date = new Date()) {
    const taskList = await this.baseOnmyojiTaskEntity.find({
      where: {
        taskStartTime: date,
      },
    });
    return taskList;
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
      data.taskEndTime = new Date(
        data.taskStartTime.getTime() + data.delayTime
      );
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
      .where('taskStatus = :taskStatus', { taskStatus: 1 })
      .andWhere('taskEndTime > :currentTime', { currentTime: new Date() })
      .getMany();

    // 根据当前时间减去任务结束时间,计算延迟时间,并将任务加入队列
    for (let i = 0; i < taskList.length; i++) {
      const task = taskList[i];
      const delayTime = task.taskEndTime.getTime() - new Date().getTime();
      console.log('delayTime: ', delayTime);
      this.onmyojiTaskQueue.add(task, {
        delay: delayTime,
      });
    }

    console.log('taskList: ', taskList);
  }
}
