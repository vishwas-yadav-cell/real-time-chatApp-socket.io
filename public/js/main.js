const chatForm = document.querySelector('#chat-form');
const chatMessages = document.querySelector('.chat-messages');
const displayRoomName = document.querySelector('#room-name');
const availUserList = document.querySelector('#users');

// var audio = new Audio('../assets/ting.mp3');
// audio.play();

// get username and room from url:
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});


const socket = io();

socket.emit('joinRoom', { username, room });

socket.on('roomUsers', ({ room, users }) => {
    outputRoomName(room);
    outputUsersName(users);
})

socket.on('message', message => {
    outputMessage(message);
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const msg = e.target.elements.msg.value;

    socket.emit('chatMessage', msg);

    e.target.elements.msg.value = "";

    e.target.elements.msg.focus;
});

const outputMessage = (msg) => {
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${msg.userName} <span>on ${msg.time}</span></p>
			            <p class="text">
                            ${msg.text}
                        </p>`;
    document.querySelector('.chat-messages').appendChild(div);
}

const outputRoomName = (roomName) => {
    displayRoomName.innerText = roomName;
}

const outputUsersName = (usersArr) => {
    availUserList.innerHTML = usersArr.map(user => `<li>${user.username} <i class="fa fa-circle"></i></li>`).join('');
}