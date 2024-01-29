const fs = require('fs');
const readline = require('readline');

class RockPaperScissorsGame {
  constructor() {
    this.choices = ["rock", "paper", "scissors"];
    this.dataFilePath = 'gameData.json';
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    this.gameData = this.loadGameData();
  }

  loadGameData() {
    try {
      const data = fs.readFileSync(this.dataFilePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return { playerWins: 0, computerWins: 0 };
    }
  }

  saveGameData() {
    const data = JSON.stringify(this.gameData, null, 2);
    fs.writeFileSync(this.dataFilePath, data);
  }

  playRound(playerSelection, computerSelection) {
    if (playerSelection === computerSelection) {
      return 'It\'s a tie!';
    } else if (
      (playerSelection === 'rock' && computerSelection === 'scissors') ||
      (playerSelection === 'paper' && computerSelection === 'rock') ||
      (playerSelection === 'scissors' && computerSelection === 'paper')
    ) {
      return 'You win!';
    } else {
      return 'Computer wins!';
    }
  }

  startGame() {
    console.log(`Player: ${this.gameData.playerWins}, Computer: ${this.gameData.computerWins}`);

    this.rl.question('Choose your move (Rock, Paper, or Scissors): ', (playerSelection) => {
      playerSelection = playerSelection.toLowerCase();

      if (!this.choices.includes(playerSelection)) {
        console.log('Invalid choice.');
        this.startGame();
        return;
      }

      const computerSelection = this.choices[Math.floor(Math.random() * 3)];
      const result = this.playRound(playerSelection, computerSelection);
      console.log(result);

      if (result === 'You win!') {
        this.gameData.playerWins++;
      } else if (result === 'Computer wins!') {
        this.gameData.computerWins++;
      }

      this.saveGameData();

      this.rl.question('Play again or reset game data? (play/reset/quit): ', (response) => {
        response = response.toLowerCase();

        if (response === 'play') {
          this.startGame();
        } else if (response === 'reset') {
          this.resetGameData();
          this.startGame();
        } else {
          console.log('Thanks for playing!');
          this.rl.close();
        }
      });
    });
  }

  resetGameData() {
    this.gameData = { playerWins: 0, computerWins: 0 };
    this.saveGameData();
    console.log('Game history has been reset (score is now 0-0).');
  }
}

const game = new RockPaperScissorsGame();
game.startGame();
