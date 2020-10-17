const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users');
const moment = require('moment');

const app = express();

const server = http.createServer(app);
const io = socketio(server);

const botName = 'Notify-ChatBot';

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', socket => {
    socket.on('joinRoom', async ({ username, room }) => {
        const user = await userJoin(socket.id, username, room);

        socket.join(user.room);

        socket.emit('message', formatMessage(botName, 'Welcome to the ChatCord!'));

        socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} has joined the chat!`));

        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: await getRoomUsers(user.room)
        })
    });

    socket.on('chatMessage', async (msg) => {
        const user = await getCurrentUser(socket.id);
        io.to(user.room).emit('message', formatMessage(user.username, msg));
    });

    socket.on('disconnect', async () => {
        const user = await userLeave(socket.id);

        if (user) {
            io.to(user.room).emit('message', formatMessage(botName, `${user.username} has left the chat!`));
        }

        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: await getRoomUsers(user.room)
        })
    });
});


const port = process.env.PORT || 3000;
server.listen(port, () => console.log(`Server on port : ${port}`));