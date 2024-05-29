const fs = require('fs');
const readline = require('readline');

class Player {
  constructor(name) {
    this.name = name;
    this.wins = 0;
  }

  incrementWins() {
    this.wins++;
  }
}

class Computer extends Player {
  constructor() {
    super('Computer');
  }

  chooseMove(choices) {
    return choices[Math.floor(Math.random() * choices.length)];
  }
}

class Score {
  constructor() {
    this.playerWins = 0;
    this.computerWins = 0;
  }

  incrementPlayerWins() {
    this.playerWins++;
  }

  incrementComputerWins() {
    this.computerWins++;
  }

  reset() {
    this.playerWins = 0;
    this.computerWins = 0;
  }

  saveToFile(filePath) {
    const data = JSON.stringify({ playerWins: this.playerWins, computerWins: this.computerWins }, null, 2);
    try {
      fs.writeFileSync(filePath, data);
    } catch (error) {
      console.error('Error saving to file:', error);
    }
  }

  loadFromFile(filePath) {
    try {
      const data = fs.readFileSync(filePath, 'utf8');
      const parsedData = JSON.parse(data);
      this.playerWins = parsedData.playerWins;
      this.computerWins = parsedData.computerWins;
    } catch (error) {
      console.warn('Error loading from file or file does not exist. Starting with default scores.');
      this.reset();
    }
  }
}

class InputOutput {
  constructor(game) {
    this.game = game;
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  prompt(question, callback) {
    this.rl.question(question, (answer) => {
      callback(answer);
    });
  }

  close() {
    this.rl.close();
  }

  displayMessage(message) {
    console.log(message);
  }
}

class Round {
  constructor(player, computer, score) {
    this.player = player;
    this.computer = computer;
    this.score = score;
    this.playerSelection = null;
    this.computerSelection = null;
  }

  play(playerSelection, computerSelection) {
    this.playerSelection = playerSelection;
    this.computerSelection = computerSelection;

    if (playerSelection === computerSelection) {
      return 'It\'s a tie!';
    } else if (
      (playerSelection === 'rock' && computerSelection === 'scissors') ||
      (playerSelection === 'paper' && computerSelection === 'rock') ||
      (playerSelection === 'scissors' && computerSelection === 'paper')
    ) {
      this.score.incrementPlayerWins();
      return 'You win!';
    } else {
      this.score.incrementComputerWins();
      return 'Computer wins!';
    }
  }

  toJSON() {
    return {
      playerSelection: this.playerSelection,
      computerSelection: this.computerSelection
    };
  }

  fromJSON(data) {
    this.playerSelection = data.playerSelection;
    this.computerSelection = data.computerSelection;
  }
}

class RockPaperScissorsGame {
  constructor() {
    this.choices = ["rock", "paper", "scissors"];
    this.dataFilePath = 'gameData.json';
    this.stateFilePath = 'gameState.json';
    this.player = new Player('Player');
    this.computer = new Computer();
    this.score = new Score();
    this.io = new InputOutput(this);
    this.score.loadFromFile(this.dataFilePath);
    this.round = new Round(this.player, this.computer, this.score);
    this.loadGameState();
  }

  saveGameState() {
    const state = {
      score: {
        playerWins: this.score.playerWins,
        computerWins: this.score.computerWins
      },
      round: this.round.toJSON()
    };
    try {
      fs.writeFileSync(this.stateFilePath, JSON.stringify(state, null, 2));
    } catch (error) {
      console.error('Error saving game state:', error);
    }
  }

  loadGameState() {
    try {
      const data = fs.readFileSync(this.stateFilePath, 'utf8');
      const parsedData = JSON.parse(data);
      this.score.playerWins = parsedData.score.playerWins;
      this.score.computerWins = parsedData.score.computerWins;
      this.round.fromJSON(parsedData.round);
    } catch (error) {
      console.warn('Error loading game state or file does not exist. Starting new game.');
      this.score.reset();
    }
  }

  startGame() {
    if (this.round.playerSelection && this.round.computerSelection) {
      this.io.displayMessage(`Last Round: Player chose ${this.round.playerSelection}, Computer chose ${this.round.computerSelection}`);
    }
    this.io.displayMessage(`Player: ${this.score.playerWins}, Computer: ${this.score.computerWins}`);
    this.promptMove();
  }

  promptMove() {
    this.io.prompt('Choose your move (Rock, Paper, or Scissors): ', (playerSelection) => {
      playerSelection = playerSelection.toLowerCase();

      if (!this.choices.includes(playerSelection)) {
        this.io.displayMessage('Invalid choice. Please choose Rock, Paper, or Scissors.');
        return this.promptMove();
      }

      const computerSelection = this.computer.chooseMove(this.choices);
      const result = this.round.play(playerSelection, computerSelection);
      this.io.displayMessage(result);

      this.score.saveToFile(this.dataFilePath);
      this.saveGameState();

      this.promptNextAction();
    });
  }

  promptNextAction() {
    this.io.prompt('Play again or reset game data? (play/reset/quit): ', (response) => {
      response = response.toLowerCase();

      if (response === 'play') {
        this.promptMove();
      } else if (response === 'reset') {
        this.score.reset();
        this.round = new Round(this.player, this.computer, this.score);
        this.score.saveToFile(this.dataFilePath);
        try {
          fs.unlinkSync(this.stateFilePath);
        } catch (error) {
          console.warn('Error deleting game state file:', error);
        }
        this.startGame();
      } else if (response === 'quit') {
        this.io.displayMessage('Thanks for playing!');
        this.io.close();
      } else {
        this.io.displayMessage('Invalid choice. Please type play, reset, or quit.');
        this.promptNextAction();
      }
    });
  }
}

const game = new RockPaperScissorsGame();
game.startGame();
