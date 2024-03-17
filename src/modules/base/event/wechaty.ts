import { WechatyBuilder, Message, log } from 'wechaty';
const qrcode = require('qrcode-terminal');

export default class weChaty {
  bot = null;
  constructor() {
    this.bot = WechatyBuilder.build();
    this.bot.on('scan', (qrcode: string) => {
      const qrcodeImageUrl = [
        'https://api.qrserver.com/v1/create-qr-code/?data=',
        encodeURIComponent(qrcode),
      ].join('');

      console.log(`扫码登录:\n ${qrcodeImageUrl} `);
    });
    this.bot.on('message', this.onMessage.bind(this));
    this.bot.on('login', this.onLogin.bind(this));
    this.bot.on('logout', this.onLogout.bind(this));
  }
  async onMessage(message: Message) {
    console.log('message: ', message);

    console.log('消息类型 ', message.payload.type);

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

    if (message.self()) {
      return; // skip self
    }

    if (room) {
      await room.say(`我重复你的话:[${text}]`, talker);
    } else {
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

  onLogin(bot) {
    console.info('Bot logged in:', bot);
  }
  onLogout(user) {
    console.log('user: ', user);
  }

  run() {
    this.bot.start();
  }
}
