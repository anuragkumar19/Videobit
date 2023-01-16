/* eslint-disable */
const socket = io('/');
const myPeer = new Peer();

const { roomId, password, name: Name } = Qs.parse(location.search, {
    ignoreQueryPrefix: true,
});

// Getting Elements
const msgSendBtn = document.getElementById('msgSendBtn');
const messagesCont = document.getElementById('messages-cont');
const msgInp = document.getElementById('msg-inp');
const usersConatiner = document.getElementById('users-conatiner');
const MUBtn = document.getElementById('mute-unmute-btn');
const PPBtn = document.getElementById('video-play-btn');

const myVideo = document.createElement('video');
myVideo.muted = true;

let myVideoStream;
const peers = {};

navigator.mediaDevices
    .getUserMedia({
        video: true,
        audio: true,
    })
    .then((stream) => {
        addVideo(myVideo, stream);
        myVideoStream = stream;
        myPeer.on('call', (call) => {
            call.answer(stream);

            const video = document.createElement('video');

            call.on('stream', (userVideoStream) => {
                addVideo(video, userVideoStream);
            });
        });

        socket.on('user-connected', ({ userId }) => {
            connectToNewUser(userId, stream);
        });
    })
    .catch((err) => {
        console.log(err);
        alert('Please allow camera and mic.');
    });

myPeer.on('open', (id) => {
    socket.emit('join-user', { roomId, password, userId: id, Name });
});

socket.on('user-disconnected', (userId) => {
    if (peers[userId]) peers[userId].close();
});

msgSendBtn.addEventListener('click', (e) => {
    e.preventDefault();
    let msg = msgInp.value;
    if (typeof msg != 'string') return;
    msg = msg.trim();
    if (!msg) return;
    socket.emit('chatMessage', msg);
    msgInp.value = '';
});

socket.on('message', (message) => {
    let html = `<div class="msg ${
        message.user.id == socket.id ? 'right' : 'left'
    } clearfix grey darken-4">
    <div class="msg-meta-data">
        <span class="msg-sender-name">${message.user.user}</span>
        <span class="msg-sending-time">
            ${new Date(message.time).toLocaleTimeString()}
        </span>
    </div>
    ${message.text}
</div>`;

    messagesCont.innerHTML += html;
    messagesCont.scrollTop = messagesCont.scrollHeight;
});

socket.on('roomUsers', (users) => {
    usersConatiner.innerHTML = '';
    users.users.forEach((user) => {
        usersConatiner.innerHTML += `<li><a href="#">${user.user}</a></li>`;
    });
});

function connectToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream);
    const video = document.createElement('video');
    let i;

    call.on('stream', (userVideoStream) => {
        i = addVideo(video, userVideoStream);
    });

    call.on('close', () => {
        videoSplide.remove(i);
        video.remove();
    });

    peers[userId] = call;
}

function addVideo(video, stream) {
    video.classList.add('splide__slide');
    video.style.width = '100%';

    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    });

    return videoSplide.add(video).length - 1;
}

// Toggle Mute/unmute Video
MUBtn.addEventListener('click', muteUnmute);

function muteUnmute(e) {
    e.preventDefault();
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        // setUnmuteButton
        MUBtn.innerHTML = `<i class="fa fa-microphone-slash"></i>`;
        MUBtn.style.color = 'red';
    } else {
        // setMuteButton();
        MUBtn.innerHTML = `<i class="fa fa-microphone"></i>`;
        MUBtn.style.color = 'white';
        myVideoStream.getAudioTracks()[0].enabled = true;
    }
}

// Toggle Play/Pause Video
PPBtn.addEventListener('click', playStop);

function playStop(e) {
    e.preventDefault();
    let enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        // setPlayVideo()
        PPBtn.innerHTML = `<i class="fa fa-video-slash"></i>`;
        PPBtn.style.color = 'red';
    } else {
        // setStopVideo()
        PPBtn.innerHTML = `<i class="fa fa-video"></i>`;
        PPBtn.style.color = 'white';
        myVideoStream.getVideoTracks()[0].enabled = true;
    }
}
