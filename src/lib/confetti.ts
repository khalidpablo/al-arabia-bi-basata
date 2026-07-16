// Lightweight confetti burst — no external dependency.
// Fires ~150 particles from the top-center of the viewport.
export function fireConfetti() {
  const colors = ['#d4af37', '#fbbf24', '#fcd34d', '#fde68a', '#ffffff', '#60a5fa'];
  const count = 150;
  const container = document.createElement('div');
  container.style.cssText =
    'position:fixed;inset:0;pointer-events:none;z-index:9999;overflow:hidden;';
  document.body.appendChild(container);

  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    const size = 6 + Math.random() * 8;
    const color = colors[Math.floor(Math.random() * colors.length)];
    p.style.cssText = `position:absolute;width:${size}px;height:${size}px;background:${color};border-radius:${Math.random() > 0.5 ? '50%' : '2px'};left:50%;top:60%;opacity:1;`;
    container.appendChild(p);

    const angle = Math.random() * Math.PI * 2;
    const velocity = 4 + Math.random() * 8;
    const vx = Math.cos(angle) * velocity;
    const vy = Math.sin(angle) * velocity - 6;
    let x = 0;
    let y = 0;
    let rot = Math.random() * 360;
    const vrot = (Math.random() - 0.5) * 20;
    let opacity = 1;

    const start = performance.now();
    const animate = (now: number) => {
      const t = (now - start) / 1000;
      x += vx;
      y += vy + t * 9;
      rot += vrot;
      opacity = Math.max(0, 1 - t / 2.2);
      p.style.transform = `translate(${x}px, ${y}px) rotate(${rot}deg)`;
      p.style.opacity = String(opacity);
      if (opacity > 0) requestAnimationFrame(animate);
      else p.remove();
    };
    requestAnimationFrame(animate);
  }

  setTimeout(() => container.remove(), 2800);
}
