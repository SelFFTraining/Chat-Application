const users = []

addUser = ({id, username, room}) => {
    if (!username || !room) {
        return {
            error: 'username and room are required'
        }
    }
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()
    if (users.find(user => user.username === username && user.room === room)) {
        return {
            error: 'username is in use'
        }
    }
    const user = {id, username, room}
    users.push(user)
    return {user}
}

removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)
    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}

getUser = (id) => {
    return users.find(user => user.id === id)
}
getUsersInRoom = (room) => {
    room = room.trim().toLowerCase()
    return users.filter(user => user.room === room)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}