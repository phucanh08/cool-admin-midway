import { CoolController, BaseController } from '@cool-midway/core';
import { BaseOnmyojiUserEntity } from '../../../entity/onmyoji/user';

/**
 * 描述
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: BaseOnmyojiUserEntity,
  pageQueryOp: {
    // 添加排序
    addOrderBy: {
      sort: 'ASC',
    },
  },
})
export class BaseOnmyojiUserController extends BaseController {}
