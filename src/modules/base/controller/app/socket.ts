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
import { ChatMessageLogEntity } from '../../entity/chat/message_log';
import { join } from 'path';

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

  @InjectEntityModel(ChatMessageLogEntity)
  chatMessageLogEntity: Repository<ChatMessageLogEntity>;

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

    const count = this.socketApp.of('/chat').sockets.size; // 获取单个 namespace 里的连接数
    console.log('当前连接数量: ', count);
    const socketsMap = this.socketApp.of('/chat').sockets;
    // console.log('socketsMap: ', socketsMap.);

    const userInfo = await this.baseSysUserEntity.findOneBy({
      id: Number(userId),
    });
    this.ctx.data = {
      userInfo,
    };

    // 用户连接进来的时候,将用户加入到redis中
    // let userMap = await this.midwayCache.get('userMap');
    // if (typeof userId === 'string') {
    //   if (userMap) {
    //     userMap[userId] = {
    //       ...userInfo,
    //       sid: this.ctx.id,
    //     };
    //     await this.midwayCache.set('userMap', userMap);
    //   } else {
    //     await this.midwayCache.set('userMap', {
    //       [userId]: {
    //         ...userInfo,
    //         sid: this.ctx.id,
    //       },
    //     });
    //   }
    // }

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
      let serviceObj = {
        id: userId,
        sid: this.ctx.id,
        name: userInfo.nickName,
        userList: [], // 当前客服连接的用户数量
      };

      // 查询用户等待列表,如果发现有用户, 就将用户与客服连接
      serviceObj.userList = (await this.connectWaitUserList(userInfo)) || [];
      messageEntity.data = serviceObj.userList;
      await this.mergeRadisSet('serviceList', serviceObj);
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

        // 将用户加入一个等待客服的列表里, 当有客服的时候, 让客服与用户连接
        await this.mergeRadisSet('waitUserList', {
          ...userInfo,
          sid: this.ctx.id,
          joinTime: +new Date(),
        });

        return;
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
    console.log('this.ctx: ', this.ctx.rooms);
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

    // 找到当前房间的两个sockets对象, 只会有两个,如果有多个就有问题.
    const sockets = await this.socketApp.of('/chat').in(roomId).fetchSockets();
    console.log('sockets: ', sockets);
    let receiveSocket = null;

    for (const socket of sockets) {
      console.log(socket.id, this.ctx.id);
      if (socket.id !== this.ctx.id) {
        receiveSocket = socket;
      }

      console.log(socket.rooms);
      // console.log(socket.data);
      // socket.emit(/* ... */);
      // socket.join(/* ... */);
      // socket.leave(/* ... */);
      // socket.disconnect(/* ... */);
    }
    console.log(receiveSocket.data);
    this.chatMessageLogEntity.save({
      sendUserId: userInfo.id,
      sendUserName: userInfo.nickName,
      receiveUserId: receiveSocket.data.userInfo.id,
      receiveUserName: receiveSocket.data.userInfo.nickName,
      message: msg,
      messageType: 'text',
      roomId,
      messageTime: new Date(),
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
      if (serviceList && serviceList?.length > 0) {
        // 找到断开连接的用户
        const disconnectUser = serviceList[0].userList.find(
          item => item.sid === this.ctx.id
        );

        serviceList[0].userList = serviceList[0].userList.filter(
          item => item.sid !== this.ctx.id
        );
        await this.midwayCache.set('serviceList', serviceList);
        // 告知客服, 有人断开连接
        const socketsMap = this.socketApp.of('/chat').sockets;
        let serviceSocket = socketsMap.get(serviceList[0].sid);
        serviceSocket.emit('disconnect-user', {
          disconnectUser,
          message: '有人断开连接',
          messageType: 'disconnect-user',
          messageTypeDesc: '文本消息',
          isRead: false,
          data: serviceList[0].userList,
        });
      }

      // 从waitUserList中删除用户
      let waitUserList: any[] = await this.midwayCache.get('waitUserList');
      waitUserList =
        waitUserList?.filter(item => item.id !== this.ctx.data.userInfo.id) ||
        [];
      await this.midwayCache.set('waitUserList', waitUserList);
    }
  }

  /**
   * @description: 根据waitUserList,找到当前客服可以连接的最大用户数量, 然后从waitUserList中根据加入时间的先后挑选用户,将用户与客服连接
   * @return {*}
   * @author: 池樱千幻
   */
  async connectWaitUserList(serviceInfo) {
    let waitUserList: any[] = await this.midwayCache.get('waitUserList');
    console.log('waitUserList: ', waitUserList);
    const socketsMap = this.socketApp.of('/chat').sockets;

    // 根据时间排序,获取当前客服可以连接的最大用户数量
    let newWaitUserList = waitUserList
      ?.sort((a, b) => a.joinTime - b.joinTime)
      .slice(0, this.maxServiceCount);

    newWaitUserList?.forEach(item => {
      let roomId = `room-${item.id}-${serviceInfo.id}`;
      this.ctx.join(roomId);
      let userSocket = socketsMap.get(item.sid);
      userSocket.join(roomId);
      userSocket.emit('connect-service-add', {
        sendUserId: item.id,
        sendUserName: item.nickName,
        roomId: roomId,
        message: '客服已连接',
        messageType: 'connect-service-add',
        messageTypeDesc: '文本消息',
        isRead: false,
        data: {
          serviceInfo,
        },
      });
    });
    // 删除waitUserList中time排序后,剩下的用户
    await this.midwayCache.del('waitUserList');
    return newWaitUserList;
  }
}
