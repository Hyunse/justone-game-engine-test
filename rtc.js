let localVideo;
let localStream;
let remoteVideo;
let peerConnection;
let uuid;
let serverConnection;
let socket;

let peerConnectionConfig = {
  iceServers: [
    { urls: 'stun:stun.stunprotocol.org:3478' },
    { urls: 'stun:stun.l.google.com:19302' },
  ],
};

function initWebRTC(socket) {
  scoket = socket;

  localVideo = document.getElementById('localVideo');
  remoteVideo = document.getElementById('remoteVideo');

  let constraints = {
    video: true,
    audio: true,
  };

  if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then(getUserStream)
      .catch((err) => {
        console.log(err);
      });
  } else {
    console.log('This browser does not support getUserMedia API');
  }
}

function getUserStream(stream) {
  localStream = stream;
  localVideo.srcObject = stream;
}

function startWebRTC(call) {
  peerConnection = new RTCPeerConnection(peerConnectionConfig);
  peerConnection.onicecandidate = handleIceCandidate;
  peerConnection.addStream(localStream);

  if(call) {

  }
}

function doCall() {
  peerConnection.createOffer()
}

function handleIceCandidate(event) {
  if (event.candidate) {
    sendMessage({
      type: 'candidate',
      label: event.candidate.sdpMLineIndex,
      id: event.candidate.sdpMid,
      candidate: event.candidate.candidate,
    });
  } else {
    console.log('end of candidates');
  }
}

function sendMessage(message) {
  console.log('Client sending message: ', message);
  socket.emit('message', message);
}
