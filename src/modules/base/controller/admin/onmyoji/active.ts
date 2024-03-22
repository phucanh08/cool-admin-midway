import { CoolController, BaseController } from '@cool-midway/core';
import { BaseOnmyojiActiveEntity } from '../../../entity/onmyoji/active';

/**
 * 描述
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: BaseOnmyojiActiveEntity,
})
export class BaseOnmyojiActiveController extends BaseController {}
