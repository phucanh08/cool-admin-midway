import { CoolController, BaseController } from '@cool-midway/core';
import { BaseOnmyojiActiveItemEntity } from '../../../entity/onmyoji/acitveItem';

/**
 * 描述
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: BaseOnmyojiActiveItemEntity,
})
export class BaseOnmyojiActiveItemController extends BaseController {}
