// src/App.jsx

import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

function App() {
  // Socket 实例
  const [socket, setSocket] = useState(null);

  // 聊天状态
  const [username, setUsername] = useState('');   // 用户名
  const [content, setContent] = useState('');     // 当前输入框内容
  const [messageList, setMessageList] = useState([]); // 存放所有聊天消息

  useEffect(() => {
    // 1. 连接后端 Socket.IO
    //    注意把 http://localhost:3001 替换为你的后端地址/端口
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    // 2. 监听历史消息
    newSocket.on('history', (messages) => {
      setMessageList(messages);
    });

    // 3. 监听后端广播的"receive_message"事件
    newSocket.on('receive_message', (newMsg) => {
      setMessageList((prevList) => [...prevList, newMsg]);
    });

    // 组件卸载时关闭连接
    return () => {
      newSocket.disconnect();
    };
  }, []);

  // 发送消息
  const sendMessage = () => {
    if (!socket) return;
    // 确保用户名和消息内容不为空
    if (username.trim() && content.trim()) {
      socket.emit('send_message', {
        username: username,
        content: content,
      });
      setContent(''); // 发送后清空输入框
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto', textAlign: 'center' }}>
      <h2>聊天室 (Vite + React + Socket.IO)</h2>
      {/* 用户名输入 */}
      <div style={{ marginBottom: '16px' }}>
        <input
          style={{ width: '200px', marginRight: '8px' }}
          placeholder="请输入用户名"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      {/* 消息输入 */}
      <div style={{ marginBottom: '16px' }}>
        <input
          style={{ width: '300px', marginRight: '8px' }}
          placeholder="请输入消息"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              sendMessage();
            }
          }}
        />
        <button onClick={sendMessage}>发送</button>
      </div>
      {/* 消息显示区 */}
      <div
        style={{
          border: '1px solid #ccc',
          height: '300px',
          overflowY: 'auto',
          padding: '8px',
          textAlign: 'left'
        }}
      >
        {messageList.map((msg) => (
          <div key={msg._id || Math.random()}>
            <strong>{msg.username}:</strong> {msg.content}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
