const wordArray = require('./Words');

class Game {
  GUESS_POINT = 200;
  CLUE_POINT = 100;
  MAX_ROUND = 8;

  /**
   * @param {string} id : Room Name
   * @param {array} players : game players array
   */
  constructor(id, players) {
    this.word = '';
    this.round = 0;
    this.wordArray = [];
    this.players = players;
    this.maxRound = this.players.length * 2;

    this.initGame();
  }

  /**
   * Init & Restart Game
   */
  initGame() {
    // Get Array Data
    this.wordArray = this.initWords();
    this.players[0].isGuesser = true;
    this.word = this.wordArray[0];
    this.round = 0;
  }

  /**
   * Get Words Array for game
   */
  initWords() {
    let shuffledWords = this.shuffle(wordArray);

    return shuffledWords.slice(0, this.MAX_ROUND);
  }

  /**
   * Check Guesser's Answer
   * @param {string} answer
   */
  checkAnswer(answer) {
    const word = this.word;
    let correct = false;

    if (word === answer) {
      correct = true;
      this.givePoints();
    }

    return correct;
  }

  /**
   * Go to Next Round
   */
  nextRound() {
    this.round = this.round + 1;
    this.initGuesser();
    this.setNextGuesser(this.round);
    this.setNextWord(this.round);

    return this.getState();
  }

  /**
   * Get State
   */
  getState() {
    return {
      word: this.word,
      round: this.round,
      players: this.players,
    };
  }

  /**
   * Get Next Guesser
   * @param {number} nextRound
   */
  setNextGuesser(nextRound) {
    if (nextRound >= this.players.length) {
      this.players[nextRound - this.players.length].isGuesser = true;
    } else {
      this.players[nextRound].isGuesser = true;
    }
  }

  /**
   * init Guesser to false for next round
   */
  initGuesser() {
    this.players.map((player) => {
      if (player.isGuesser) player.isGuesser = false;
    });
  }

  /**
   * Give Point when answer is correct
   */
  givePoints() {
    this.players.map((player) => {
      console.log(player);
      // Guesser gets 200 points
      if (player.isGuesser === true) player.addPoint(this.GUESS_POINT);

      // Givers who gives not duplicated words get 100 points
      if (player.isGiver === true) player.addPoint(this.CLUE_POINT);
    });
  }

  /**
   * Set Next Word
   */
  setNextWord(round) {
    this.word = this.wordArray[round];
  }

  /**
   * Check Last Round
   */
  checkLastRound() {
    return this.round + 1 === this.maxRound ? true : false;
  }

  /**
   * Shuffle Array
   * @param {array} array
   */
  shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
  }
}

module.exports = Game;
