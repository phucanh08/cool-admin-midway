import { Provide } from '@midwayjs/decorator';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { BaseOnmyojiActiveBooksEntity } from '../../entity/onmyoji/activeBooks';

/**
 * 描述
 */
@Provide()
export class BaseOnmyojiActiveBooksService extends BaseService {
  @InjectEntityModel(BaseOnmyojiActiveBooksEntity)
  baseOnmyojiActiveBooksEntity: Repository<BaseOnmyojiActiveBooksEntity>;

  /**
   * @description: 分页重写
   * @param {any} query
   * @param {any} option
   * @param {any} connectionName
   * @return {*}
   * @author: 池樱千幻
   */
  async page(query: any, option: any, connectionName?: any) {
    console.log('connectionName: ', connectionName);
    console.log('option: ', option);
    console.log('query: ', query);
    const result = await super.page(query, option, connectionName);
    console.log('result: ', result);

    // 你自己的业务逻辑
    return result;
  }
}
