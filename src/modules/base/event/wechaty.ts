import { WechatyBuilder } from 'wechaty';
const qrcode = require('qrcode-terminal');

export default class weChaty {
  bot = null;
  constructor() {
    this.bot = WechatyBuilder.build();
    this.bot.on('scan', code => {
      qrcode.generate(code, { small: true });
    });
    this.bot.on('message', this.onMessage.bind(this));
    this.bot.on('login', this.onLogin.bind(this));
    this.bot.on('logout', this.onLogout.bind(this));
  }
  onMessage(message) {
    console.log('message: ', message);
    const talker = message.talker();
    if (
      !talker.payload.friend ||
      message.payload.roomId ||
      talker.payload.type != 1
    ) {
      return;
    }
    if (message.payload.type != 7) {
      talker.say('我只能处理文字消息,请发送文字内容');
      return;
    }
    const content = message.text();
    talker.say(`你好, 我收到了您发的消息 [${content}]`);
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
