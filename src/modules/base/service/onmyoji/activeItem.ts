import { Provide } from '@midwayjs/decorator';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { BaseOnmyojiActiveItemEntity } from '../../entity/onmyoji/acitveItem';
import { BaseOnmyojiActiveUserItemEntity } from '../../entity/onmyoji/acitveUserItem';
import { BaseOnmyojiUserEntity } from '../../entity/onmyoji/user';

const userDefault = {
  'el-input': '',
  'el-Checkbox': '1',
};

/**
 * 描述
 */
@Provide()
export class BaseOnmyojiActiveItemService extends BaseService {
  @InjectEntityModel(BaseOnmyojiActiveItemEntity)
  baseOnmyojiActiveItemEntity: Repository<BaseOnmyojiActiveItemEntity>;

  @InjectEntityModel(BaseOnmyojiActiveUserItemEntity)
  baseOnmyojiActiveUserItemEntity: Repository<BaseOnmyojiActiveUserItemEntity>;

  @InjectEntityModel(BaseOnmyojiUserEntity)
  baseOnmyojiUserEntity: Repository<BaseOnmyojiUserEntity>;

  // 重写add方法
  async add(data: BaseOnmyojiActiveItemEntity) {
    // 新增活动项
    let activeItemObj: any = await super.add(data);

    // 根据返回的活动项id 查询活动项
    let activeItem = await this.baseOnmyojiActiveItemEntity.findOneBy({
      id: activeItemObj.id,
    });

    // 查询阴阳师用户表,并循环添加活动项关联用户
    let onmyojiUserList = await this.baseOnmyojiUserEntity.find();

    // 循环添加活动项关联用户
    for (let i = 0; i < onmyojiUserList.length; i++) {
      let activeUserItemObj = await this.baseOnmyojiActiveUserItemEntity.save({
        activeId: data.activeId,
        activeItemId: activeItem.activeItemId,
        userId: onmyojiUserList[i].userId,
        value: userDefault[data.activeItemType],
      });
    }

    return {};
  }

  // 重写删除
  async delete(data: BaseOnmyojiActiveItemEntity[]) {
    console.log('data: ', data);

    let ids = data.map(item => item.id);

    // // 删除活动项
    await super.delete(ids);

    for (let i = 0; i < data.length; i++) {
      // // 删除活动项关联用户
      await this.baseOnmyojiActiveUserItemEntity.delete({
        activeItemId: data[i].activeItemId,
      });
    }
  }
}
