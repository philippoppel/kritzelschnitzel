class Game {
  constructor() {
    this.players = [];
    this.currentCategory = '';
    this.secretWord = '';
    this.fakeArtistIndex = -1;
    this.currentPlayerIndex = 0;
    this.currentTurnPlayer = 0;
    this.round = 1;
    this.strokeCount = 0;
    this.maxStrokes = 0;
    this.votes = {};
    this.voteCount = 0;
    this.selectedColor = 'black';
    this.isDrawing = false;
    this.hasDrawnThisTurn = false;
    this.canvas = null;
    this.ctx = null;
    this.votingCanvas = null;
    this.votingCtx = null;

    this.words = {
      'Tiere': ['Katze', 'Elefant', 'Pinguin', 'Giraffe', 'Schmetterling', 'Hai', 'Spinne', 'Löwe'],
      'Essen': ['Pizza', 'Banane', 'Hamburger', 'Eis', 'Sushi', 'Apfel', 'Nudeln', 'Donut'],
      'Objekte': ['Gitarre', 'Fahrrad', 'Brille', 'Uhr', 'Schlüssel', 'Handy', 'Lampe', 'Stuhl'],
      'Orte': ['Strand', 'Berg', 'Schule', 'Flughafen', 'Kirche', 'Spielplatz', 'Bahnhof', 'Wald'],
      'Sport': ['Fußball', 'Tennis', 'Schwimmen', 'Basketball', 'Ski', 'Boxen', 'Golf', 'Tanzen'],
      'Märchen': ['Drache', 'Prinzessin', 'Schloss', 'Zauberstab', 'Hexe', 'Ritter', 'Einhorn', 'Krone']
    };
  }

  showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
  }

  addPlayer(name) {
    if (name && this.players.length < 8) {
      if (this.players.includes(name)) {
        alert('Name existiert bereits!');
        return false;
      }
      this.players.push(name);
      this.updatePlayerList();
      return true;
    }
    return false;
  }

  removePlayer(index) {
    this.players.splice(index, 1);
    this.updatePlayerList();
  }

  updatePlayerList() {
    const list = document.getElementById('playerList');
    if (this.players.length === 0) {
      list.innerHTML = '<span style="color: #999;">Noch keine Spieler</span>';
    } else {
      list.innerHTML = this.players.map((p, i) => `
        <div class="player-tag">
          ${p}
          <button class="remove-player" onclick="game.removePlayer(${i})">×</button>
        </div>
      `).join('');
    }
    this.checkStartButton();
  }

  selectCategory(category) {
    this.currentCategory = category;
    document.querySelectorAll('.category-btn').forEach(btn => {
      btn.classList.remove('selected');
      if (btn.textContent.includes(category)) {
        btn.classList.add('selected');
      }
    });
    this.checkStartButton();
  }

  checkStartButton() {
    const startBtn = document.getElementById('startBtn');
    if (this.players.length >= 3 && this.currentCategory) {
      startBtn.disabled = false;
      startBtn.textContent = '🎮 Los geht\'s!';
    } else {
      startBtn.disabled = true;
      if (this.players.length < 3) {
        startBtn.textContent = `Noch ${3 - this.players.length} Spieler fehlen`;
      } else {
        startBtn.textContent = 'Kategorie wählen';
      }
    }
  }

  start() {
    if (this.players.length < 3 || !this.currentCategory) return;

    const categoryWords = this.words[this.currentCategory];
    this.secretWord = categoryWords[Math.floor(Math.random() * categoryWords.length)];
    this.fakeArtistIndex = Math.floor(Math.random() * this.players.length);
    this.currentPlayerIndex = 0;
    this.maxStrokes = this.players.length * 2;

    document.getElementById('nextPlayerName').textContent = this.players[0];
    this.showScreen('passDeviceScreen');
  }

  confirmPlayer() {
    const roleTitle = document.getElementById('roleTitle');
    const secretInfo = document.getElementById('secretInfo');
    const roleDesc = document.getElementById('roleDescription');

    if (this.currentPlayerIndex === this.fakeArtistIndex) {
      roleTitle.textContent = '🎭 Du bist der SCHWINDLER!';
      secretInfo.textContent = `Kategorie: ${this.currentCategory}`;
      roleDesc.textContent = 'Täusche die anderen!';
    } else {
      roleTitle.textContent = '✏️ Du bist Künstler';
      secretInfo.textContent = this.secretWord;
      roleDesc.textContent = 'Zeige dass du es weißt!';
    }

    this.showScreen('roleScreen');
  }

  roleUnderstood() {
    this.currentPlayerIndex++;

    if (this.currentPlayerIndex < this.players.length) {
      document.getElementById('nextPlayerName').textContent = this.players[this.currentPlayerIndex];
      this.showScreen('passDeviceScreen');
    } else {
      this.showScreen('drawingScreen');
      this.setupCanvas();
      this.currentTurnPlayer = 0;
      this.round = 1;
      this.strokeCount = 0;
      this.updateTurnIndicator();
    }
  }

  setupCanvas() {
    this.canvas = document.getElementById('drawingCanvas');
    this.ctx = this.canvas.getContext('2d');

    // Get device pixel ratio for crisp drawing on retina displays
    const devicePixelRatio = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    
    // Set actual canvas size in memory (scaled up for retina)
    this.canvas.width = rect.width * devicePixelRatio;
    this.canvas.height = 300 * devicePixelRatio;
    
    // Scale canvas back down using CSS for display
    this.canvas.style.width = rect.width + 'px';
    this.canvas.style.height = '300px';
    
    // Scale the drawing context so drawing operations are automatically scaled
    this.ctx.scale(devicePixelRatio, devicePixelRatio);

    // Optimize canvas for drawing
    this.ctx.lineWidth = 3;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.strokeStyle = this.selectedColor;
    
    // Better quality settings for mobile Safari
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';

    // Clear canvas with white background
    this.ctx.fillStyle = 'white';
    this.ctx.fillRect(0, 0, rect.width, 300);
  }

  updateTurnIndicator() {
    document.getElementById('currentTurn').textContent = `${this.players[this.currentTurnPlayer]} zeichnet`;
    document.getElementById('strokeCounter').textContent = `Runde ${this.round} • Strich ${this.strokeCount + 1}/${this.maxStrokes}`;
  }

  selectColor(color, element) {
    this.selectedColor = color;
    if (this.ctx) {
      this.ctx.strokeStyle = color;
    }

    document.querySelectorAll('.color-btn').forEach(btn => {
      btn.classList.remove('selected');
    });
    element.classList.add('selected');
  }

  endTurn() {
    if (!this.hasDrawnThisTurn) {
      alert('Du musst erst zeichnen!');
      return;
    }

    this.hasDrawnThisTurn = false;
    document.getElementById('endTurnBtn').disabled = true;
    this.strokeCount++;
    this.currentTurnPlayer++;

    if (this.currentTurnPlayer >= this.players.length) {
      this.currentTurnPlayer = 0;
      this.round++;
    }

    if (this.strokeCount >= this.maxStrokes) {
      this.startVoting();
    } else {
      this.updateTurnIndicator();
    }
  }

  startVoting() {
    this.showScreen('votingScreen');

    this.votingCanvas = document.getElementById('votingCanvas');
    this.votingCtx = this.votingCanvas.getContext('2d');
    
    // Match the original canvas dimensions and scaling
    const devicePixelRatio = window.devicePixelRatio || 1;
    const rect = this.votingCanvas.getBoundingClientRect();
    
    this.votingCanvas.width = rect.width * devicePixelRatio;
    this.votingCanvas.height = 300 * devicePixelRatio;
    
    this.votingCanvas.style.width = rect.width + 'px';
    this.votingCanvas.style.height = '300px';
    
    this.votingCtx.scale(devicePixelRatio, devicePixelRatio);
    this.votingCtx.drawImage(this.canvas, 0, 0, rect.width, 300);

    this.votes = {};
    this.voteCount = 0;
  }

  updateVoteStatus() {
    document.getElementById('voteStatus').textContent = `${this.voteCount} von ${this.players.length} Stimmen abgegeben`;
  }

  revealResult() {
    this.showScreen('revealScreen');

    const voteCounts = {};
    for (let vote of Object.values(this.votes)) {
      voteCounts[vote] = (voteCounts[vote] || 0) + 1;
    }

    // Find all players with the maximum votes (handle ties)
    let maxVotes = 0;
    let mostVotedPlayers = [];
    
    for (let [player, count] of Object.entries(voteCounts)) {
      if (count > maxVotes) {
        maxVotes = count;
        mostVotedPlayers = [parseInt(player)];
      } else if (count === maxVotes) {
        mostVotedPlayers.push(parseInt(player));
      }
    }

    const resultTitle = document.getElementById('resultTitle');
    const resultMessage = document.getElementById('resultMessage');

    // Check if there's a tie
    if (mostVotedPlayers.length > 1) {
      const tiedNames = mostVotedPlayers.map(i => this.players[i]).join(', ');
      
      if (mostVotedPlayers.includes(this.fakeArtistIndex)) {
        // Fake artist is among the tied players - they still get a chance to guess
        resultTitle.textContent = '🤝 Unentschieden!';
        resultTitle.className = 'result-title';
        resultMessage.textContent = `Gleichstand zwischen: ${tiedNames}. Der Schwindler ${this.players[this.fakeArtistIndex]} bekommt eine Chance!`;
        document.getElementById('finalGuess').style.display = 'block';
      } else {
        // Fake artist not in tie - they win automatically
        resultTitle.textContent = '😈 Schwindler gewinnt!';
        resultTitle.className = 'result-title failure';
        resultMessage.textContent = `Unentschieden zwischen: ${tiedNames}. Der Schwindler ${this.players[this.fakeArtistIndex]} nutzt die Verwirrung!`;
        document.getElementById('finalResult').style.display = 'block';
        document.getElementById('finalResultTitle').textContent = 'Das Wort war:';
        document.getElementById('finalResultMessage').textContent = this.secretWord;
      }
    } else {
      // Clear winner
      const mostVoted = mostVotedPlayers[0];
      
      if (mostVoted === this.fakeArtistIndex) {
        resultTitle.textContent = '🎯 Schwindler enttarnt!';
        resultTitle.className = 'result-title success';
        resultMessage.textContent = `${this.players[this.fakeArtistIndex]} war der Schwindler!`;
        document.getElementById('finalGuess').style.display = 'block';
      } else {
        resultTitle.textContent = '😈 Schwindler gewinnt!';
        resultTitle.className = 'result-title failure';
        resultMessage.textContent = `Falsch! ${this.players[mostVoted]} war unschuldig. ${this.players[this.fakeArtistIndex]} war der Schwindler!`;
        document.getElementById('finalResult').style.display = 'block';
        document.getElementById('finalResultTitle').textContent = 'Das Wort war:';
        document.getElementById('finalResultMessage').textContent = this.secretWord;
      }
    }
  }

  checkFinalGuess() {
    const guess = document.getElementById('guessInput').value.trim().toLowerCase();

    document.getElementById('finalGuess').style.display = 'none';
    document.getElementById('finalResult').style.display = 'block';

    if (guess === this.secretWord.toLowerCase()) {
      document.getElementById('finalResultTitle').textContent = '🎊 Schwindler triumphiert!';
      document.getElementById('finalResultTitle').className = 'success';
      document.getElementById('finalResultMessage').textContent = `Richtig! Es war: ${this.secretWord}`;
    } else {
      document.getElementById('finalResultTitle').textContent = '🏆 Künstler gewinnen!';
      document.getElementById('finalResultTitle').className = 'success';
      document.getElementById('finalResultMessage').textContent = `Falsch! Es war: ${this.secretWord}`;
    }
  }

  reset() {
    // Keep existing players, don't clear the array
    this.currentCategory = '';
    this.secretWord = '';
    this.fakeArtistIndex = -1;
    this.currentPlayerIndex = 0;
    this.currentTurnPlayer = 0;
    this.round = 1;
    this.strokeCount = 0;
    this.maxStrokes = 0;
    this.votes = {};
    this.voteCount = 0;
    this.selectedColor = 'black';
    this.isDrawing = false;
    this.hasDrawnThisTurn = false;

    // Reset all UI elements
    document.querySelectorAll('.category-btn').forEach(btn => {
      btn.classList.remove('selected');
    });
    document.querySelectorAll('.vote-btn').forEach(btn => {
      btn.classList.remove('voted');
    });
    
    // Reset result screens - check if elements exist first
    const finalGuess = document.getElementById('finalGuess');
    const finalResult = document.getElementById('finalResult');
    const guessInput = document.getElementById('guessInput');
    const revealBtn = document.getElementById('revealBtn');
    const voteConfirmation = document.getElementById('voteConfirmation');
    
    if (finalGuess) finalGuess.style.display = 'none';
    if (finalResult) finalResult.style.display = 'none';
    if (guessInput) guessInput.value = '';
    if (revealBtn) revealBtn.style.display = 'none';
    if (voteConfirmation) voteConfirmation.style.display = 'none';
    
    // Reset result titles and messages
    const resultTitle = document.getElementById('resultTitle');
    const resultMessage = document.getElementById('resultMessage');
    const finalResultTitle = document.getElementById('finalResultTitle');
    const finalResultMessage = document.getElementById('finalResultMessage');
    
    if (resultTitle) resultTitle.className = 'result-title';
    if (resultMessage) resultMessage.textContent = '';
    if (finalResultTitle) {
      finalResultTitle.textContent = '';
      finalResultTitle.className = '';
    }
    if (finalResultMessage) finalResultMessage.textContent = '';

    // Reset voting system
    if (voting) {
      voting.reset();
    }

    // Clear any canvas content if exists
    if (this.canvas && this.ctx) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    if (this.votingCanvas && this.votingCtx) {
      this.votingCtx.clearRect(0, 0, this.votingCanvas.width, this.votingCanvas.height);
    }

    // Reset to setup screen
    this.showScreen('setupScreen');
    this.updatePlayerList();
    this.checkStartButton();
    
    console.log('Reset complete. Players:', this.players.length);
  }
}