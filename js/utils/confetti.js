// Confetti animation using pure CSS + DOM
window.ConfettiFX = {
  colors: ['#6C63FF', '#FF6B6B', '#4CAF50', '#FFB74D', '#E91E63', '#00BCD4', '#FF9800', '#9C27B0'],

  launch() {
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.pointerEvents = 'none';
    container.style.zIndex = '9999';
    document.body.appendChild(container);

    for (let i = 0; i < 40; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.left = Math.random() * 100 + '%';
      piece.style.backgroundColor = this.colors[Math.floor(Math.random() * this.colors.length)];
      piece.style.animationDuration = (1.5 + Math.random() * 1.5) + 's';
      piece.style.animationDelay = Math.random() * 0.5 + 's';
      piece.style.width = (6 + Math.random() * 8) + 'px';
      piece.style.height = (6 + Math.random() * 8) + 'px';
      if (Math.random() > 0.5) {
        piece.style.borderRadius = '50%';
      }
      container.appendChild(piece);
    }

    setTimeout(() => container.remove(), 3500);
  },
};
