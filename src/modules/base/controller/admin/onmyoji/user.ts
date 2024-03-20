import { CoolController, BaseController } from '@cool-midway/core';
import { BaseOnmyojiUserEntity } from '../../../entity/onmyoji/user';

/**
 * 描述
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: BaseOnmyojiUserEntity,
})
export class BaseOnmyojiUserController extends BaseController {}
