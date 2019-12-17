const socket = io()

//Elements
const $messageForm = document.querySelector('form')
const $messageFormInput = document.querySelector('input')
const $messageFormButton = document.querySelector('button')
const $shareLocationButton = document.querySelector('#share-location')
const $messages = document.querySelector('#messages')
const $sideBar = document.querySelector('#sidebar')

//Templates
const $messageTemplate= document.querySelector('#message-template').innerHTML
const $linkTemplate= document.querySelector('#link-template').innerHTML
const $notificationTemplate= document.querySelector('#chat-notification-template').innerHTML
const $sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoscroll = ()=>{

    //new message
    const $newMessage = $messages.lastElementChild

    //new Message height including margin
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //Messages visible height
    const messagesVisibleHeight = $messages.offsetHeight

    //Message container height
    const messagesContainerHeight = $messages.scrollHeight

    //How far user has scrolled
    const scrollOffSet = $messages.scrollTop+messagesVisibleHeight

    if(messagesContainerHeight - newMessageHeight<= scrollOffSet) {
        $messages.scrollTop = $messages.scrollHeight
    }
}
socket.on('newMessage', (msgObj)=>{
    const msgHtml = Mustache.render($messageTemplate, {
        username: msgObj.username,
        message: msgObj.text,
        createdAt: moment(msgObj.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML("beforeend", msgHtml)
    autoscroll()
})
socket.on('notification', (notification)=>{
    const noficationTemplate = Mustache.render($notificationTemplate, {notification})
    $messages.insertAdjacentHTML("beforeend", noficationTemplate)
    autoscroll()
})
socket.on('linkMessage', ({link, linkName, createdAt})=>{
    const msgHtml = Mustache.render($linkTemplate, {
        link,
        linkName,
        createdAt: moment(createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML("beforeend", msgHtml)
    autoscroll()
})
socket.on('roomData', ({room, users})=>{
    const html = Mustache.render($sidebarTemplate, {
        room,
        users
    })
    $sideBar.innerHTML = html

})
$messageForm.addEventListener('submit', (e)=>{
    e.preventDefault()
    $messageFormButton.setAttribute('disable', 'disable')
    socket.emit('sendMessage', e.target.elements.message.value, (error)=>{
        $messageFormInput.value = ''
        $messageFormButton.removeAttribute('disable')
        $messageFormInput.focus()
        if(error) {
            return socket.emit('selfMessage', error)
        }
        socket.emit('selfMessage', 'Message Delivered!')
    })

})

$shareLocationButton.addEventListener('click', ()=>{
    if(!navigator.geolocation){
        return alert('Your browser does not support Geo Location')
    }
    $shareLocationButton.setAttribute('disable', 'disable')
    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit('sendLocation', position.coords.latitude, position.coords.longitude, (error)=>{
            $shareLocationButton.removeAttribute('disable')
            if(error) {
                return socket.emit('selfMessage', error)
            }
            socket.emit('selfMessage', 'Message Delivered!')
        })
    })
})

socket.emit('join', {username, room}, (error)=>{
    if(error) {
        alert(error)
        location.href = '/'
    }
})