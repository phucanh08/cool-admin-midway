import { CoolController, BaseController } from '@cool-midway/core';
import { BaseOnmyojiActiveEntity } from '../../../entity/onmyoji/active';
import { BaseOnmyojiActiveService } from '../../../service/onmyoji/active';
import { Inject, Post } from '@midwayjs/core';

/**
 * 描述
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: BaseOnmyojiActiveEntity,
  service: BaseOnmyojiActiveService,
})
export class BaseOnmyojiActiveController extends BaseController {
  @Inject()
  baseOnmyojiActiveService: BaseOnmyojiActiveService;
}
