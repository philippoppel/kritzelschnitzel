class VotingSystem {
  constructor(game) {
    this.game = game;
    this.currentVotingPlayerIndex = 0;
    this.selectedVote = null;
  }

  startVotingProcess() {
    this.currentVotingPlayerIndex = 0;
    this.game.votes = {};
    this.game.voteCount = 0;
    this.showVotingPlayerScreen();
  }

  showVotingPlayerScreen() {
    if (this.currentVotingPlayerIndex >= this.game.players.length) {
      this.showVoteResults();
      return;
    }

    const playerName = this.game.players[this.currentVotingPlayerIndex];
    document.getElementById('votingPlayerName').textContent = playerName;
    
    this.createVotingGrid();
    document.getElementById('voteConfirmation').style.display = 'none';
    this.game.showScreen('passVotingScreen');
  }

  createVotingGrid() {
    const votingGrid = document.getElementById('votingGrid');
    votingGrid.innerHTML = this.game.players.map((player, index) => `
      <div class="vote-btn" data-player-index="${index}" onclick="voting.selectVote(${index})">
        ${player}
      </div>
    `).join('');
  }

  selectVote(suspectIndex) {
    document.querySelectorAll('.vote-btn').forEach(btn => {
      btn.classList.remove('voted');
    });
    
    const selectedBtn = document.querySelector(`[data-player-index="${suspectIndex}"]`);
    selectedBtn.classList.add('voted');
    
    this.selectedVote = suspectIndex;
    document.getElementById('selectedPlayer').textContent = this.game.players[suspectIndex];
    document.getElementById('voteConfirmation').style.display = 'block';
  }

  confirmVote() {
    if (this.selectedVote === null) return;
    
    const voter = this.game.players[this.currentVotingPlayerIndex];
    this.game.votes[voter] = this.selectedVote;
    this.game.voteCount++;
    
    this.currentVotingPlayerIndex++;
    this.selectedVote = null;
    
    this.showVotingPlayerScreen();
  }

  showVoteResults() {
    this.game.updateVoteStatus();
    this.game.showScreen('voteResultsScreen');
  }

  reset() {
    this.currentVotingPlayerIndex = 0;
    this.selectedVote = null;
  }
}