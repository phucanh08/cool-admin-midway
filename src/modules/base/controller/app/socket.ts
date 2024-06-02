import {
  WSController,
  OnWSConnection,
  Inject,
  OnWSMessage,
  App,
  InjectClient,
} from '@midwayjs/decorator';
import { Context } from '@midwayjs/socketio';
import { Application as SocketApplication } from '@midwayjs/socketio';
import { CachingFactory, MidwayCache } from "@midwayjs/cache-manager";


/**
 * 测试
 */
@WSController('/chat')
export class ChatController {
  @Inject()
  ctx: Context;

  @App('socketIO')
  socketApp: SocketApplication;

  @InjectClient(CachingFactory, "default")
  midwayCache: MidwayCache;

  // 客户端连接
  @OnWSConnection()
  async onConnectionMethod() {
    console.log('on client connect', this.ctx.id);
    console.log('参数', this.ctx.handshake.query);
    let { type, userId } = this.ctx.handshake.query
    console.log('type', type);

    const count = this.socketApp.of('/chat').sockets.size;     // 获取单个 namespace 里的连接数
    console.log('count: ', count);
    // // 根据type 判断当前如果是客服端连接, 就创建一个房间, 并且将客服人员加入到房间中
    // if (type === 'service') {
    //   // 创建一个房间
    //   this.ctx.join(`rooms-${userId}`);
    //   // 向redis中添加一个房间列表, 用于存储当前房间的客服人员与后续准备加入的用户
    //   this.midwayCache.set(`rooms-personList-${userId}`, [{
    //     id: userId,
    //     name: '客服人员',
    //     type: 'service'
    //   }]);
    //   this.midwayCache.set('rooms', [`rooms-${userId}`])
    //   // 

    //   // 将客服人员加入到房间中
    //   this.ctx.to(`rooms-${userId}`).emit('data', {
    //     type: 'connect',
    //     msg: '连接成功',
    //     data: {}
    //   });

    // } else if (type === 'user') {
    //   let rooms = await this.midwayCache.get('rooms')
    //   let roomsId = rooms[0]
    //   this.ctx.join(roomsId);
    //   // 将用户加入到房间中
    //   this.ctx.to(roomsId).emit('data', {
    //     type: 'connect',
    //     msg: '连接成功',
    //     data: {}
    //   });


    // }
    this.ctx.join('room1')

    this.ctx.emit('data', {
      type: 'connect',
      msg: '连接成功',
      data: {
        id: this.ctx.id,
        hisMsgList: await this.midwayCache.get('msgList-room1')
      }
    });

  }

  // 消息事件
  @OnWSMessage('sendMsg')
  async gotMessage(data) {
    console.log('on data got', this.ctx.id, data);


    this.ctx.to('room1').emit('data', {
      type: 'message',
      msg: '消息推送',
      data
    });
    // 将消息内容存入到redis中
    let { userId, msg } = data

    let msgList: any[] = await this.midwayCache.get('msgList-room1')
    if (msgList) {
      msgList.push(data)
      this.midwayCache.set('msgList-room1', msgList)
    } else {
      this.midwayCache.set('msgList-room1', [data])
    }
  }
}
