import {
  Aspect,
  ILogger,
  IMethodAspect,
  Inject,
  JoinPoint,
} from '@midwayjs/core';
import { WeChatyBot } from '../service/sys/weChatyBot';
import { CoolCommException } from '@cool-midway/core';

@Aspect(WeChatyBot)
export class ReportInfo implements IMethodAspect {
  @Inject()
  logger: ILogger;

  async before(point: JoinPoint) {
    this.logger.info('');

    console.log('AOP调用的方法', point.methodName);
    const weChatyBot = point.target as WeChatyBot;
    if (!weChatyBot.loginFlag && point.methodName !== 'run') {
      throw new CoolCommException('机器人未登录');
    }
  }
}
