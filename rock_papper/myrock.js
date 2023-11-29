// Connect the module to work with the file system
const fs = require('fs');

// Connect the module for input/output in the console
const readline = require('readline');

// Create an interface for reading from the console (input) and writing to the console (output)
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Options for the game "Rock, Paper, Scissors" in lower case
const choices = ["rock", "paper", "scissors"];

// Path to the file where the game data will be stored
const dataFilePath = 'gameData.json';

// Function to load game data from a file
function loadGameData() {
  try {
    // Read data from the file and parse it from JSON format
    const data = fs.readFileSync(dataFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // If the file is not found or an error occurs, return an object with zero counters
    return { playerWins: 0, computerWins: 0 };
  }
}

// Function for saving game data to a file
function saveGameData(gameData) {
  // Convert the object with game data into a string in JSON format and write it to a file
  const data = JSON.stringify(gameData, null, 2);
  fs.writeFileSync(dataFilePath, data);
}

// Function to determine the result of the round
function playRound(playerSelection, computerSelection) {
  // Logic for determining victory, defeat or draw in the game "Rock, Paper, Scissors"
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

// Function to start the game
function startGame() {
  // Load game data from a file or start with zero scores if the file is not found
  const gameData = loadGameData();
  // Display the current game score to the console
  console.log(`Player: ${gameData.playerWins}, Computer: ${gameData.computerWins}`);

  // Ask a question to the player and wait for an answer in the callback
  rl.question('Choose your move (Rock, Paper, or Scissors): ', (playerSelection) => {
    // Convert player input to lower case
    playerSelection = playerSelection.toLowerCase();

    // Check that the player's choice is in the list of valid options
    if (!choices.includes(playerSelection)) {
      console.log('Invalid choice.');
      // If the selection is incorrect, recursively call the start game function to re-enter
      startGame();
      return;
    }

    // Generate a random selection of computer from the list of options
    const computerSelection = choices[Math.floor(Math.random() * 3)];
    // Determine the result of the round and display it in the console
    const result = playRound(playerSelection, computerSelection);
    console.log(result);

    // Update the game score depending on the result
    if (result === 'You win!') {
      gameData.playerWins++;
    } else if (result === 'Computer wins!') {
      gameData.computerWins++;
    }

    // Save the updated game data to a file
    saveGameData(gameData);

    // Ask a question about continuing the game, resetting data or finishing
    rl.question('Play again or reset game data? (play/reset/quit): ', (response) => {
      // Convert user input to lower case
      response = response.toLowerCase();

      // Check the response and perform the appropriate action
      if (response === 'play') {
        // If the player wants to play again, call the start game function recursively
        startGame();
      } else if (response === 'reset') {
        // If the player wants to reset the data, call the reset function and then recursively start the game
        resetGameData();
        startGame();
      } else {
        // If the player completes the game, display a thank you note and close the Input/Output interface
        console.log('Thanks for playing!');
        rl.close();
      }
    });
  });
}

// Function for resetting statistics of past games
function resetGameData() {
  // Create a new object with zero counters and save it to a file
  const gameData = { playerWins: 0, computerWins: 0 };
  saveGameData(gameData);
  // Display a message about resetting statistics to the console
  console.log('Game history has been reset (score is now 0-0).');
}

// Start the game by calling the function to start the game
startGame();
