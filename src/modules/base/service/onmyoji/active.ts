import { Inject, Provide } from '@midwayjs/decorator';
import { BaseService, CoolTransaction } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';
import { BaseOnmyojiActiveEntity } from '../../entity/onmyoji/active';
import { BaseOnmyojiActiveItemEntity } from '../../entity/onmyoji/acitveItem';
import { BaseOnmyojiUserEntity } from '../../entity/onmyoji/user';
import { BaseOnmyojiActiveUserItemEntity } from '../../entity/onmyoji/acitveUserItem';
import { BaseOnmyojiActiveBooksEntity } from '../../entity/onmyoji/activeBooks';
import { ILogger } from '@midwayjs/core';

/**
 * 描述
 */
@Provide()
export class BaseOnmyojiActiveService extends BaseService {
  @InjectEntityModel(BaseOnmyojiActiveEntity)
  baseOnmyojiActiveEntity: Repository<BaseOnmyojiActiveEntity>;

  @InjectEntityModel(BaseOnmyojiActiveItemEntity)
  baseOnmyojiActiveItemEntity: Repository<BaseOnmyojiActiveItemEntity>;

  @InjectEntityModel(BaseOnmyojiUserEntity)
  baseOnmyojiUserEntity: Repository<BaseOnmyojiUserEntity>;

  @InjectEntityModel(BaseOnmyojiActiveUserItemEntity)
  baseOnmyojiActiveUserItemEntity: Repository<BaseOnmyojiActiveUserItemEntity>;

  @InjectEntityModel(BaseOnmyojiActiveBooksEntity)
  baseOnmyojiActiveBooksEntity: Repository<BaseOnmyojiActiveBooksEntity>;

  @Inject()
  logger: ILogger;
  /**
   * @description: 新增活动,重写add方法
   * @param {BaseOnmyojiActiveEntity} data
   * @param {QueryRunner} queryRunner
   * @return {*}
   * @author: 池樱千幻
   */
  @CoolTransaction({ isolation: 'SERIALIZABLE' })
  async add(data: BaseOnmyojiActiveEntity, queryRunner?: QueryRunner) {
    // 新增活动
    let newActive = await queryRunner.manager.insert<BaseOnmyojiActiveEntity>(
      BaseOnmyojiActiveEntity,
      data
    );
    // 获取到新增的活动ID
    let activeId = newActive.generatedMaps[0].activeId;
    // 根据返回的acitveId,新增1条默认的活动参与项
    let newActiveItem =
      await queryRunner.manager.insert<BaseOnmyojiActiveItemEntity>(
        BaseOnmyojiActiveItemEntity,
        {
          activeId,
          activeItemName: '默认参与项',
          activeItemDesc: '默认参与项描述',
        }
      );

    const activeItemId = newActiveItem.generatedMaps[0].activeItemId;
    // 查询所有用户,并向activeItemUser表中添加默认数据

    let userList = await this.baseOnmyojiUserEntity.find();

    userList.forEach(async user => {
      // activeItemUser表中添加默认数据
      await queryRunner.manager.insert<BaseOnmyojiActiveUserItemEntity>(
        BaseOnmyojiActiveUserItemEntity,
        {
          activeId,
          activeItemId,
          userId: user.userId,
          value: '',
        }
      );
    });
    userList.forEach(async user => {
      // books表中添加默认数据
      await queryRunner.manager.insert<BaseOnmyojiActiveBooksEntity>(
        BaseOnmyojiActiveBooksEntity,
        {
          activeId,
          userId: user.userId,
          activeItemId,
          sort: user.sort,
        }
      );
    });

    return newActive;
  }

  /**
   * @description: 删除活动,重写delete方法
   * @param {any} query
   * @param {any} connectionName
   * @return {*}
   * @author: 池樱千幻
   */
  @CoolTransaction({ isolation: 'SERIALIZABLE' })
  async delete(query: any, queryRunner?: QueryRunner) {
    // 根据id查询当前活动
    let active = await this.baseOnmyojiActiveEntity.findOneBy({
      id: query[0],
    });

    // 根据活动id删除活动参与项
    await this.baseOnmyojiActiveItemEntity.delete({
      activeId: active.activeId,
    });

    // 删除活动项表
    const delActiveItem = await queryRunner.manager.delete(
      BaseOnmyojiActiveItemEntity,
      {
        activeId: active.activeId,
      }
    );
    this.logger.info('活动项表删除成功 %j', delActiveItem);
    // 删除活动记录表
    const delActiveBooks = await queryRunner.manager.delete(
      BaseOnmyojiActiveBooksEntity,
      {
        activeId: active.activeId,
      }
    );
    this.logger.info('活动记录表删除成功 %j', delActiveBooks);

    // 删除活动用户参与表
    const delActiveUserItem = await queryRunner.manager.delete(
      BaseOnmyojiActiveUserItemEntity,
      {
        activeId: active.activeId,
      }
    );
    this.logger.info('活动用户参与表删除成功 %j', delActiveUserItem);

    // 删除活动表
    const delActvie = await queryRunner.manager.delete(
      BaseOnmyojiActiveEntity,
      {
        activeId: active.activeId,
      }
    );
    this.logger.info('活动表删除成功 %j', delActvie);
  }
}
