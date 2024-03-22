import { Provide } from '@midwayjs/decorator';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { BaseOnmyojiActiveEntity } from '../../entity/onmyoji/active';

/**
 * 描述
 */
@Provide()
export class BaseOnmyojiActiveService extends BaseService {
  @InjectEntityModel(BaseOnmyojiActiveEntity)
  baseOnmyojiActiveEntity: Repository<BaseOnmyojiActiveEntity>;
}
