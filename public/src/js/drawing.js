class DrawingCanvas {
  constructor(game) {
    this.game = game;
    this.lastX = 0;
    this.lastY = 0;
    this.lastTime = 0;
    this.setupEventListeners();
  }

  setupEventListeners() {
    if (this.game.canvas) {
      // Mouse events for desktop
      this.game.canvas.addEventListener('mousedown', this.handleStart.bind(this));
      this.game.canvas.addEventListener('mousemove', this.handleMove.bind(this));
      this.game.canvas.addEventListener('mouseup', this.handleEnd.bind(this));
      this.game.canvas.addEventListener('mouseout', this.handleEnd.bind(this));

      // Touch events for mobile - optimized for Safari
      this.game.canvas.addEventListener('touchstart', this.handleStart.bind(this), {passive: false});
      this.game.canvas.addEventListener('touchmove', this.handleMove.bind(this), {passive: false});
      this.game.canvas.addEventListener('touchend', this.handleEnd.bind(this), {passive: false});
      this.game.canvas.addEventListener('touchcancel', this.handleEnd.bind(this), {passive: false});
      
      // Prevent iOS Safari from zooming or scrolling
      this.game.canvas.addEventListener('gesturestart', (e) => e.preventDefault());
      this.game.canvas.addEventListener('gesturechange', (e) => e.preventDefault());
      this.game.canvas.addEventListener('gestureend', (e) => e.preventDefault());
    }
  }

  getCoordinates(e) {
    const rect = this.game.canvas.getBoundingClientRect();
    
    let clientX, clientY;
    
    if (e.touches && e.touches.length > 0) {
      // Use the first touch point for touchstart and touchmove
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if (e.changedTouches && e.changedTouches.length > 0) {
      // For touchend events - use changedTouches
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
    } else if (e.clientX !== undefined && e.clientY !== undefined) {
      // Mouse events
      clientX = e.clientX;
      clientY = e.clientY;
    } else {
      // Fallback - return null coordinates
      return { x: null, y: null };
    }
    
    // Convert to canvas coordinates (no scaling needed as context is already scaled)
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(clientY - rect.top, rect.height));
    
    return { x, y };
  }

  handleStart(e) {
    e.preventDefault();
    e.stopPropagation();
    
    if (this.game.hasDrawnThisTurn) return;

    this.game.isDrawing = true;
    this.game.hasDrawnThisTurn = true;
    document.getElementById('endTurnBtn').disabled = false;

    const coords = this.getCoordinates(e);
    this.lastX = coords.x;
    this.lastY = coords.y;
    this.lastTime = Date.now();
    
    this.game.ctx.beginPath();
    this.game.ctx.moveTo(coords.x, coords.y);
    
    // Draw a small dot at the start point for better visual feedback
    this.game.ctx.lineWidth = this.game.ctx.lineWidth;
    this.game.ctx.lineCap = 'round';
    this.game.ctx.strokeStyle = this.game.selectedColor;
    this.game.ctx.stroke();
  }

  handleMove(e) {
    e.preventDefault();
    e.stopPropagation();
    
    if (!this.game.isDrawing) return;

    const currentTime = Date.now();
    // Throttle drawing for better performance on mobile
    if (currentTime - this.lastTime < 16) return; // ~60fps
    
    const coords = this.getCoordinates(e);
    
    // Smooth line drawing with quadratic curves for better touch experience
    const midX = (this.lastX + coords.x) / 2;
    const midY = (this.lastY + coords.y) / 2;
    
    this.game.ctx.quadraticCurveTo(this.lastX, this.lastY, midX, midY);
    this.game.ctx.stroke();
    
    this.lastX = coords.x;
    this.lastY = coords.y;
    this.lastTime = currentTime;
  }

  handleEnd(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (this.game.isDrawing) {
      // Final stroke to the end point - only if we have a valid event
      if (e && (e.changedTouches || e.clientX !== undefined)) {
        const coords = this.getCoordinates(e);
        if (coords.x !== null && coords.y !== null) {
          this.game.ctx.lineTo(coords.x, coords.y);
          this.game.ctx.stroke();
        }
      }
    }
    
    this.game.isDrawing = false;
  }
}