import { Provide } from '@midwayjs/decorator';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { BaseOnmyojiUserEntity } from '../../entity/onmyoji/user';

/**
 * 描述
 */
@Provide()
export class BaseOnmyojiUserService extends BaseService {
  @InjectEntityModel(BaseOnmyojiUserEntity)
  baseOnmyojiUserEntity: Repository<BaseOnmyojiUserEntity>;
}
