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
      'Tiere': [
        {de: 'Katze', en: 'Cat'}, {de: 'Elefant', en: 'Elephant'}, {de: 'Pinguin', en: 'Penguin'}, 
        {de: 'Giraffe', en: 'Giraffe'}, {de: 'Schmetterling', en: 'Butterfly'}, {de: 'Hai', en: 'Shark'}, 
        {de: 'Spinne', en: 'Spider'}, {de: 'Löwe', en: 'Lion'}
      ],
      'Essen': [
        {de: 'Pizza', en: 'Pizza'}, {de: 'Banane', en: 'Banana'}, {de: 'Hamburger', en: 'Hamburger'}, 
        {de: 'Eis', en: 'Ice Cream'}, {de: 'Sushi', en: 'Sushi'}, {de: 'Apfel', en: 'Apple'}, 
        {de: 'Nudeln', en: 'Noodles'}, {de: 'Donut', en: 'Donut'}
      ],
      'Objekte': [
        {de: 'Gitarre', en: 'Guitar'}, {de: 'Fahrrad', en: 'Bicycle'}, {de: 'Brille', en: 'Glasses'}, 
        {de: 'Uhr', en: 'Clock'}, {de: 'Schlüssel', en: 'Key'}, {de: 'Handy', en: 'Phone'}, 
        {de: 'Lampe', en: 'Lamp'}, {de: 'Stuhl', en: 'Chair'}
      ],
      'Orte': [
        {de: 'Strand', en: 'Beach'}, {de: 'Berg', en: 'Mountain'}, {de: 'Schule', en: 'School'}, 
        {de: 'Flughafen', en: 'Airport'}, {de: 'Kirche', en: 'Church'}, {de: 'Spielplatz', en: 'Playground'}, 
        {de: 'Bahnhof', en: 'Train Station'}, {de: 'Wald', en: 'Forest'}
      ],
      'Sport': [
        {de: 'Fußball', en: 'Soccer'}, {de: 'Tennis', en: 'Tennis'}, {de: 'Schwimmen', en: 'Swimming'}, 
        {de: 'Basketball', en: 'Basketball'}, {de: 'Ski', en: 'Skiing'}, {de: 'Boxen', en: 'Boxing'}, 
        {de: 'Golf', en: 'Golf'}, {de: 'Tanzen', en: 'Dancing'}
      ],
      'Märchen': [
        {de: 'Drache', en: 'Dragon'}, {de: 'Prinzessin', en: 'Princess'}, {de: 'Schloss', en: 'Castle'}, 
        {de: 'Zauberstab', en: 'Magic Wand'}, {de: 'Hexe', en: 'Witch'}, {de: 'Ritter', en: 'Knight'}, 
        {de: 'Einhorn', en: 'Unicorn'}, {de: 'Krone', en: 'Crown'}
      ]
    };
  }

  showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
  }

  addPlayer(name) {
    if (name && this.players.length < 8) {
      if (this.players.includes(name)) {
        alert('Name existiert bereits! / Name already exists!');
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
      list.innerHTML = '<span style="color: #999;">Noch keine Spieler / No players yet</span>';
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
      startBtn.textContent = '🎮 Los geht\'s! / Let\'s go!';
    } else {
      startBtn.disabled = true;
      if (this.players.length < 3) {
        startBtn.textContent = `Noch ${3 - this.players.length} Spieler fehlen / Need ${3 - this.players.length} more players`;
      } else {
        startBtn.textContent = 'Kategorie wählen / Choose category';
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
      roleTitle.textContent = '🎭 Du bist der SCHWINDLER! / You are the FAKER!';
      secretInfo.textContent = `Kategorie / Category: ${this.currentCategory}`;
      roleDesc.textContent = 'Täusche die anderen! / Fool the others!';
    } else {
      roleTitle.textContent = '✏️ Du bist Künstler / You are an Artist';
      secretInfo.textContent = `${this.secretWord.de} / ${this.secretWord.en}`;
      roleDesc.textContent = 'Zeige dass du es weißt! / Show that you know it!';
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
    document.getElementById('currentTurn').textContent = `${this.players[this.currentTurnPlayer]} zeichnet / is drawing`;
    document.getElementById('strokeCounter').textContent = `Runde / Round ${this.round} • Strich / Stroke ${this.strokeCount + 1}/${this.maxStrokes}`;
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
      alert('Du musst erst zeichnen! / You must draw first!');
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
    document.getElementById('voteStatus').textContent = `${this.voteCount} von / of ${this.players.length} Stimmen abgegeben / votes cast`;
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
        resultTitle.textContent = '🤝 Unentschieden! / It\'s a Tie!';
        resultTitle.className = 'result-title';
        resultMessage.textContent = `Gleichstand zwischen / Tie between: ${tiedNames}. Der Schwindler / The faker ${this.players[this.fakeArtistIndex]} bekommt eine Chance! / gets a chance!`;
        document.getElementById('finalGuess').style.display = 'block';
      } else {
        // Fake artist not in tie - they win automatically
        resultTitle.textContent = '😈 Schwindler gewinnt! / Faker Wins!';
        resultTitle.className = 'result-title failure';
        resultMessage.textContent = `Unentschieden zwischen / Tie between: ${tiedNames}. Der Schwindler / The faker ${this.players[this.fakeArtistIndex]} nutzt die Verwirrung! / takes advantage of the confusion!`;
        document.getElementById('finalResult').style.display = 'block';
        document.getElementById('finalResultTitle').textContent = 'Das Wort war: / The word was:';
        document.getElementById('finalResultMessage').textContent = `${this.secretWord.de} / ${this.secretWord.en}`;
      }
    } else {
      // Clear winner
      const mostVoted = mostVotedPlayers[0];
      
      if (mostVoted === this.fakeArtistIndex) {
        resultTitle.textContent = '🎯 Schwindler enttarnt! / Faker Caught!';
        resultTitle.className = 'result-title success';
        resultMessage.textContent = `${this.players[this.fakeArtistIndex]} war der Schwindler! / was the faker!`;
        document.getElementById('finalGuess').style.display = 'block';
      } else {
        resultTitle.textContent = '😈 Schwindler gewinnt! / Faker Wins!';
        resultTitle.className = 'result-title failure';
        resultMessage.textContent = `Falsch! / Wrong! ${this.players[mostVoted]} war unschuldig / was innocent. ${this.players[this.fakeArtistIndex]} war der Schwindler! / was the faker!`;
        document.getElementById('finalResult').style.display = 'block';
        document.getElementById('finalResultTitle').textContent = 'Das Wort war: / The word was:';
        document.getElementById('finalResultMessage').textContent = `${this.secretWord.de} / ${this.secretWord.en}`;
      }
    }
  }

  checkFinalGuess() {
    const guess = document.getElementById('guessInput').value.trim().toLowerCase();

    document.getElementById('finalGuess').style.display = 'none';
    document.getElementById('finalResult').style.display = 'block';

    if (guess === this.secretWord.de.toLowerCase() || guess === this.secretWord.en.toLowerCase()) {
      document.getElementById('finalResultTitle').textContent = '🎊 Schwindler triumphiert! / Faker Triumphs!';
      document.getElementById('finalResultTitle').className = 'success';
      document.getElementById('finalResultMessage').textContent = `Richtig! Es war: / Correct! It was: ${this.secretWord.de} / ${this.secretWord.en}`;
    } else {
      document.getElementById('finalResultTitle').textContent = '🏆 Künstler gewinnen! / Artists Win!';
      document.getElementById('finalResultTitle').className = 'success';
      document.getElementById('finalResultMessage').textContent = `Falsch! Es war: / Wrong! It was: ${this.secretWord.de} / ${this.secretWord.en}`;
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