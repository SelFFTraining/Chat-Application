const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage, generateLinkMessage} = require('./utils/message')
const app = express()
const server = http.createServer(app)
const io = socketio(server)
const {addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users')
const PORT = process.env.PORT || 3000
const PUBLIC_PATH = path.join(__dirname, '../public')


app.use(express.static(PUBLIC_PATH))
app.use(express.json())

io.on('connection', (socket) => {

    socket.on('join', (options, callback) => {
        const {error, user} = addUser({id: socket.id, ...options})
        if (error) {
            return callback(error)
        }
        socket.join(user.room)
        socket.emit('newMessage', generateMessage('Welcome!', 'System'))
        socket.broadcast.to(user.room).emit('notification', `${user.username} has joined!`)
        io.to(user.room).emit('roomData', {room: user.room, users: getUsersInRoom(user.room)})
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if (user) {
            io.to(user.room).emit('notification', `${user.username} has left.`)
            io.to(user.room).emit('roomData', {room: user.room, users: getUsersInRoom(user.room)})
        }
    })
    socket.on('sendMessage', (msg, callback) => {
        const user = getUser(socket.id)
        const filter = new Filter()
        if (filter.isProfane(msg)) {
            return callback('Message not delivered. Profane not allowed')
        }
        if(user) {
            io.to(user.room).emit('newMessage', generateMessage(msg, user.username))
            callback()
        }

    })
    socket.on('selfMessage', (msg) => {
        socket.emit('newMessage', generateMessage(msg, 'System'))
    })

    socket.on('sendLocation', (latitude, longitude, callback) => {
        const user = getUser(socket.id)
        if (!latitude || !longitude) {
            return callback('Location not delivered. Latitude and Longitude are require')
        }
        io.to(user.room).emit('linkMessage', generateLinkMessage(`https://google.com/maps?q=${latitude},${longitude}`, 'My Current Location'))
        callback()

    })
})

server.listen(PORT, () => {
    console.log('Connected on server ' + PORT);
}).on('error', (e) => {
    console.log('Error while connecting server on port ' + PORT + '. Error ' + e.message)
})