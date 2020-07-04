const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
let Game = require('./Game');
const Player = require('./Player');

let rooms = new Map();
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
    const newPlayer = new Player(player);
    let players = rooms.get(roomName);
    // Join
    socket.join(roomName);

    console.log(`Name[ ${newPlayer.name} ] Email [${newPlayer.email}] Join Room [${roomName}]`);

    if (players) {
      rooms.set(roomName, [...players, newPlayer]);
    } else {
      rooms.set(roomName, [newPlayer]);
    }
  });

  /**
   * Chat Message
   */
  socket.on('chat message', ({ roomName, msg, player }) => {
    let players = rooms.get(roomName);

    io.sockets.in(roomName).emit('chat message', msg);
  });

  /**
   * Game Start
   */
  socket.on('game start', ({ roomName }) => {
    const players = rooms.get(roomName);
    // create Game Instance
    game = new Game(roomName, players);

    io.sockets.in(roomName).emit('new game', game.getState());
  });

  /**
   * Get Answer
   */
  socket.on('answer', ({ answer, roomName }) => {
    let players = rooms.get(roomName);
    const isCorrect = game.checkAnswer(answer);
    const isLast = game.checkLastRound();
    const state = game.getState();

    io.sockets.in(roomName).emit('answer', { isCorrect, isLast, state });
  });

  /**
   * Next Game
   */
  socket.on('next game', ({ roomName, answer }) => {
    const state = game.nextRound();

    console.log(state);

    io.sockets.in(roomName).emit('new game', state);
  });

  socket.on('reset game', () => {
    game.initGame();
    const state = game.getState();

    io.sockets.in(state.roomName).emit('new game', state);
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
