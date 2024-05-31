import { CoolController, BaseController } from '@cool-midway/core';
import { InjectClient, Post } from '@midwayjs/core';
import { CachingFactory, MidwayCache } from '@midwayjs/cache-manager';

/**
 * 描述
 */
@CoolController({})
export class weChatyBotController extends BaseController {
  @InjectClient(CachingFactory, 'default')
  midwayCache: MidwayCache;

  @Post('/getQrCode')
  async getQrCode() {
    let qrcode_60 = await this.midwayCache.get('qrcode_60');
    console.log('qrcode_60: ', qrcode_60);

    return this.ok(qrcode_60 || 'error');
  }

  // 刷新二维码code
  @Post('/refreshQrCode')
  async refreshQrCode() {
    console.log('重启bot');
    let qrcode_60 = await this.midwayCache.get('qrcode_60');
    console.log('qrcode_60: ', qrcode_60);

    return this.ok(qrcode_60 || 'error');
  }
}
