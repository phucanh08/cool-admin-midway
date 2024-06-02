import { BaseOnmyojiTaskService } from './../service/onmyoji/task';
import { CoolEvent, Event } from '@cool-midway/core';
import { App, Config, ILogger, Inject, Logger } from '@midwayjs/core';
import { IMidwayKoaApplication } from '@midwayjs/koa';
import * as fs from 'fs';
import * as path from 'path';
import { v1 as uuid } from 'uuid';

import { WeChatyBot } from '../service/sys/weChatyBot';

/**
 * 修改jwt.secret
 */
@CoolEvent()
export class BaseAppEvent {
  @Logger()
  coreLogger: ILogger;

  @Config('module')
  config;

  @Inject()
  weChatyBot: WeChatyBot;

  @Inject()
  baseOnmyojiTaskService: BaseOnmyojiTaskService;
  @Config('keys')
  configKeys;

  @Config('koa.port')
  port;

  @App()
  app: IMidwayKoaApplication;

  @Event('onMenuInit')
  async onMenuInit() {
    console.log('初始化!!');
    // // 启动微信机器人
    // this.weChatyBot.run();

    // 初始化阴阳师定时任务
    this.baseOnmyojiTaskService.initTask();
    this.checkConfig();
    this.checkKeys();
  }

  /**
   * 检查配置
   */
  async checkConfig() {
    if (this.config.base.jwt.secret == 'cool-admin-xxxxxx') {
      this.coreLogger.warn(
        '\x1B[36m 检测到模块[base] jwt.secret 配置是默认值，请不要关闭！即将自动修改... \x1B[0m'
      );
      setTimeout(() => {
        const filePath = path.join(
          this.app.getBaseDir(),
          'modules',
          'base',
          'config.ts'
        );
        // 替换文件内容
        let fileData = fs.readFileSync(filePath, 'utf8');
        const secret = uuid().replace(/-/g, '');
        this.config.base.jwt.secret = secret;
        fs.writeFileSync(
          filePath,
          fileData.replace('cool-admin-xxxxxx', secret)
        );
        this.coreLogger.info(
          '\x1B[36m [cool:module:base] midwayjs cool module base auto modify jwt.secret\x1B[0m'
        );
      }, 6000);
    }
  }

  /**
   * 检查keys
   */
  async checkKeys() {
    if (this.configKeys == 'cool-admin-keys-xxxxxx') {
      this.coreLogger.warn(
        '\x1B[36m 检测到基础配置[Keys] 是默认值，请不要关闭！即将自动修改... \x1B[0m'
      );
      setTimeout(() => {
        const filePath = path.join(
          this.app.getBaseDir(),
          'config',
          'config.default.ts'
        );
        // 替换文件内容
        let fileData = fs.readFileSync(filePath, 'utf8');
        const secret = uuid().replace(/-/g, '');
        this.config.base.jwt.secret = secret;
        fs.writeFileSync(
          filePath,
          fileData.replace('cool-admin-keys-xxxxxx', secret)
        );
        this.coreLogger.info(
          '\x1B[36m [cool:module:base] midwayjs cool keys auto modify \x1B[0m'
        );
      }, 6000);
    }
  }
}
