/*
 * @Description:微信机器人主类
 * @Autor: 池樱千幻
 * @Change: 池樱千幻
 * @Date: 2024-03-18 09:40:06
 * @LastEditTime: 2024-03-19 17:07:18
 */
import { Inject, InjectClient, Singleton } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { CachingFactory, MidwayCache } from '@midwayjs/cache-manager';

import {
  WechatyBuilder,
  Message,
  log,
  Contact,
  BuilderInterface,
} from 'wechaty';
import { BaseWxUserEntity } from '../../entity/sys/wx_user';
import { Repository } from 'typeorm';
import { BaseOnmyojiTaskService } from '../onmyoji/task';
const qrcode = require('qrcode-terminal');

@Singleton()
export class WeChatyBot {
  @InjectEntityModel(BaseWxUserEntity)
  baseWxUserEntity: Repository<BaseWxUserEntity>;

  @Inject()
  baseOnmyojiTaskService: BaseOnmyojiTaskService;

  @InjectClient(CachingFactory, 'default')
  midwayCache: MidwayCache;

  bot = null;
  loginFlag = false;

  constructor() {
    this.bot = WechatyBuilder.build();
    this.bot.on('scan', (qrcode: string) => {
      this.midwayCache.set('a', 1);
      const qrcodeImageUrl = [
        'https://api.qrserver.com/v1/create-qr-code/?data=',
        encodeURIComponent(qrcode),
      ].join('');

      console.log(`扫码登录:\n ${qrcodeImageUrl} \n`);
    });
    this.bot.on('message', this.onMessage.bind(this));
    this.bot.on('login', bot => this.onLogin(bot));
    this.bot.on('logout', this.onLogout);
  }
  async onMessage(message: Message) {
    console.log('消息类型 ', message.payload.type);
    // 消息超时
    if (message.age() > 3 * 60) {
      log.info(
        'Bot',
        'on(message) skip age("%d") > 3 * 60 seconds: "%s"',
        message.age(),
        message
      );
      return;
    }

    const room = message.room();
    // const from = message.from();
    const talker = message.talker();
    const text = message.text();

    if (!talker) {
      return;
    }

    console.log(
      (room ? '[' + (await room.topic()) + ']' : '') +
        '<' +
        talker.name() +
        '>' +
        ':' +
        message
    );
    // 如果消息是自己发的, 就返回
    if (message.self()) {
      return; // skip self
    }

    // 如果当前是群聊, 就@发消息的人
    if (room) {
      this.roomMsg(message);
    } else {
      // 如果是私聊, 就直接回复
      await talker.say(`我重复你的话:[${text}]`);
    }

    // const talker = message.talker();
    // console.log('talker: ', talker);
    // if (
    //   !talker.payload.friend ||
    //   message.payload.roomId ||
    //   talker.payload.type != 1
    // ) {
    //   return;
    // }
    // if (message.payload.type != 7) {
    //   talker.say('我只能处理文字消息,请发送文字内容');
    //   return;
    // }
    // const content = message.text();
    // talker.say(`你好, 我收到了您发的消息 [${content}]`);
  }

  /**
   * @description: 群聊消息处理
   * @param {Message} message
   * @return {*}
   * @author: 池樱千幻
   */
  async roomMsg(message: Message) {
    const room = message.room();
    const talker = message.talker();
    const text = message.text();

    if (text === '初始化') {
      this.loadContactList();
      return;
    }

    if (text === '寄养') {
      this.foster(15000);
      return;
    }

    await this.sendMessageByName(
      '0.0',
      `群聊[${room.payload.topic}]中,[${
        talker.payload.alias || talker.payload.name
      }]说了:[${text}]`
    );
  }

  /**
   * @description: 寄养逻辑, 插入一条onmyoji_task记录,并记录6小时后的时间
   * @return {*}
   * @author: 池樱千幻
   */
  private async foster(delayTime = 6 * 60 * 60 * 1000) {
    this.baseOnmyojiTaskService.add({
      taskName: '寄养',
      taskDesc: '大号寄养到期',
      taskStartTime: new Date(),
      taskStatus: 'ongoing',
      delayTime,
    });
  }

  /**
   * @description: 发送消息给name,内容为content
   * @param {string} name
   * @param {string} content
   * @return {*}
   * @author: 池樱千幻
   */
  async sendMessageByName(name: string, content: string) {
    const contact: Contact = await this.bot.Contact.find(name);
    if (!contact) {
      log.error('Bot', `sendMessageByName: ${name} not found`);
      return;
    }
    await contact.say(content);
  }

  async sendMessageByWxId(wxId: string, content: string) {
    const contact: Contact = await this.bot.Contact.find({ id: wxId });
    if (!contact) {
      log.error('Bot', `sendMessageByWxId: ${wxId} not found`);
      return;
    }
    await contact.say(content);
  }

  /**
   * @description: 初始化联系人,并更新数据库
   * @return {*}
   * @author: 池樱千幻
   */
  async loadContactList() {
    //  清空所有微信联系人
    await this.baseWxUserEntity.clear();

    const contactList = await this.bot.Contact.findAll();
    console.log('长度', contactList.length);

    let savePromise = [];

    for (let i = 0; i < contactList.length; i++) {
      const contact: Contact = contactList[i];
      if (contact.type() === 1) {
        log.info('Bot', `personal ${i}: ${contact.name()} : ${contact.id}`);
        await contact.sync();
        savePromise.push(
          this.baseWxUserEntity.save({
            wxId: contact.id,
            name: contact.name(),
            self: contact.self(),
            alias: contact.payload.alias,
            gender: contact.payload.gender,
            avatar: contact.payload.avatar,
          })
        );
      }
    }

    await Promise.all(savePromise);
    console.log('账号初始化完成...');
    await this.sendMessageByName('0.0', '【生锈】的账号初始化完成...');
  }

  onLogin(bot) {
    console.info('登录成功', bot);
    this.loginFlag = true;
    setTimeout(() => {
      this.loadContactList();
    }, 3000);
  }
  onLogout(user) {
    console.log('user: ', user);
    this.loginFlag = false;
  }

  /**
   * @description: bot启动
   * @return {*}
   * @author: 池樱千幻
   */
  run() {
    this.bot.start().catch(async e => {
      log.error('Bot', 'init() fail: %s', e);
      await this.bot.stop();
      process.exit(-1);
    });
  }
}
