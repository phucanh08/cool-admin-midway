import { CoolController, BaseController } from '@cool-midway/core';
import { BaseOnmyojiTaskEntity } from '../../../entity/onmyoji/task';
import { Inject } from '@midwayjs/core';
import { BaseOnmyojiTaskService } from '../../../service/onmyoji/task';

/**
 * 描述
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: BaseOnmyojiTaskEntity,
  service: BaseOnmyojiTaskService,
})
export class BaseOnmyojiTaskController extends BaseController {
  @Inject()
  baseOnmyojiTaskService: BaseOnmyojiTaskService;

  // async add() {
  //   await this.baseOnmyojiTaskService.add();
  //   return this.ok();
  // }
}
