import { Provide } from '@midwayjs/decorator';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { BaseOnmyojiActiveEntity } from '../../entity/onmyoji/active';

/**
 * 描述
 */
@Provide()
export class BaseOnmyojiActiveService extends BaseService {
  @InjectEntityModel(BaseOnmyojiActiveEntity)
  baseOnmyojiActiveEntity: Repository<BaseOnmyojiActiveEntity>;

  /**
   * 修改之后
   * @param data
   * @param type
   */
  async modifyAfter(
    data: BaseOnmyojiActiveEntity,
    type: 'delete' | 'update' | 'add'
  ) {
    if (type === 'add') {
      console.log('新增之后,将数据插入队列', data);

      // 活动新增之后,
    }
  }
}
