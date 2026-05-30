import React from 'react';

interface FlowerSVGProps {
  id: string;
  width?: number | string;
  height?: number | string;
  className?: string;
}

export const FlowerSVG: React.FC<FlowerSVGProps> = ({ id, width = '100%', height = '100%', className = '' }) => {
  // We'll return high-fidelity, hand-crafted vector SVGs with rich gradients and layers for an ultra-premium aesthetic.
  switch (id) {
    case 'majestic-rose':
      return (
        <svg viewBox="0 0 100 240" width={width} height={height} className={className}>
          <defs>
            <linearGradient id="rose-stem-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1e3f20" />
              <stop offset="50%" stopColor="#2e5930" />
              <stop offset="100%" stopColor="#122b14" />
            </linearGradient>
            <radialGradient id="rose-petal-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#d32f2f" />
              <stop offset="40%" stopColor="#b71c1c" />
              <stop offset="70%" stopColor="#880e4f" />
              <stop offset="100%" stopColor="#310006" />
            </radialGradient>
            <linearGradient id="rose-leaf-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3d6e42" />
              <stop offset="100%" stopColor="#1b3d20" />
            </linearGradient>
          </defs>
          {/* Stem */}
          <path d="M 50 100 Q 48 170 52 240" fill="none" stroke="url(#rose-stem-grad)" strokeWidth="4" strokeLinecap="round" />
          
          {/* Leaves */}
          <g>
            {/* Left Leaf */}
            <path d="M 49 140 Q 25 130 18 115 Q 35 110 49 130" fill="url(#rose-leaf-grad)" />
            <path d="M 49 130 C 35 122 25 118 18 115" fill="none" stroke="#162e1a" strokeWidth="1" />
            <line x1="35" y1="125" x2="30" y2="115" stroke="#162e1a" strokeWidth="0.75" />
            <line x1="42" y1="128" x2="40" y2="118" stroke="#162e1a" strokeWidth="0.75" />
            
            {/* Right Leaf */}
            <path d="M 51 170 Q 75 165 82 150 Q 65 145 51 160" fill="url(#rose-leaf-grad)" />
            <path d="M 51 160 C 65 152 75 150 82 150" fill="none" stroke="#162e1a" strokeWidth="1" />
            <line x1="62" y1="156" x2="65" y2="148" stroke="#162e1a" strokeWidth="0.75" />
            <line x1="70" y1="154" x2="75" y2="146" stroke="#162e1a" strokeWidth="0.75" />
          </g>
          
          {/* Thorns */}
          <path d="M 49 160 L 42 157 L 49 152 Z" fill="#2e5930" />
          <path d="M 51 190 L 58 187 L 51 182 Z" fill="#2e5930" />

          {/* Sepals */}
          <g fill="#2e5930">
            <path d="M 35 90 Q 50 100 50 110 Q 50 100 65 90 Q 50 95 35 90" />
            <path d="M 45 92 L 50 112 L 55 92 Z" />
            <path d="M 30 85 Q 40 90 50 105 Q 38 95 30 85" />
            <path d="M 70 85 Q 60 90 50 105 Q 62 95 70 85" />
          </g>

          {/* Rose Petal Cluster */}
          <g>
            {/* Outer Petals */}
            <path d="M 50 105 C 10 95 15 50 50 50 C 85 50 90 95 50 105 Z" fill="url(#rose-petal-grad)" opacity="0.95" />
            <path d="M 50 103 C 20 95 22 58 50 58 C 78 58 80 95 50 103 Z" fill="url(#rose-petal-grad)" />
            
            {/* Middle Petals */}
            <path d="M 50 98 C 28 92 30 65 50 65 C 70 65 72 92 50 98 Z" fill="url(#rose-petal-grad)" />
            <path d="M 50 94 C 34 88 36 72 50 72 C 64 72 66 88 50 94 Z" fill="url(#rose-petal-grad)" />
            
            {/* Inner Core */}
            <ellipse cx="50" cy="80" rx="10" ry="8" fill="#4a040b" />
            <path d="M 46 80 C 46 76 54 76 54 80 C 54 84 46 84 46 80 Z" fill="#b71c1c" />
            <path d="M 48 80 C 48 78 52 78 52 80 C 52 82 48 82 48 80 Z" fill="#ff5252" />
          </g>
        </svg>
      );

    case 'blush-peony':
      return (
        <svg viewBox="0 0 120 240" width={width} height={height} className={className}>
          <defs>
            <radialGradient id="peony-petal" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fcd3de" />
              <stop offset="60%" stopColor="#f48fb1" />
              <stop offset="90%" stopColor="#e91e63" />
              <stop offset="100%" stopColor="#880e4f" />
            </radialGradient>
            <linearGradient id="peony-stem" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2d5c31" />
              <stop offset="100%" stopColor="#1a3d1c" />
            </linearGradient>
          </defs>
          {/* Stem */}
          <path d="M 60 100 Q 55 170 60 240" fill="none" stroke="url(#peony-stem)" strokeWidth="4.5" strokeLinecap="round" />

          {/* Leaves */}
          <path d="M 58 150 Q 25 155 15 140 Q 35 130 58 142 Z" fill="#2d5c31" />
          <path d="M 62 180 Q 95 185 105 170 Q 85 160 62 172 Z" fill="#2d5c31" />

          {/* Peony Flower Head (Fluffy overlapping rings of petals) */}
          <g transform="translate(60, 80)">
            {/* Back petals */}
            <circle cx="-25" cy="-10" r="24" fill="url(#peony-petal)" opacity="0.9" />
            <circle cx="25" cy="-10" r="24" fill="url(#peony-petal)" opacity="0.9" />
            <circle cx="0" cy="-28" r="24" fill="url(#peony-petal)" opacity="0.9" />
            <circle cx="-15" cy="20" r="24" fill="url(#peony-petal)" opacity="0.9" />
            <circle cx="15" cy="20" r="24" fill="url(#peony-petal)" opacity="0.9" />

            {/* Mid petals */}
            <circle cx="-18" cy="-8" r="20" fill="url(#peony-petal)" />
            <circle cx="18" cy="-8" r="20" fill="url(#peony-petal)" />
            <circle cx="0" cy="-18" r="20" fill="url(#peony-petal)" />
            <circle cx="-10" cy="12" r="20" fill="url(#peony-petal)" />
            <circle cx="10" cy="12" r="20" fill="url(#peony-petal)" />

            {/* Front Petal Ruffles */}
            <path d="M -20 -5 Q -10 -25 0 -5 Q 10 -25 20 -5 Q 30 15 0 20 Q -30 15 -20 -5 Z" fill="url(#peony-petal)" />
            
            {/* Fluffy Core */}
            <circle cx="-5" cy="-2" r="12" fill="#f06292" />
            <circle cx="5" cy="2" r="12" fill="#f06292" />
            <circle cx="0" cy="5" r="10" fill="#f8bbd0" />
            <circle cx="-2" cy="-5" r="8" fill="#fff" opacity="0.6" />
            
            {/* Gold Stamens */}
            <circle cx="-3" cy="2" r="2" fill="#ffd54f" />
            <circle cx="3" cy="-1" r="2" fill="#ffd54f" />
            <circle cx="1" cy="4" r="1.5" fill="#ffb300" />
            <circle cx="-4" cy="-3" r="1.5" fill="#ffb300" />
          </g>
        </svg>
      );

    case 'royal-lily':
      return (
        <svg viewBox="0 0 130 250" width={width} height={height} className={className}>
          <defs>
            <linearGradient id="lily-petal-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="70%" stopColor="#faf2eb" />
              <stop offset="100%" stopColor="#ded1c5" />
            </linearGradient>
            <linearGradient id="lily-stem" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3d6642" />
              <stop offset="100%" stopColor="#224226" />
            </linearGradient>
          </defs>
          {/* Stem */}
          <path d="M 65 110 L 65 250" fill="none" stroke="url(#lily-stem)" strokeWidth="4" strokeLinecap="round" />

          {/* Leaves */}
          <path d="M 65 160 Q 30 150 15 130 Q 35 140 65 150 Z" fill="#3d6642" />
          <path d="M 65 180 Q 100 170 115 150 Q 95 160 65 170 Z" fill="#3d6642" />

          {/* Star-shaped Lily Blooms */}
          <g transform="translate(65, 90)">
            {/* Back Petals */}
            <path d="M 0 0 Q -45 -55 -40 -65 Q -25 -45 0 0" fill="url(#lily-petal-grad)" stroke="#dcd0c4" strokeWidth="0.5" />
            <path d="M 0 0 Q 45 -55 40 -65 Q 25 -45 0 0" fill="url(#lily-petal-grad)" stroke="#dcd0c4" strokeWidth="0.5" />
            <path d="M 0 0 Q 0 65 -15 65 Q -10 35 0 0" fill="url(#lily-petal-grad)" stroke="#dcd0c4" strokeWidth="0.5" />
            <path d="M 0 0 Q 0 65 15 65 Q 10 35 0 0" fill="url(#lily-petal-grad)" stroke="#dcd0c4" strokeWidth="0.5" />
            
            {/* Front Petals */}
            <path d="M 0 0 Q -65 -10 -60 5 Q -35 5 0 0" fill="url(#lily-petal-grad)" stroke="#d0c4b8" strokeWidth="0.5" />
            <path d="M 0 0 Q 65 -10 60 5 Q 35 5 0 0" fill="url(#lily-petal-grad)" stroke="#d0c4b8" strokeWidth="0.5" />
            <path d="M 0 0 Q -35 -40 0 -75 Q 15 -45 0 0" fill="url(#lily-petal-grad)" stroke="#d0c4b8" strokeWidth="0.5" />

            {/* Petal midribs (soft pink/gold glow in center) */}
            <path d="M 0 0 Q -20 -27 -20 -32" fill="none" stroke="#e8c5c8" strokeWidth="1.5" opacity="0.6" />
            <path d="M 0 0 Q 20 -27 20 -32" fill="none" stroke="#e8c5c8" strokeWidth="1.5" opacity="0.6" />
            <path d="M 0 0 Q -30 2 -35 2" fill="none" stroke="#e8c5c8" strokeWidth="1.5" opacity="0.6" />
            <path d="M 0 0 Q 30 2 35 2" fill="none" stroke="#e8c5c8" strokeWidth="1.5" opacity="0.6" />
            <path d="M 0 0 Q -10 -35 0 -45" fill="none" stroke="#e8c5c8" strokeWidth="1.5" opacity="0.6" />

            {/* Long Stamens */}
            <g stroke="#c5a880" strokeWidth="1.5" fill="none">
              <path d="M 0 0 Q -15 -25 -25 -38" />
              <path d="M 0 0 Q -5 -28 -10 -45" />
              <path d="M 0 0 Q 10 -28 10 -45" />
              <path d="M 0 0 Q 15 -25 25 -38" />
              <path d="M 0 0 Q 0 -15 -3 -30" />
            </g>

            {/* Rusty Red Anthers */}
            <g fill="#9e1b32">
              <ellipse cx="-25" cy="-38" rx="4" ry="2" transform="rotate(-30, -25, -38)" />
              <ellipse cx="-10" cy="-45" rx="4" ry="2" transform="rotate(-10, -10, -45)" />
              <ellipse cx="10" cy="-45" rx="4" ry="2" transform="rotate(10, 10, -45)" />
              <ellipse cx="25" cy="-38" rx="4" ry="2" transform="rotate(30, 25, -38)" />
              <ellipse cx="-3" cy="-30" rx="3.5" ry="1.8" />
            </g>
            
            {/* Green Pistil in Center */}
            <path d="M 0 0 Q 5 -35 12 -50" fill="none" stroke="#839b8c" strokeWidth="2" />
            <circle cx="12" cy="-50" r="2.5" fill="#4e6d5e" />
          </g>
        </svg>
      );

    case 'gold-carnation':
      return (
        <svg viewBox="0 0 100 230" width={width} height={height} className={className}>
          <defs>
            <radialGradient id="carna-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f5cdab" />
              <stop offset="60%" stopColor="#d49b6a" />
              <stop offset="100%" stopColor="#8c582e" />
            </radialGradient>
          </defs>
          {/* Stem */}
          <path d="M 50 90 L 50 230" fill="none" stroke="#33663a" strokeWidth="3.5" />
          
          {/* Narrow carnation leaf */}
          <path d="M 50 140 Q 20 125 10 110 Q 30 120 50 135 Z" fill="#33663a" />
          <path d="M 50 170 Q 80 155 90 140 Q 70 150 50 165 Z" fill="#33663a" />

          {/* Ruffled Carnation Head */}
          <g transform="translate(50, 75)">
            {/* Outer Petals */}
            <circle cx="0" cy="0" r="32" fill="url(#carna-grad)" stroke="#8c582e" strokeWidth="0.5" strokeDasharray="3 2" />
            <circle cx="-10" cy="-5" r="24" fill="url(#carna-grad)" stroke="#8c582e" strokeWidth="0.5" strokeDasharray="2 1" />
            <circle cx="10" cy="5" r="24" fill="url(#carna-grad)" stroke="#8c582e" strokeWidth="0.5" strokeDasharray="2 1" />
            <circle cx="5" cy="-10" r="24" fill="url(#carna-grad)" stroke="#8c582e" strokeWidth="0.5" strokeDasharray="2 1" />
            <circle cx="-5" cy="10" r="24" fill="url(#carna-grad)" stroke="#8c582e" strokeWidth="0.5" strokeDasharray="2 1" />
            
            {/* Center Ruffles */}
            <circle cx="0" cy="0" r="16" fill="url(#carna-grad)" stroke="#8c582e" strokeWidth="0.75" />
            <path d="M -10 -10 Q 0 -22 10 -10 Q 22 0 10 10 Q 0 22 -10 10 Q -22 0 -10 -10 Z" fill="url(#carna-grad)" />
            <circle cx="0" cy="0" r="8" fill="#f5cdab" />
          </g>
        </svg>
      );

    case 'white-tulip':
      return (
        <svg viewBox="0 0 80 230" width={width} height={height} className={className}>
          <defs>
            <linearGradient id="tulip-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="60%" stopColor="#eef2f4" />
              <stop offset="100%" stopColor="#c7d5db" />
            </linearGradient>
          </defs>
          {/* Stem */}
          <path d="M 40 85 Q 38 150 42 230" fill="none" stroke="#487e4f" strokeWidth="4" strokeLinecap="round" />

          {/* Broad tulip leaf */}
          <path d="M 41 160 Q 15 120 8 70 Q 25 110 40 145 Z" fill="#487e4f" />

          {/* Elegant tulip bulb */}
          <g transform="translate(40, 65)">
            {/* Back petal */}
            <path d="M 0 25 C -25 20 -20 -25 0 -25 C 20 -25 25 20 0 25 Z" fill="#b0c0c7" />

            {/* Left petal */}
            <path d="M -5 23 C -28 15 -20 -20 5 -20 C 15 -10 15 15 -5 23 Z" fill="url(#tulip-grad)" stroke="#b5c4cb" strokeWidth="0.5" />
            
            {/* Right petal */}
            <path d="M 5 23 C 28 15 20 -20 -5 -20 C -15 -10 -15 15 5 23 Z" fill="url(#tulip-grad)" stroke="#b5c4cb" strokeWidth="0.5" />

            {/* Front central petal */}
            <path d="M 0 26 C -18 22 -15 -15 0 -15 C 15 -15 18 22 0 26 Z" fill="url(#tulip-grad)" />
          </g>
        </svg>
      );

    case 'wild-chamomile':
      return (
        <svg viewBox="0 0 90 220" width={width} height={height} className={className}>
          {/* Main Stem */}
          <path d="M 45 60 L 45 220" fill="none" stroke="#4e7041" strokeWidth="2.5" />
          
          {/* Side shoots */}
          <path d="M 45 120 Q 30 100 20 80" fill="none" stroke="#4e7041" strokeWidth="1.5" />
          <path d="M 45 140 Q 60 120 70 100" fill="none" stroke="#4e7041" strokeWidth="1.5" />

          {/* Fine leaves */}
          <path d="M 45 160 Q 25 155 35 150" fill="none" stroke="#4e7041" strokeWidth="1.2" />
          <path d="M 45 180 Q 65 175 55 170" fill="none" stroke="#4e7041" strokeWidth="1.2" />

          {/* Daisy Head 1 (Center Top) */}
          <g transform="translate(45, 50)" className="glow-flower">
            {/* White Petals */}
            <g stroke="#e2e8f0" strokeWidth="0.5" fill="#ffffff">
              {Array.from({ length: 12 }).map((_, i) => {
                const angle = (i * 360) / 12;
                return (
                  <ellipse
                    key={i}
                    cx="0"
                    cy="-12"
                    rx="4.5"
                    ry="11"
                    transform={`rotate(${angle}, 0, 0)`}
                  />
                );
              })}
            </g>
            {/* Yellow Conical Center */}
            <circle cx="0" cy="0" r="7" fill="#ffd54f" stroke="#ffb300" strokeWidth="1" />
            <circle cx="-2" cy="-2" r="5" fill="#ffeb3b" opacity="0.8" />
          </g>

          {/* Daisy Head 2 (Left) */}
          <g transform="translate(20, 75)" scale="0.8" className="glow-flower">
            <g stroke="#e2e8f0" strokeWidth="0.5" fill="#ffffff">
              {Array.from({ length: 10 }).map((_, i) => {
                const angle = (i * 360) / 10;
                return (
                  <ellipse
                    key={i}
                    cx="0"
                    cy="-12"
                    rx="4"
                    ry="10"
                    transform={`rotate(${angle}, 0, 0)`}
                  />
                );
              })}
            </g>
            <circle cx="0" cy="0" r="6" fill="#ffd54f" stroke="#ffb300" strokeWidth="1" />
          </g>

          {/* Daisy Head 3 (Right) */}
          <g transform="translate(70, 95)" scale="0.75" className="glow-flower">
            <g stroke="#e2e8f0" strokeWidth="0.5" fill="#ffffff">
              {Array.from({ length: 10 }).map((_, i) => {
                const angle = (i * 360) / 10;
                return (
                  <ellipse
                    key={i}
                    cx="0"
                    cy="-12"
                    rx="4"
                    ry="10"
                    transform={`rotate(${angle}, 0, 0)`}
                  />
                );
              })}
            </g>
            <circle cx="0" cy="0" r="6" fill="#ffd54f" stroke="#ffb300" strokeWidth="1" />
          </g>
        </svg>
      );

    case 'eucalyptus-stem':
      return (
        <svg viewBox="0 0 100 250" width={width} height={height} className={className}>
          <defs>
            <linearGradient id="euca-leaf" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a3b899" />
              <stop offset="50%" stopColor="#879f82" />
              <stop offset="100%" stopColor="#5d7259" />
            </linearGradient>
          </defs>
          {/* Main stem */}
          <path d="M 50 30 Q 42 120 50 250" fill="none" stroke="#5d7259" strokeWidth="3" />

          {/* Stacked opposite leaves from bottom to top (getting smaller) */}
          <g stroke="#7c9276" strokeWidth="0.75">
            {/* Level 1 (Bottom) */}
            <ellipse cx="22" cy="200" rx="20" ry="16" fill="url(#euca-leaf)" transform="rotate(-15, 22, 200)" />
            <ellipse cx="78" cy="204" rx="20" ry="16" fill="url(#euca-leaf)" transform="rotate(15, 78, 204)" />

            {/* Level 2 */}
            <ellipse cx="25" cy="165" rx="19" ry="15" fill="url(#euca-leaf)" transform="rotate(-10, 25, 165)" />
            <ellipse cx="75" cy="168" rx="19" ry="15" fill="url(#euca-leaf)" transform="rotate(10, 75, 168)" />

            {/* Level 3 */}
            <ellipse cx="28" cy="130" rx="17" ry="13.5" fill="url(#euca-leaf)" transform="rotate(-8, 28, 130)" />
            <ellipse cx="72" cy="132" rx="17" ry="13.5" fill="url(#euca-leaf)" transform="rotate(8, 72, 132)" />

            {/* Level 4 */}
            <ellipse cx="32" cy="98" rx="15" ry="12" fill="url(#euca-leaf)" transform="rotate(-5, 32, 98)" />
            <ellipse cx="68" cy="100" rx="15" ry="12" fill="url(#euca-leaf)" transform="rotate(5, 68, 100)" />

            {/* Level 5 */}
            <ellipse cx="35" cy="70" rx="13" ry="10" fill="url(#euca-leaf)" transform="rotate(-5, 35, 70)" />
            <ellipse cx="65" cy="71" rx="13" ry="10" fill="url(#euca-leaf)" transform="rotate(5, 65, 71)" />

            {/* Level 6 (Top tips) */}
            <ellipse cx="38" cy="46" rx="10" ry="8" fill="url(#euca-leaf)" transform="rotate(-5, 38, 46)" />
            <ellipse cx="62" cy="47" rx="10" ry="8" fill="url(#euca-leaf)" transform="rotate(5, 62, 47)" />
            
            {/* Terminal bud */}
            <circle cx="50" cy="30" r="7" fill="url(#euca-leaf)" />
          </g>
        </svg>
      );

    case 'lavender-sprig':
      return (
        <svg viewBox="0 0 60 230" width={width} height={height} className={className}>
          <defs>
            <radialGradient id="laven-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#b39ddb" />
              <stop offset="60%" stopColor="#7e57c2" />
              <stop offset="100%" stopColor="#4527a0" />
            </radialGradient>
          </defs>
          {/* Central thin green stalk */}
          <line x1="30" y1="40" x2="30" y2="230" stroke="#4a7c59" strokeWidth="2" strokeLinecap="round" />

          {/* Leaves */}
          <path d="M 30 170 Q 15 155 20 145 Z" fill="#4a7c59" />
          <path d="M 30 190 Q 45 175 40 165 Z" fill="#4a7c59" />

          {/* Tiers of Lavender Buds */}
          <g fill="url(#laven-grad)">
            {/* Tier 1 (Top) */}
            <circle cx="30" cy="42" r="3.5" />
            <circle cx="27" cy="46" r="3" />
            <circle cx="33" cy="46" r="3" />

            {/* Tier 2 */}
            <circle cx="30" cy="53" r="4" />
            <circle cx="25" cy="56" r="3.5" />
            <circle cx="35" cy="56" r="3.5" />

            {/* Tier 3 */}
            <circle cx="30" cy="65" r="4.5" />
            <circle cx="23" cy="68" r="4" />
            <circle cx="37" cy="68" r="4" />
            <circle cx="28" cy="72" r="3.5" />
            <circle cx="32" cy="72" r="3.5" />

            {/* Tier 4 */}
            <circle cx="30" cy="82" r="4.5" />
            <circle cx="22" cy="85" r="4" />
            <circle cx="38" cy="85" r="4" />
            <circle cx="26" cy="90" r="3.5" />
            <circle cx="34" cy="90" r="3.5" />

            {/* Tier 5 */}
            <circle cx="30" cy="102" r="4.5" />
            <circle cx="22" cy="105" r="4" />
            <circle cx="38" cy="105" r="4" />
            <circle cx="26" cy="110" r="3.5" />
            <circle cx="34" cy="110" r="3.5" />

            {/* Tier 6 */}
            <circle cx="30" cy="122" r="4.5" />
            <circle cx="23" cy="125" r="4" />
            <circle cx="37" cy="125" r="4" />
          </g>
        </svg>
      );

    case 'babys-breath':
      return (
        <svg viewBox="0 0 110 230" width={width} height={height} className={className}>
          {/* Main Stem */}
          <path d="M 55 100 L 55 230" fill="none" stroke="#688a6d" strokeWidth="2" />

          {/* Multi-branched structure */}
          <g stroke="#688a6d" strokeWidth="1" fill="none">
            {/* Main branches */}
            <path d="M 55 130 Q 30 110 20 80" />
            <path d="M 55 150 Q 80 130 90 90" />
            <path d="M 55 110 Q 55 80 40 50" />
            <path d="M 55 110 Q 55 80 70 50" />

            {/* Sub-branches left */}
            <path d="M 20 80 Q 10 70 8 50" />
            <path d="M 20 80 Q 25 70 30 55" />

            {/* Sub-branches right */}
            <path d="M 90 90 Q 80 75 75 60" />
            <path d="M 90 90 Q 100 80 102 60" />
          </g>

          {/* Tiny cloud-like white flowers at the tips */}
          <g fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.25">
            {/* Top branch tips */}
            <circle cx="40" cy="50" r="2.5" />
            <circle cx="37" cy="46" r="2" />
            <circle cx="43" cy="48" r="2" />

            <circle cx="70" cy="50" r="2.5" />
            <circle cx="67" cy="47" r="2" />
            <circle cx="73" cy="49" r="2" />

            {/* Left branch tips */}
            <circle cx="8" cy="50" r="2.5" />
            <circle cx="5" cy="47" r="2" />
            <circle cx="11" cy="48" r="2" />

            <circle cx="30" cy="55" r="2.5" />
            <circle cx="28" cy="51" r="2" />
            <circle cx="33" cy="53" r="2" />

            {/* Right branch tips */}
            <circle cx="75" cy="60" r="2.5" />
            <circle cx="72" cy="56" r="2" />
            <circle cx="78" cy="58" r="2" />

            <circle cx="102" cy="60" r="2.5" />
            <circle cx="99" cy="56" r="2" />
            <circle cx="105" cy="57" r="2" />

            {/* Additional fillers in the middle */}
            <circle cx="48" cy="75" r="2" />
            <circle cx="62" cy="80" r="2" />
            <circle cx="45" cy="98" r="2.5" />
            <circle cx="65" cy="102" r="2.5" />
          </g>
        </svg>
      );

    default:
      return null;
  }
};
export default FlowerSVG;
