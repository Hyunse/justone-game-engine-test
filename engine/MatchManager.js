const Game = require('./Game');
const Player = require('./Player');
const ClientError = require('../common/ClientError');

class MatchManager {
  constructor() {
    this.matchManager = new Map();
  }

  createRoom(gameId) {
    this.matchManager.set(gameId, new Game());
  }

  joinRoom(gameId, player) {
    if (this.matchManager.has(gameId)) {
      const game = this.matchManager.get(gameId);
      const newPlayer = new Player(player.id, player.name);

      game.addPlayer(newPlayer);

      return game.getState();
    } else {
      throw new ClientError('', 'Room Not Found', 404);
    }
  }

  startGame(gameId) {
    if (this.matchManager.has(gameId)) {
      const game = this.matchManager.get(gameId);
      const numberOfPlayers = game.getNumberOfPlayers();

      console.log(numberOfPlayers);

      if (numberOfPlayers === 4) {
        game.initGame();
      }

      return game.getState();
    } else {
      throw new ClientError('', 'Room Not Found', 404);
    }
  }

  endRound(gameId, answer, clues) {
    if (this.matchManager.has(gameId)) {
      const game = this.matchManager.get(gameId);
      const correct = game.checkAnswer(answer);

      if (correct) {
        game.givePoints(clues);
      }

      return {
        isCorrect: correct,
        state: game.getState()
      };
    } else {
      throw new ClientError('', 'Room Not Found', 404);
    }
  }

  moveToNextRound(gameId) {
    if (this.matchManager.has(gameId)) {
      const game = this.matchManager.get(gameId);

      game.nextRound();

      return game.getState();
    } else {
      throw new ClientError('', 'Room Not Found', 404);
    }
  }

  leavePlayer(player) {
    if (this.matchManager.has(gameId)) {
      const game = this.matchManager.get(gameId);

      game.leavePlayer(player);

      return game.getState();
    } else {
      throw new ClientError('', 'Room Not Found', 404);
    }
  }

  endGame() {
    if (this.matchManager.has(gameId)) {
      this.matchManager.deconste(gameId);
      
    } else {
      throw new ClientError('', 'Room Not Found', 404);
    }
  }

  checkRoomExist(gameId) {
    return this.matchManager.has(gameId);
  }
}

module.exports = MatchManager;
