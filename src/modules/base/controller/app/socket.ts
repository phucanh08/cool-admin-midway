import {
  WSController,
  OnWSConnection,
  Inject,
  OnWSMessage,
  App,
  InjectClient,
  OnWSDisConnection,
} from '@midwayjs/decorator';
import { Context } from '@midwayjs/socketio';
import { Application as SocketApplication } from '@midwayjs/socketio';
import { CachingFactory, MidwayCache } from '@midwayjs/cache-manager';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { BaseSysUserEntity } from '../../entity/sys/user';
import { Repository } from 'typeorm';
import { MessageEntity } from '../../entity/sys/message';
import { v1 as uuid } from 'uuid';

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

  async mergeRadisSet(key: string, value: any) {
    let set: any[] = await this.midwayCache.get(key);
    if (set) {
      set.push(value);
      await this.midwayCache.set(key, set);
    } else {
      await this.midwayCache.set(key, [value]);
    }
  }

  maxServiceCount = 3;

  // 客户端连接
  @OnWSConnection()
  async onConnectionMethod() {
    console.log('on client connect', this.ctx.id);
    console.log('参数', this.ctx.handshake.query);
    let { type, userId } = this.ctx.handshake.query;
    console.log('type', type);

    const count = this.socketApp.of('/chat').sockets.size; // 获取单个 namespace 里的连接数
    console.log('count: ', count);
    const socketsMap = this.socketApp.of('/chat').sockets;
    // console.log('socketsMap: ', socketsMap);

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
      // 将客服添加进客服列表, 等待用户连接
      await this.mergeRadisSet('serviceList', {
        id: userId,
        sid: this.ctx.id,
        name: userInfo.nickName,
        userList: [], // 当前客服连接的用户数量
      });

      // // 创建一个房间
      // const roomsId = `rooms-${userId}-${uuid()}`;
      // // 创建一个客服人员列表

      // await this.midwayCache.set(`rooms-${userId}`, [roomsId]);

      // this.ctx.join(roomsId);
      // messageEntity.roomId = roomsId;
      // // 向redis中添加一个房间列表, 用于存储当前房间的客服人员与后续准备加入的用户
      // await this.midwayCache.set(`rooms-personList-${userId}`, [
      //   {
      //     id: userId,
      //     name: userInfo.nickName,
      //     type: 'service',
      //   },
      // ]);
      //
    } else if (type === 'user') {
      // 从redis中获取客服列表, 依次判断每个客服的连接数量是否超过最大值,如果没有超过就选中当前客服
      let serviceList: any[] = await this.midwayCache.get('serviceList');
      console.log('serviceList: ', serviceList);
      let curService = serviceList?.find(
        item => item.userList.length < this.maxServiceCount
      );
      console.log('curService: ', curService);

      if (!curService) {
        // 没有客服,发送消息等待客服
        this.ctx.emit('no-service', {
          sendUserId: '',
          sendUserName: '',
          roomId: '',
          message: '暂无客服在线,请稍后再试',
          messageType: 'no-service',
          messageTypeDesc: '文本消息',
          isRead: false,
        });
      }

      // 使用当前用户与客服的id组成一个房间id
      let roomId = `room-${userId}-${curService.id}`;
      messageEntity.roomId = roomId;
      // 将用户添加进房间
      this.ctx.join(roomId);
      // 将客服添加进房间,根据socketsMap,找到当前客服的socket连接
      let serviceSocket = socketsMap.get(curService.sid);

      serviceSocket.join(roomId);
      // 将当前用户添加进客服的用户列表
      curService.userList.push({ ...userInfo, sid: this.ctx.id });
      // 更新redis中的客服列表
      await this.midwayCache.set('serviceList', serviceList);
      // 给客服发消息, 告诉客服, 有人连接
      serviceSocket.emit('connect-user-add', {
        sendUserId: userId,
        sendUserName: userInfo.nickName,
        roomId: roomId,
        message: '有人连接',
        messageType: 'connect-user-add',
        messageTypeDesc: '文本消息',
        isRead: false,
        data: curService.userList,
      });
    }
    this.ctx.emit('connect-socket', messageEntity);
  }

  // 消息事件
  @OnWSMessage('sendMsg')
  async gotMessage(data) {
    console.log('on data got', this.ctx.id, data);
    console.log('this.ctx: ', this.ctx.rooms);

    // 将消息内容存入到redis中
    let { userId, msg, roomId } = data;
    const userInfo = await this.baseSysUserEntity.findOneBy({
      id: Number(userId),
    });

    // 根据roomId找到当前房间的所有用户, 并且发送消息
    this.socketApp.of('/chat').in(roomId).emit('message', {
      sendUserId: userId,
      sendUserName: userInfo.nickName,
      roomId: roomId,
      message: msg,
      messageType: 'text',
      messageTypeDesc: '文本消息',
      isRead: false,
    });

    // //  获取当前ctx中的roomId
    // let roomIdSet = this.ctx.rooms;
    // let lastRoomId = Array.from(roomIdSet)[roomIdSet.size - 1];
    // console.log('lastRoomId: ', lastRoomId);

    // const userInfo = await this.baseSysUserEntity.findOneBy({
    //   id: userId,
    // });
    // const messageEntity = new MessageEntity({
    //   sendUserId: userId,
    //   sendUserName: userInfo?.nickName,
    //   roomId: lastRoomId || 'room1',
    //   message: msg,
    //   messageType: 'text',
    //   messageTypeDesc: '文本消息',
    //   isRead: false,
    // });
    // // messageEntity.send(this.ctx, 'data');
    // console.log('messageEntity: ', messageEntity);

    // this.ctx.emit('data', messageEntity);
    // this.socketApp.in(lastRoomId).emit('data', messageEntity);

    // // this.ctx.to('room1').emit('data', {
    // //   type: 'message',
    // //   msg: '消息推送',
    // //   data
    // // });

    // let msgList: MessageEntity[] = await this.midwayCache.get(
    //   `msgList-${lastRoomId}`
    // );
    // if (msgList) {
    //   msgList.push(messageEntity);
    //   this.midwayCache.set(`msgList-${lastRoomId}`, msgList);
    // } else {
    //   this.midwayCache.set(`msgList-${lastRoomId}`, [data]);
    // }
  }

  // 客户端断开连接
  @OnWSDisConnection()
  async onDisconnect() {
    console.log('on client 断开', this.ctx.id);
    // 断开后, 从redis中删除当前客服
    let serviceList: any[] = await this.midwayCache.get('serviceList');
    let curService = serviceList?.find(item => item.sid === this.ctx.id);
    if (curService) {
      await this.midwayCache.del('serviceList');
    } else {
      // 说明是用户断开连接 从客服的用户列表中删除用户,并告知客服
      let serviceList: any[] = await this.midwayCache.get('serviceList');
      serviceList[0].userList = serviceList[0].userList.filter(
        item => item.sid !== this.ctx.id
      );
      await this.midwayCache.set('serviceList', serviceList);
      // 告知客服, 有人断开连接
      const socketsMap = this.socketApp.of('/chat').sockets;
      let serviceSocket = socketsMap.get(serviceList[0].sid);
      serviceSocket.emit('disconnect-user', {
        sendUserId: '',
        sendUserName: '',
        roomId: '',
        message: '有人断开连接',
        messageType: 'disconnect-user',
        messageTypeDesc: '文本消息',
        isRead: false,
        data: serviceList[0].userList,
      });
    }
  }
}
