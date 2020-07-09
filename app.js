const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
let Game = require('./engine/Game');
const Player = require('./engine/Player');
const MatchManager = require('./engine/MatchManager')

const Match = new MatchManager();
let game;

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log('User Connected!!');
  /**
   * Join Room
   */
  socket.on('join room', function ({ player, roomName }) {
    const newPlayer = new Player(player.id, player.name);

    if(!Match.checkRoomExist(roomName)) {
      Match.createRoom(roomName);
    }

    // Join Room
    const gameState = Match.joinRoom(roomName, newPlayer);

    socket.join(roomName);

    console.log(
      `Name[ ${newPlayer.name} ] Email [${newPlayer.id}] Join Room [${roomName}]`
    );

    // go to wait room.
    io.sockets.in(roomName).emit('wait', gameState);
  });

  /**
   * Chat Message
   */
  socket.on('chat message', ({ roomName, player }) => {
    console.log(`Clue is ${player.msg} from ${player.name}`);

    io.sockets.in(roomName).emit('chat message', player);
  });

  /**
   * Game Start
   */
  socket.on('game start', ({ roomName }) => {
    const gameState = Match.startGame(roomName);

    console.log('Game Start : ', gameState);

    io.sockets.in(roomName).emit('new game', gameState);
  });

  /**
   * Get Answer
   */
  socket.on('answer', ({ answer, roomName, clues }) => {
    const gameState = Match.endRound(roomName, answer, clues);
    
    console.log("End Round : ", gameState.state.players);

    io.sockets.in(roomName).emit('answer', gameState);
  });

  /**
   * Next Game
   */
  socket.on('next game', ({ roomName, answer }) => {
    const gameState = Match.moveToNextRound(roomName);

    io.sockets.in(roomName).emit('new game', gameState);
  });

  socket.on('reset game', ({ roomName }) => {
    const gameState = Match.startGame();

    io.sockets.in(roomName).emit('new game', gameState);
  });

  /**
   * Discoonect
   */
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

http.listen(3000, () => {
  console.log('Connected at 3000');
});
