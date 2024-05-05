import { CoolController, BaseController } from '@cool-midway/core';
import { BaseOnmyojiActiveUserItemEntity } from '../../../entity/onmyoji/acitveUserItem';
import { BaseOnmyojiAcitveUserItemService } from '../../../service/onmyoji/acitveUserItem';
import { Body, Inject, Post } from '@midwayjs/core';

/**
 * 描述
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: BaseOnmyojiActiveUserItemEntity,
  service: BaseOnmyojiAcitveUserItemService,
})
export class BaseOnmyojiActiveUserItemController extends BaseController {
  @Inject()
  baseOnmyojiAcitveUserItemService: BaseOnmyojiAcitveUserItemService;

  @Post('/updateUserItem')
  async updateUserItem(
    @Body('value') value: string,
    @Body('userId') userId: string,
    @Body('activeItemId') activeItemId: string,
    @Body('activeId') activeId: string
  ) {
    await this.baseOnmyojiAcitveUserItemService.updateUserItem({
      activeId,
      activeItemId,
      userId,
      value,
    });

    return this.ok('修改成功');
  }
}
