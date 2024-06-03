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
import { CachingFactory, MidwayCache } from '@midwayjs/cache-manager';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { BaseSysUserEntity } from '../../entity/sys/user';
import { Repository } from 'typeorm';
import { MessageEntity } from '../../entity/sys/message';

/**
 * 测试
 */
@WSController('/chat')
export class ChatController {
  @Inject()
  ctx: Context;

  @App('socketIO')
  socketApp: SocketApplication;

  @InjectClient(CachingFactory, 'default')
  midwayCache: MidwayCache;

  @InjectEntityModel(BaseSysUserEntity)
  baseSysUserEntity: Repository<BaseSysUserEntity>;

  // 客户端连接
  @OnWSConnection()
  async onConnectionMethod() {
    console.log('on client connect', this.ctx.id);
    console.log('参数', this.ctx.handshake.query);
    let { type, userId } = this.ctx.handshake.query;
    console.log('type', type);

    const count = this.socketApp.of('/chat').sockets.size; // 获取单个 namespace 里的连接数
    console.log('count: ', count);

    const userInfo = await this.baseSysUserEntity.findOneBy({
      id: Number(userId),
    });

    const messageEntity = new MessageEntity({
      sendUserId: userId,
      sendUserName: userInfo.nickName,
      roomId: '',
      message: '系统消息',
      messageType: 'connect',
      messageTypeDesc: '文本消息',
      isRead: false,
    });

    // 根据type 判断当前如果是客服端连接, 就创建一个房间, 并且将客服人员加入到房间中
    if (type === 'service') {
      // 创建一个房间
      const roomsId = `rooms-${userId}`;
      this.ctx.join(roomsId);
      messageEntity.roomId = roomsId;
      // 向redis中添加一个房间列表, 用于存储当前房间的客服人员与后续准备加入的用户
      this.midwayCache.set(`rooms-personList-${userId}`, [
        {
          id: userId,
          name: userInfo.nickName,
          type: 'service',
        },
      ]);
      this.midwayCache.set('rooms', [roomsId]);
      //
    } else if (type === 'user') {
      // let rooms = await this.midwayCache.get('rooms')
      // let roomsId = rooms[0]
      // this.ctx.join(roomsId);
      // // 将用户加入到房间中
      // this.ctx.to(roomsId).emit('data', {
      //   type: 'connect',
      //   msg: '连接成功',
      //   data: {}
      // });
    }
    this.ctx.emit('data', messageEntity);

    // messageEntity.send(this.ctx, 'data');
  }

  // 消息事件
  @OnWSMessage('sendMsg')
  async gotMessage(data) {
    console.log('on data got', this.ctx.id, data);

    // 将消息内容存入到redis中
    let { userId, msg } = data;
    //  获取当前ctx中的roomId
    let roomIdSet = this.ctx.rooms;
    let lastRoomId = Array.from(roomIdSet)[roomIdSet.size - 1];
    console.log('lastRoomId: ', lastRoomId);

    const userInfo = await this.baseSysUserEntity.findOneBy({
      id: userId,
    });
    const messageEntity = new MessageEntity({
      sendUserId: userId,
      sendUserName: userInfo?.nickName,
      roomId: lastRoomId || 'room1',
      message: msg,
      messageType: 'text',
      messageTypeDesc: '文本消息',
      isRead: false,
    });
    // messageEntity.send(this.ctx, 'data');
    console.log('messageEntity: ', messageEntity);

    this.ctx.emit('data', messageEntity);

    // this.ctx.to('room1').emit('data', {
    //   type: 'message',
    //   msg: '消息推送',
    //   data
    // });

    let msgList: MessageEntity[] = await this.midwayCache.get(
      `msgList-${lastRoomId}`
    );
    if (msgList) {
      msgList.push(messageEntity);
      this.midwayCache.set(`msgList-${lastRoomId}`, msgList);
    } else {
      this.midwayCache.set(`msgList-${lastRoomId}`, [data]);
    }
  }
}
