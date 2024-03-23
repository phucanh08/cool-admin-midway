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
    select: ['a.*', 'b.username'],
    // 4.x新增
    join: [
      {
        entity: BaseOnmyojiUserEntity,
        alias: 'b',
        condition: 'a.userId = b.userId',
        type: 'innerJoin',
      },
    ],
  },
})
export class BaseOnmyojiActiveBooksController extends BaseController {}
