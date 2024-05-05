import { Provide } from '@midwayjs/decorator';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { BaseOnmyojiActiveUserItemEntity } from '../../entity/onmyoji/acitveUserItem';

/**
 * 描述
 */
@Provide()
export class BaseOnmyojiAcitveUserItemService extends BaseService {
  @InjectEntityModel(BaseOnmyojiActiveUserItemEntity)
  baseOnmyojiActiveUserItemEntity: Repository<BaseOnmyojiActiveUserItemEntity>;

  /**
   * @description: 根据activeId, activeItemId, userId更新value
   * @param {*} param1
   * @return {*}
   * @author: 池樱千幻
   */
  updateUserItem({ activeId, activeItemId, userId, value }) {
    console.log(
      'activeId, activeItemId, userId, value: ',
      activeId,
      activeItemId,
      userId,
      value
    );
    return this.baseOnmyojiActiveUserItemEntity.update(
      {
        activeId,
        activeItemId,
        userId,
      },
      { value }
    );
  }
}
