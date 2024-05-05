import { Provide } from '@midwayjs/decorator';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { BaseOnmyojiActiveBooksEntity } from '../../entity/onmyoji/activeBooks';
import { BaseOnmyojiActiveUserItemEntity } from '../../entity/onmyoji/acitveUserItem';

/**
 * 描述
 */
@Provide()
export class BaseOnmyojiActiveBooksService extends BaseService {
  @InjectEntityModel(BaseOnmyojiActiveBooksEntity)
  baseOnmyojiActiveBooksEntity: Repository<BaseOnmyojiActiveBooksEntity>;

  @InjectEntityModel(BaseOnmyojiActiveUserItemEntity)
  baseOnmyojiActiveUserItemEntity: Repository<BaseOnmyojiActiveUserItemEntity>;

  /**
   * @description: 分页重写
   * @param {any} query
   * @param {any} option
   * @param {any} connectionName
   * @return {*}
   * @author: 池樱千幻
   */
  async page(query: any, option: any, connectionName?: any) {
    let activeUserItemList = await this.baseOnmyojiActiveUserItemEntity.find({
      where: {
        activeId: query.activeId,
      },
    });
    const result = await super.page(query, option, connectionName);
    // 拼接activeUserItem的数据到list中
    result.list = result.list.map((item: any) => {
      let obj = item;
      activeUserItemList.forEach((activeUserItem: any) => {
        if (item.userId === activeUserItem.userId) {
          obj[`prop${activeUserItem.activeItemId}`] = activeUserItem.value;
        }
      });
      return obj;
    });

    // 你自己的业务逻辑
    return result;
  }
}
