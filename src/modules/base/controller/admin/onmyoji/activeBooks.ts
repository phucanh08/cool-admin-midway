import { CoolController, BaseController } from '@cool-midway/core';
import { BaseOnmyojiActiveBooksEntity } from '../../../entity/onmyoji/activeBooks';
import { BaseOnmyojiActiveBooksService } from '../../../service/onmyoji/activeBooks';
import { BaseOnmyojiUserEntity } from '../../../entity/onmyoji/user';

/**
 * 描述
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: BaseOnmyojiActiveBooksEntity,
  service: BaseOnmyojiActiveBooksService,
  pageQueryOp: {
    keyWordLikeFields: ['b.username', 'b.userId'],
    select: ['a.*', 'b.username'],
    fieldEq: ['activeId'],

    // 4.x新增
    join: [
      {
        entity: BaseOnmyojiUserEntity,
        alias: 'b',
        condition: 'a.userId = b.userId',
        type: 'leftJoin',
      },
    ],
    // 添加排序
    addOrderBy: {
      sort: 'ASC',
    },
  },
})
export class BaseOnmyojiActiveBooksController extends BaseController {}
