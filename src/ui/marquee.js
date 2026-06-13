/* kinetic skills marquee — duplicate content for a seamless loop, drive with GSAP */

import gsap from 'gsap';

export function initMarquee(reduced) {
  const track = document.getElementById('marqueeTrack');
  if (!track) return null;
  track.innerHTML += track.innerHTML; // seamless duplicate
  if (reduced) return null;
  return gsap.to(track, { xPercent: -50, ease: 'none', duration: 26, repeat: -1 });
}
