let game;
let drawingCanvas;
let voting;

function initializeApp() {
  game = new Game();
  drawingCanvas = new DrawingCanvas(game);
  voting = new VotingSystem(game);

  const playerNameInput = document.getElementById('playerNameInput');
  playerNameInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      addPlayer();
    }
  });

  game.updatePlayerList();
  game.checkStartButton();
}

function addPlayer() {
  const input = document.getElementById('playerNameInput');
  const name = input.value.trim();
  
  if (game.addPlayer(name)) {
    input.value = '';
  }
}

function selectCategory(category) {
  game.selectCategory(category);
}

function startGame() {
  game.start();
}

function confirmPlayer() {
  game.confirmPlayer();
}

function roleUnderstood() {
  game.roleUnderstood();
  
  if (game.canvas) {
    drawingCanvas.setupEventListeners();
  }
}

function selectColor(color, element) {
  game.selectColor(color, element);
}

function endTurn() {
  game.endTurn();
}

function revealResult() {
  game.revealResult();
}

function checkFinalGuess() {
  game.checkFinalGuess();
}

function startVotingProcess() {
  voting.startVotingProcess();
}

function confirmVote() {
  voting.confirmVote();
}

function resetGame() {
  game.reset();
  voting.reset();
}

document.addEventListener('DOMContentLoaded', initializeApp);