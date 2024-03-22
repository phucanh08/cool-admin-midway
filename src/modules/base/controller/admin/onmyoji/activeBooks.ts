import { CoolController, BaseController } from '@cool-midway/core';
import { BaseOnmyojiActiveBooksEntity } from '../../../entity/onmyoji/activeBooks';
import { BaseOnmyojiActiveBooksService } from '../../../service/onmyoji/activeBooks';

/**
 * 描述
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: BaseOnmyojiActiveBooksEntity,
  service: BaseOnmyojiActiveBooksService,
})
export class BaseOnmyojiActiveBooksController extends BaseController {}
