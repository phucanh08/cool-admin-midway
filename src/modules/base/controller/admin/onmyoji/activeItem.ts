import { CoolController, BaseController } from '@cool-midway/core';
import { BaseOnmyojiActiveItemEntity } from '../../../entity/onmyoji/acitveItem';
import { BaseOnmyojiActiveItemService } from '../../../service/onmyoji/activeItem';

/**
 * 描述
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: BaseOnmyojiActiveItemEntity,
  service: BaseOnmyojiActiveItemService,
  listQueryOp: {
    fieldEq: ['activeId'],
  },
})
export class BaseOnmyojiActiveItemController extends BaseController {}
