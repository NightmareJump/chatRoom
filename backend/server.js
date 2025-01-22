// backend/server.js
const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const Message = require('./models/message');

const app = express();
app.use(cors());
app.use(express.json()); // 允许解析 JSON 请求体

// 1. 连接 MongoDB
// 如果你使用的是本地 MongoDB，请确保数据库已启动
mongoose
  .connect('mongodb+srv://y62meng:Yanyuemeng1995@cluster0.0frss.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('MongoDB connected (Atlas)!');
  })
  .catch((err) => {
    console.error('MongoDB connection error (Atlas):', err);
  });


// 2. 创建 HTTP 服务器并集成 Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // 或者写你前端的实际地址，如 "http://localhost:3000"
    methods: ['GET', 'POST']
  }
});

// 3. Socket.IO 监听事件
io.on('connection', (socket) => {
  console.log('用户已连接：', socket.id);

  // 3.1 让新连接用户拿到历史消息
  Message.find()
    .sort({ createdAt: 1 })  // 按时间顺序
    .then((messages) => {
      // 发给新连接用户的 socket
      socket.emit('history', messages);
    })
    .catch((err) => console.error(err));

  // 3.2 监听发送消息事件
  // data格式: { username: 'xxx', content: 'hello' }
  socket.on('send_message', async (data) => {
    try {
      // 将消息写入数据库
      const savedMessage = await Message.create({
        username: data.username,
        content: data.content,
      });

      // 广播给所有在线用户
      io.emit('receive_message', savedMessage);
    } catch (err) {
      console.error(err);
    }
  });

  // 3.3 用户断开连接
  socket.on('disconnect', () => {
    console.log('用户断开连接：', socket.id);
  });
});

// 4. 启动服务器
const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
