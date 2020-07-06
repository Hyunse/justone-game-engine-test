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
    const newPlayer = new Player(player.id, player.name);
    let players = rooms.get(roomName) || [];
    // Join
    socket.join(roomName);

    console.log(
      `Name[ ${newPlayer.name} ] Email [${newPlayer.id}] Join Room [${roomName}]`
    );

    rooms.set(roomName, [...players, newPlayer]);
    io.sockets.in(roomName).emit('wait', rooms.get(roomName));
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
    const players = rooms.get(roomName);
    // create Game Instance
    game = new Game(players);

    io.sockets.in(roomName).emit('new game', game.getState());
  });

  /**
   * Get Answer
   */
  socket.on('answer', ({ answer, roomName, clues }) => {
    let players = rooms.get(roomName);
    const isCorrect = game.checkAnswer(answer);
    
    // Answer is Correct
    if (isCorrect) {
      clues.map((player) => {
        const id = player.id;

        game.setGiver(id);
      });

      // Give Points
      game.givePoints();
    }

    const isLast = game.checkLastRound();
    const state = game.getState();

    io.sockets.in(roomName).emit('answer', { isCorrect, isLast, state });
  });

  /**
   * Next Game
   */
  socket.on('next game', ({ roomName, answer }) => {
    const state = game.nextRound();

    io.sockets.in(roomName).emit('new game', state);
  });

  socket.on('reset game', ({ roomName }) => {
    game.initGame();
    const state = game.getState();

    io.sockets.in(roomName).emit('new game', state);
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
