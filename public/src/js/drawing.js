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

      // Touch events for mobile - optimized for Safari and iPad
      this.game.canvas.addEventListener('touchstart', this.handleStart.bind(this), {passive: false});
      this.game.canvas.addEventListener('touchmove', this.handleMove.bind(this), {passive: false});
      this.game.canvas.addEventListener('touchend', this.handleEnd.bind(this), {passive: false});
      this.game.canvas.addEventListener('touchcancel', this.handleEnd.bind(this), {passive: false});
      
      // iPad-specific Apple Pencil support
      if (window.PointerEvent) {
        this.game.canvas.addEventListener('pointerdown', this.handleStart.bind(this));
        this.game.canvas.addEventListener('pointermove', this.handleMove.bind(this));
        this.game.canvas.addEventListener('pointerup', this.handleEnd.bind(this));
        this.game.canvas.addEventListener('pointercancel', this.handleEnd.bind(this));
      }
      
      // Prevent iOS Safari from zooming or scrolling
      this.game.canvas.addEventListener('gesturestart', (e) => e.preventDefault());
      this.game.canvas.addEventListener('gesturechange', (e) => e.preventDefault());
      this.game.canvas.addEventListener('gestureend', (e) => e.preventDefault());
    }
  }

  getCoordinates(e) {
    const rect = this.game.canvas.getBoundingClientRect();
    
    let clientX, clientY, pressure = 1;
    
    // Handle pointer events (Apple Pencil on iPad)
    if (e.pointerType) {
      clientX = e.clientX;
      clientY = e.clientY;
      // Use pressure for Apple Pencil if available
      pressure = e.pressure || 1;
    } else if (e.touches && e.touches.length > 0) {
      // Use the first touch point for touchstart and touchmove
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
      // Try to get pressure from touch if available
      pressure = e.touches[0].force || 1;
    } else if (e.changedTouches && e.changedTouches.length > 0) {
      // For touchend events - use changedTouches
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
      pressure = e.changedTouches[0].force || 1;
    } else if (e.clientX !== undefined && e.clientY !== undefined) {
      // Mouse events
      clientX = e.clientX;
      clientY = e.clientY;
    } else {
      // Fallback - return null coordinates
      return { x: null, y: null, pressure: 1 };
    }
    
    // Convert to canvas coordinates (no scaling needed as context is already scaled)
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(clientY - rect.top, rect.height));
    
    return { x, y, pressure };
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
    
    // Enhanced drawing setup with pressure sensitivity for iPad/Apple Pencil
    const baseLineWidth = this.getBaseLineWidth();
    this.game.ctx.lineWidth = baseLineWidth * (coords.pressure || 1);
    this.game.ctx.lineCap = 'round';
    this.game.ctx.lineJoin = 'round';
    this.game.ctx.strokeStyle = this.game.selectedColor;
    this.game.ctx.stroke();
  }

  handleMove(e) {
    e.preventDefault();
    e.stopPropagation();
    
    if (!this.game.isDrawing) return;

    const currentTime = Date.now();
    // Optimized throttling for iPad - slightly higher frequency for smoother Apple Pencil experience
    const throttleDelay = this.isIPad() ? 12 : 16; // ~83fps on iPad, ~60fps elsewhere
    if (currentTime - this.lastTime < throttleDelay) return;
    
    const coords = this.getCoordinates(e);
    
    // Enhanced line drawing with pressure sensitivity
    const baseLineWidth = this.getBaseLineWidth();
    this.game.ctx.lineWidth = baseLineWidth * (coords.pressure || 1);
    
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
  
  // Helper method to detect iPad
  isIPad() {
    return /iPad/.test(navigator.userAgent) || 
           (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }
  
  // Helper method to get base line width optimized for device
  getBaseLineWidth() {
    return this.isIPad() ? 4 : 3; // Slightly thicker lines on iPad for better visibility
  }
}