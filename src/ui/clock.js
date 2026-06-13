/* live IST clocks (hero id-card + footer) */

export function initClock() {
  const targets = [
    document.getElementById('istClock'),
    document.getElementById('footClock'),
  ].filter(Boolean);
  if (!targets.length) return;

  const fmt = new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Kolkata',
  });
  function update() {
    const t = fmt.format(new Date());
    targets.forEach(el => { el.textContent = el.id === 'istClock' ? `${t} IST` : t; });
  }
  update();
  setInterval(update, 30000);
}
