import { CoolController, BaseController } from '@cool-midway/core';
import { BaseOnmyojiActiveUserItemEntity } from '../../../entity/onmyoji/acitveUserItem';

/**
 * 描述
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: BaseOnmyojiActiveUserItemEntity,
})
export class BaseOnmyojiActiveUserItemController extends BaseController {}
