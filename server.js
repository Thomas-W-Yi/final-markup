const express = require('express');
const path = require('path');
const http = require('http');
const app = express();

const server = http.createServer(app);
const cors = require('cors');
const io = require('socket.io')(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log('new client connected');
  socket.emit('me', socket.id);

  socket.on('disconnect', () => {
    socket.broadcast.emit('callEnded');
  });

  socket.on('callUser', (data) => {
    io.to(data.userToCall).emit('callUser', {
      signal: data.signalData,
      from: data.from,
      name: data.name,
    });
  });

  socket.on('answerCall', (data) => {
    io.to(data.to).emit('callAccepted', data.signal);
  });
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'front-end/build')));
  app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname, 'front-end/build', 'index.html'));
  });
}
server.listen(process.env.PORT || 8000, () =>
  console.log('server is running on port 8000')
);
