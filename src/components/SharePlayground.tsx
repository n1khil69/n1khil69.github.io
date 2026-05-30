import React, { useState } from 'react';
import { VesselType, WrappingType, FLOWER_TYPES, VESSEL_TYPES, WRAPPING_TYPES } from '../data/floralData';
import { PlacedStem } from './AtelierCanvas';

interface SharePlaygroundProps {
  stems: PlacedStem[];
  vesselId: string;
  wrappingId: string;
  cardTo: string;
  cardFrom: string;
  cardMessage: string;
  onResetAtelier: () => void;
}

export const SharePlayground: React.FC<SharePlaygroundProps> = ({
  stems,
  vesselId,
  wrappingId,
  cardTo,
  cardFrom,
  cardMessage,
  onResetAtelier,
}) => {
  const [exporting, setExporting] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  const selectedVessel = VESSEL_TYPES.find(v => v.id === vesselId) || VESSEL_TYPES[0];
  const selectedWrapping = WRAPPING_TYPES.find(w => w.id === wrappingId) || WRAPPING_TYPES[0];

  // Group stems for summary counting
  const stemGroups = stems.reduce((acc, stem) => {
    acc[stem.flowerId] = (acc[stem.flowerId] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });

  // Get flower path definition as a raw SVG string for programmatic bundle
  const getFlowerSVGPaths = (flowerId: string): string => {
    switch (flowerId) {
      case 'majestic-rose':
        return `
          <g>
            <path d="M 50 100 Q 48 170 52 240" fill="none" stroke="url(#rose-stem-grad)" stroke-width="4" stroke-linecap="round" />
            <g>
              <path d="M 49 140 Q 25 130 18 115 Q 35 110 49 130" fill="url(#rose-leaf-grad)" />
              <path d="M 49 130 C 35 122 25 118 18 115" fill="none" stroke="#162e1a" stroke-width="1" />
              <line x1="35" y1="125" x2="30" y2="115" stroke="#162e1a" stroke-width="0.75" />
              <line x1="42" y1="128" x2="40" y2="118" stroke="#162e1a" stroke-width="0.75" />
              
              <path d="M 51 170 Q 75 165 82 150 Q 65 145 51 160" fill="url(#rose-leaf-grad)" />
              <path d="M 51 160 C 65 152 75 150 82 150" fill="none" stroke="#162e1a" stroke-width="1" />
              <line x1="62" y1="156" x2="65" y2="148" stroke="#162e1a" stroke-width="0.75" />
              <line x1="70" y1="154" x2="75" y2="146" stroke="#162e1a" stroke-width="0.75" />
            </g>
            <path d="M 49 160 L 42 157 L 49 152 Z" fill="#2e5930" />
            <path d="M 51 190 L 58 187 L 51 182 Z" fill="#2e5930" />
            <g fill="#2e5930">
              <path d="M 35 90 Q 50 100 50 110 Q 50 100 65 90 Q 50 95 35 90" />
              <path d="M 45 92 L 50 112 L 55 92 Z" />
              <path d="M 30 85 Q 40 90 50 105 Q 38 95 30 85" />
              <path d="M 70 85 Q 60 90 50 105 Q 62 95 70 85" />
            </g>
            <g>
              <path d="M 50 105 C 10 95 15 50 50 50 C 85 50 90 95 50 105 Z" fill="url(#rose-petal-grad)" opacity="0.95" />
              <path d="M 50 103 C 20 95 22 58 50 58 C 78 58 80 95 50 103 Z" fill="url(#rose-petal-grad)" />
              <path d="M 50 98 C 28 92 30 65 50 65 C 70 65 72 92 50 98 Z" fill="url(#rose-petal-grad)" />
              <path d="M 50 94 C 34 88 36 72 50 72 C 64 72 66 88 50 94 Z" fill="url(#rose-petal-grad)" />
              <ellipse cx="50" cy="80" rx="10" ry="8" fill="#4a040b" />
              <path d="M 46 80 C 46 76 54 76 54 80 C 54 84 46 84 46 80 Z" fill="#b71c1c" />
              <path d="M 48 80 C 48 78 52 78 52 80 C 52 82 48 82 48 80 Z" fill="#ff5252" />
            </g>
          </g>
        `;
      case 'blush-peony':
        return `
          <g>
            <path d="M 60 100 Q 55 170 60 240" fill="none" stroke="url(#peony-stem)" stroke-width="4.5" stroke-linecap="round" />
            <path d="M 58 150 Q 25 155 15 140 Q 35 130 58 142 Z" fill="#2d5c31" />
            <path d="M 62 180 Q 95 185 105 170 Q 85 160 62 172 Z" fill="#2d5c31" />
            <g transform="translate(60, 80)">
              <circle cx="-25" cy="-10" r="24" fill="url(#peony-petal)" opacity="0.9" />
              <circle cx="25" cy="-10" r="24" fill="url(#peony-petal)" opacity="0.9" />
              <circle cx="0" cy="-28" r="24" fill="url(#peony-petal)" opacity="0.9" />
              <circle cx="-15" cy="20" r="24" fill="url(#peony-petal)" opacity="0.9" />
              <circle cx="15" cy="20" r="24" fill="url(#peony-petal)" opacity="0.9" />
              <circle cx="-18" cy="-8" r="20" fill="url(#peony-petal)" />
              <circle cx="18" cy="-8" r="20" fill="url(#peony-petal)" />
              <circle cx="0" cy="-18" r="20" fill="url(#peony-petal)" />
              <circle cx="-10" cy="12" r="20" fill="url(#peony-petal)" />
              <circle cx="10" cy="12" r="20" fill="url(#peony-petal)" />
              <path d="M -20 -5 Q -10 -25 0 -5 Q 10 -25 20 -5 Q 30 15 0 20 Q -30 15 -20 -5 Z" fill="url(#peony-petal)" />
              <circle cx="-5" cy="-2" r="12" fill="#f06292" />
              <circle cx="5" cy="2" r="12" fill="#f06292" />
              <circle cx="0" cy="5" r="10" fill="#f8bbd0" />
              <circle cx="-2" cy="-5" r="8" fill="#fff" opacity="0.6" />
              <circle cx="-3" cy="2" r="2" fill="#ffd54f" />
              <circle cx="3" cy="-1" r="2" fill="#ffd54f" />
              <circle cx="1" cy="4" r="1.5" fill="#ffb300" />
              <circle cx="-4" cy="-3" r="1.5" fill="#ffb300" />
            </g>
          </g>
        `;
      case 'royal-lily':
        return `
          <g>
            <path d="M 65 110 L 65 250" fill="none" stroke="url(#lily-stem)" stroke-width="4" stroke-linecap="round" />
            <path d="M 65 160 Q 30 150 15 130 Q 35 140 65 150 Z" fill="#3d6642" />
            <path d="M 65 180 Q 100 170 115 150 Q 95 160 65 170 Z" fill="#3d6642" />
            <g transform="translate(65, 90)">
              <path d="M 0 0 Q -45 -55 -40 -65 Q -25 -45 0 0" fill="url(#lily-petal-grad)" stroke="#dcd0c4" stroke-width="0.5" />
              <path d="M 0 0 Q 45 -55 40 -65 Q 25 -45 0 0" fill="url(#lily-petal-grad)" stroke="#dcd0c4" stroke-width="0.5" />
              <path d="M 0 0 Q 0 65 -15 65 Q -10 35 0 0" fill="url(#lily-petal-grad)" stroke="#dcd0c4" stroke-width="0.5" />
              <path d="M 0 0 Q 0 65 15 65 Q 10 35 0 0" fill="url(#lily-petal-grad)" stroke="#dcd0c4" stroke-width="0.5" />
              <path d="M 0 0 Q -65 -10 -60 5 Q -35 5 0 0" fill="url(#lily-petal-grad)" stroke="#d0c4b8" stroke-width="0.5" />
              <path d="M 0 0 Q 65 -10 60 5 Q 35 5 0 0" fill="url(#lily-petal-grad)" stroke="#d0c4b8" stroke-width="0.5" />
              <path d="M 0 0 Q -35 -40 0 -75 Q 15 -45 0 0" fill="url(#lily-petal-grad)" stroke="#d0c4b8" stroke-width="0.5" />
              <path d="M 0 0 Q -20 -27 -20 -32" fill="none" stroke="#e8c5c8" stroke-width="1.5" opacity="0.6" />
              <path d="M 0 0 Q 20 -27 20 -32" fill="none" stroke="#e8c5c8" stroke-width="1.5" opacity="0.6" />
              <path d="M 0 0 Q -30 2 -35 2" fill="none" stroke="#e8c5c8" stroke-width="1.5" opacity="0.6" />
              <path d="M 0 0 Q 30 2 35 2" fill="none" stroke="#e8c5c8" stroke-width="1.5" opacity="0.6" />
              <path d="M 0 0 Q -10 -35 0 -45" fill="none" stroke="#e8c5c8" stroke-width="1.5" opacity="0.6" />
              <g stroke="#c5a880" stroke-width="1.5" fill="none">
                <path d="M 0 0 Q -15 -25 -25 -38" />
                <path d="M 0 0 Q -5 -28 -10 -45" />
                <path d="M 0 0 Q 10 -28 10 -45" />
                <path d="M 0 0 Q 15 -25 25 -38" />
                <path d="M 0 0 Q 0 -15 -3 -30" />
              </g>
              <g fill="#9e1b32">
                <ellipse cx="-25" cy="-38" rx="4" ry="2" transform="rotate(-30, -25, -38)" />
                <ellipse cx="-10" cy="-45" rx="4" ry="2" transform="rotate(-10, -10, -45)" />
                <ellipse cx="10" cy="-45" rx="4" ry="2" transform="rotate(10, 10, -45)" />
                <ellipse cx="25" cy="-38" rx="4" ry="2" transform="rotate(30, 25, -38)" />
                <ellipse cx="-3" cy="-30" rx="3.5" ry="1.8" />
              </g>
              <path d="M 0 0 Q 5 -35 12 -50" fill="none" stroke="#839b8c" stroke-width="2" />
              <circle cx="12" cy="-50" r="2.5" fill="#4e6d5e" />
            </g>
          </g>
        `;
      case 'gold-carnation':
        return `
          <g>
            <path d="M 50 90 L 50 230" fill="none" stroke="#33663a" stroke-width="3.5" />
            <path d="M 50 140 Q 20 125 10 110 Q 30 120 50 135 Z" fill="#33663a" />
            <path d="M 50 170 Q 80 155 90 140 Q 70 150 50 165 Z" fill="#33663a" />
            <g transform="translate(50, 75)">
              <circle cx="0" cy="0" r="32" fill="url(#carna-grad)" stroke="#8c582e" stroke-width="0.5" stroke-dasharray="3 2" />
              <circle cx="-10" cy="-5" r="24" fill="url(#carna-grad)" stroke="#8c582e" stroke-width="0.5" stroke-dasharray="2 1" />
              <circle cx="10" cy="5" r="24" fill="url(#carna-grad)" stroke="#8c582e" stroke-width="0.5" stroke-dasharray="2 1" />
              <circle cx="5" cy="-10" r="24" fill="url(#carna-grad)" stroke="#8c582e" stroke-width="0.5" stroke-dasharray="2 1" />
              <circle cx="-5" cy="10" r="24" fill="url(#carna-grad)" stroke="#8c582e" stroke-width="0.5" stroke-dasharray="2 1" />
              <circle cx="0" cy="0" r="16" fill="url(#carna-grad)" stroke="#8c582e" stroke-width="0.75" />
              <path d="M -10 -10 Q 0 -22 10 -10 Q 22 0 10 10 Q 0 22 -10 10 Q -22 0 -10 -10 Z" fill="url(#carna-grad)" />
              <circle cx="0" cy="0" r="8" fill="#f5cdab" />
            </g>
          </g>
        `;
      case 'white-tulip':
        return `
          <g>
            <path d="M 40 85 Q 38 150 42 230" fill="none" stroke="#487e4f" stroke-width="4" stroke-linecap="round" />
            <path d="M 41 160 Q 15 120 8 70 Q 25 110 40 145 Z" fill="#487e4f" />
            <g transform="translate(40, 65)">
              <path d="M 0 25 C -25 20 -20 -25 0 -25 C 20 -25 25 20 0 25 Z" fill="#b0c0c7" />
              <path d="M -5 23 C -28 15 -20 -20 5 -20 C 15 -10 15 15 -5 23 Z" fill="url(#tulip-grad)" stroke="#b5c4cb" stroke-width="0.5" />
              <path d="M 5 23 C 28 15 20 -20 -5 -20 C -15 -10 -15 15 5 23 Z" fill="url(#tulip-grad)" stroke="#b5c4cb" stroke-width="0.5" />
              <path d="M 0 26 C -18 22 -15 -15 0 -15 C 15 -15 18 22 0 26 Z" fill="url(#tulip-grad)" />
            </g>
          </g>
        `;
      case 'wild-chamomile':
        return `
          <g>
            <path d="M 45 60 L 45 220" fill="none" stroke="#4e7041" stroke-width="2.5" />
            <path d="M 45 120 Q 30 100 20 80" fill="none" stroke="#4e7041" stroke-width="1.5" />
            <path d="M 45 140 Q 60 120 70 100" fill="none" stroke="#4e7041" stroke-width="1.5" />
            <path d="M 45 160 Q 25 155 35 150" fill="none" stroke="#4e7041" stroke-width="1.2" />
            <path d="M 45 180 Q 65 175 55 170" fill="none" stroke="#4e7041" stroke-width="1.2" />
            <g transform="translate(45, 50)">
              <g stroke="#e2e8f0" stroke-width="0.5" fill="#ffffff">
                <ellipse cx="0" cy="-12" rx="4.5" ry="11" />
                <ellipse cx="0" cy="-12" rx="4.5" ry="11" transform="rotate(30)" />
                <ellipse cx="0" cy="-12" rx="4.5" ry="11" transform="rotate(60)" />
                <ellipse cx="0" cy="-12" rx="4.5" ry="11" transform="rotate(90)" />
                <ellipse cx="0" cy="-12" rx="4.5" ry="11" transform="rotate(120)" />
                <ellipse cx="0" cy="-12" rx="4.5" ry="11" transform="rotate(150)" />
                <ellipse cx="0" cy="-12" rx="4.5" ry="11" transform="rotate(180)" />
                <ellipse cx="0" cy="-12" rx="4.5" ry="11" transform="rotate(210)" />
                <ellipse cx="0" cy="-12" rx="4.5" ry="11" transform="rotate(240)" />
                <ellipse cx="0" cy="-12" rx="4.5" ry="11" transform="rotate(270)" />
                <ellipse cx="0" cy="-12" rx="4.5" ry="11" transform="rotate(300)" />
                <ellipse cx="0" cy="-12" rx="4.5" ry="11" transform="rotate(330)" />
              </g>
              <circle cx="0" cy="0" r="7" fill="#ffd54f" stroke="#ffb300" stroke-width="1" />
              <circle cx="-2" cy="-2" r="5" fill="#ffeb3b" opacity="0.8" />
            </g>
            <g transform="translate(20, 75) scale(0.8)">
              <g stroke="#e2e8f0" stroke-width="0.5" fill="#ffffff">
                <ellipse cx="0" cy="-12" rx="4" ry="10" />
                <ellipse cx="0" cy="-12" rx="4" ry="10" transform="rotate(36)" />
                <ellipse cx="0" cy="-12" rx="4" ry="10" transform="rotate(72)" />
                <ellipse cx="0" cy="-12" rx="4" ry="10" transform="rotate(108)" />
                <ellipse cx="0" cy="-12" rx="4" ry="10" transform="rotate(144)" />
                <ellipse cx="0" cy="-12" rx="4" ry="10" transform="rotate(180)" />
                <ellipse cx="0" cy="-12" rx="4" ry="10" transform="rotate(216)" />
                <ellipse cx="0" cy="-12" rx="4" ry="10" transform="rotate(252)" />
                <ellipse cx="0" cy="-12" rx="4" ry="10" transform="rotate(288)" />
                <ellipse cx="0" cy="-12" rx="4" ry="10" transform="rotate(324)" />
              </g>
              <circle cx="0" cy="0" r="6" fill="#ffd54f" stroke="#ffb300" stroke-width="1" />
            </g>
          </g>
        `;
      case 'eucalyptus-stem':
        return `
          <g>
            <path d="M 50 30 Q 42 120 50 250" fill="none" stroke="#5d7259" stroke-width="3" />
            <g stroke="#7c9276" stroke-width="0.75">
              <ellipse cx="22" cy="200" rx="20" ry="16" fill="url(#euca-leaf)" transform="rotate(-15, 22, 200)" />
              <ellipse cx="78" cy="204" rx="20" ry="16" fill="url(#euca-leaf)" transform="rotate(15, 78, 204)" />
              <ellipse cx="25" cy="165" rx="19" ry="15" fill="url(#euca-leaf)" transform="rotate(-10, 25, 165)" />
              <ellipse cx="75" cy="168" rx="19" ry="15" fill="url(#euca-leaf)" transform="rotate(10, 75, 168)" />
              <ellipse cx="28" cy="130" rx="17" ry="13.5" fill="url(#euca-leaf)" transform="rotate(-8, 28, 130)" />
              <ellipse cx="72" cy="132" rx="17" ry="13.5" fill="url(#euca-leaf)" transform="rotate(8, 72, 132)" />
              <ellipse cx="32" cy="98" rx="15" ry="12" fill="url(#euca-leaf)" transform="rotate(-5, 32, 98)" />
              <ellipse cx="68" cy="100" rx="15" ry="12" fill="url(#euca-leaf)" transform="rotate(5, 68, 100)" />
              <ellipse cx="35" cy="70" rx="13" ry="10" fill="url(#euca-leaf)" transform="rotate(-5, 35, 70)" />
              <ellipse cx="65" cy="71" rx="13" ry="10" fill="url(#euca-leaf)" transform="rotate(5, 65, 71)" />
              <circle cx="50" cy="30" r="7" fill="url(#euca-leaf)" />
            </g>
          </g>
        `;
      case 'lavender-sprig':
        return `
          <g>
            <line x1="30" y1="40" x2="30" y2="230" stroke="#4a7c59" stroke-width="2" stroke-linecap="round" />
            <path d="M 30 170 Q 15 155 20 145 Z" fill="#4a7c59" />
            <path d="M 30 190 Q 45 175 40 165 Z" fill="#4a7c59" />
            <g fill="url(#laven-grad)">
              <circle cx="30" cy="42" r="3.5" />
              <circle cx="27" cy="46" r="3" /><circle cx="33" cy="46" r="3" />
              <circle cx="30" cy="53" r="4" />
              <circle cx="25" cy="56" r="3.5" /><circle cx="35" cy="56" r="3.5" />
              <circle cx="30" cy="65" r="4.5" />
              <circle cx="23" cy="68" r="4" /><circle cx="37" cy="68" r="4" />
              <circle cx="30" cy="82" r="4.5" />
              <circle cx="22" cy="85" r="4" /><circle cx="38" cy="85" r="4" />
              <circle cx="30" cy="102" r="4.5" />
              <circle cx="22" cy="105" r="4" /><circle cx="38" cy="105" r="4" />
              <circle cx="30" cy="122" r="4.5" />
            </g>
          </g>
        `;
      case 'babys-breath':
        return `
          <g>
            <path d="M 55 100 L 55 230" fill="none" stroke="#688a6d" stroke-width="2" />
            <g stroke="#688a6d" stroke-width="1" fill="none">
              <path d="M 55 130 Q 30 110 20 80" />
              <path d="M 55 150 Q 80 130 90 90" />
              <path d="M 55 110 Q 55 80 40 50" /><path d="M 55 110 Q 55 80 70 50" />
              <path d="M 20 80 Q 10 70 8 50" /><path d="M 20 80 Q 25 70 30 55" />
              <path d="M 90 90 Q 80 75 75 60" /><path d="M 90 90 Q 100 80 102 60" />
            </g>
            <g fill="#ffffff" stroke="#e2e8f0" stroke-width="0.25">
              <circle cx="40" cy="50" r="2.5" /><circle cx="37" cy="46" r="2" /><circle cx="43" cy="48" r="2" />
              <circle cx="70" cy="50" r="2.5" /><circle cx="67" cy="47" r="2" /><circle cx="73" cy="49" r="2" />
              <circle cx="8" cy="50" r="2.5" /><circle cx="5" cy="47" r="2" /><circle cx="11" cy="48" r="2" />
              <circle cx="30" cy="55" r="2.5" />
              <circle cx="75" cy="60" r="2.5" />
              <circle cx="102" cy="60" r="2.5" />
            </g>
          </g>
        `;
      case 'midnight-calla':
        return `
          <g>
            <path d="M 50 100 Q 48 160 52 240" fill="none" stroke="url(#calla-stem)" stroke-width="4" stroke-linecap="round" />
            <path d="M 44 100 Q 50 115 56 100 L 50 118 Z" fill="#15331a" />
            <g>
              <path d="M 50 105 C 22 95 18 55 42 38 C 50 30 62 32 68 45 C 80 65 72 95 50 105 Z" fill="url(#calla-spathe)" stroke="rgba(255,255,255,0.03)" stroke-width="0.5" />
              <path d="M 50 78 Q 49 55 52 48 C 54 52 52 68 50 78" fill="url(#calla-spadix)" />
              <circle cx="51" cy="48" r="1.5" fill="#fff" opacity="0.6" />
              <path d="M 42 38 C 48 24 56 26 62 38 C 58 48 48 48 42 38 Z" fill="#120316" opacity="0.95" />
              <path d="M 68 45 C 64 35 55 35 50 48" fill="none" stroke="#ffe082" stroke-width="0.75" opacity="0.25" />
            </g>
          </g>
        `;
      case 'blue-hydrangea':
        return `
          <g>
            <path d="M 60 100 Q 56 160 60 240" fill="none" stroke="url(#hydr-stem)" stroke-width="4.5" stroke-linecap="round" />
            <path d="M 58 140 Q 30 135 20 125 Q 38 115 58 132 Z" fill="#2d5c31" stroke="#1c3e1e" stroke-width="0.5" />
            <path d="M 62 165 Q 90 160 100 150 Q 82 140 62 155 Z" fill="#2d5c31" stroke="#1c3e1e" stroke-width="0.5" />
            <g transform="translate(60, 75)">
              <circle cx="0" cy="-5" r="32" fill="#223f78" opacity="0.25" filter="blur(2px)" />
              <g transform="translate(0, -20)"><circle cx="-6" cy="0" r="6" fill="url(#hydr-floret)" /><circle cx="6" cy="0" r="6" fill="url(#hydr-floret)" /><circle cx="0" cy="-6" r="6" fill="url(#hydr-floret)" /><circle cx="0" cy="6" r="6" fill="url(#hydr-floret)" /><circle cx="0" cy="0" r="1.8" fill="#ffe082" stroke="#ffb300" stroke-width="0.5" /></g>
              <g transform="translate(-16, -12)"><circle cx="-6" cy="0" r="6" fill="url(#hydr-floret)" /><circle cx="6" cy="0" r="6" fill="url(#hydr-floret)" /><circle cx="0" cy="-6" r="6" fill="url(#hydr-floret)" /><circle cx="0" cy="6" r="6" fill="url(#hydr-floret)" /><circle cx="0" cy="0" r="1.8" fill="#ffe082" stroke="#ffb300" stroke-width="0.5" /></g>
              <g transform="translate(16, -12)"><circle cx="-6" cy="0" r="6" fill="url(#hydr-floret)" /><circle cx="6" cy="0" r="6" fill="url(#hydr-floret)" /><circle cx="0" cy="-6" r="6" fill="url(#hydr-floret)" /><circle cx="0" cy="6" r="6" fill="url(#hydr-floret)" /><circle cx="0" cy="0" r="1.8" fill="#ffe082" stroke="#ffb300" stroke-width="0.5" /></g>
              <g transform="translate(-22, 8)"><circle cx="-6" cy="0" r="6" fill="url(#hydr-floret)" /><circle cx="6" cy="0" r="6" fill="url(#hydr-floret)" /><circle cx="0" cy="-6" r="6" fill="url(#hydr-floret)" /><circle cx="0" cy="6" r="6" fill="url(#hydr-floret)" /><circle cx="0" cy="0" r="1.8" fill="#ffe082" stroke="#ffb300" stroke-width="0.5" /></g>
              <g transform="translate(22, 8)"><circle cx="-6" cy="0" r="6" fill="url(#hydr-floret)" /><circle cx="6" cy="0" r="6" fill="url(#hydr-floret)" /><circle cx="0" cy="-6" r="6" fill="url(#hydr-floret)" /><circle cx="0" cy="6" r="6" fill="url(#hydr-floret)" /><circle cx="0" cy="0" r="1.8" fill="#ffe082" stroke="#ffb300" stroke-width="0.5" /></g>
              <g transform="translate(0, 16)"><circle cx="-6" cy="0" r="6" fill="url(#hydr-floret)" /><circle cx="6" cy="0" r="6" fill="url(#hydr-floret)" /><circle cx="0" cy="-6" r="6" fill="url(#hydr-floret)" /><circle cx="0" cy="6" r="6" fill="url(#hydr-floret)" /><circle cx="0" cy="0" r="1.8" fill="#ffe082" stroke="#ffb300" stroke-width="0.5" /></g>
              <g transform="translate(0, -5) scale(1.05)"><circle cx="-6" cy="0" r="6" fill="url(#hydr-floret)" /><circle cx="6" cy="0" r="6" fill="url(#hydr-floret)" /><circle cx="0" cy="-6" r="6" fill="url(#hydr-floret)" /><circle cx="0" cy="6" r="6" fill="url(#hydr-floret)" /><circle cx="0" cy="0" r="1.8" fill="#ffe082" stroke="#ffb300" stroke-width="0.5" /></g>
            </g>
          </g>
        `;
      case 'imperial-orchid':
        return `
          <g>
            <path d="M 40 240 Q 42 150 68 85 Q 85 45 60 30" fill="none" stroke="url(#orch-stem)" stroke-width="3" stroke-linecap="round" />
            <path d="M 38 220 Q 15 200 8 180 Q 25 190 39 210 Z" fill="#2c422d" />
            <path d="M 42 225 Q 65 210 75 190 Q 55 200 41 215 Z" fill="#2c422d" />
            <g transform="translate(68, 85) scale(0.95)">
              <ellipse cx="-16" cy="-2" rx="14" ry="11" fill="url(#orch-petal)" transform="rotate(-5, -16, -2)" />
              <ellipse cx="16" cy="-2" rx="14" ry="11" fill="url(#orch-petal)" transform="rotate(5, 16, -2)" />
              <ellipse cx="0" cy="-16" rx="11" ry="14" fill="url(#orch-petal)" />
              <ellipse cx="-10" cy="14" rx="9" ry="13" fill="url(#orch-petal)" transform="rotate(-30, -10, 14)" />
              <ellipse cx="10" cy="14" rx="9" ry="13" fill="url(#orch-petal)" transform="rotate(30, 10, 14)" />
              <path d="M -5 2 C -5 -5 5 -5 5 2 C 5 8 -5 8 -5 2" fill="#ffd54f" stroke="#ff8f00" stroke-width="0.5" />
              <circle cx="0" cy="1" r="1.5" fill="#d84315" />
            </g>
            <g transform="translate(74, 50) scale(0.8)">
              <ellipse cx="-16" cy="-2" rx="14" ry="11" fill="url(#orch-petal)" transform="rotate(-5, -16, -2)" />
              <ellipse cx="16" cy="-2" rx="14" ry="11" fill="url(#orch-petal)" transform="rotate(5, 16, -2)" />
              <ellipse cx="0" cy="-16" rx="11" ry="14" fill="url(#orch-petal)" />
              <ellipse cx="-10" cy="14" rx="9" ry="13" fill="url(#orch-petal)" transform="rotate(-30, -10, 14)" />
              <ellipse cx="10" cy="14" rx="9" ry="13" fill="url(#orch-petal)" transform="rotate(30, 10, 14)" />
              <path d="M -5 2 C -5 -5 5 -5 5 2 C 5 8 -5 8 -5 2" fill="#ffd54f" stroke="#ff8f00" stroke-width="0.5" />
              <circle cx="0" cy="1" r="1.5" fill="#d84315" />
            </g>
            <g transform="translate(48, 125) scale(0.9)">
              <ellipse cx="-16" cy="-2" rx="14" ry="11" fill="url(#orch-petal)" transform="rotate(-5, -16, -2)" />
              <ellipse cx="16" cy="-2" rx="14" ry="11" fill="url(#orch-petal)" transform="rotate(5, 16, -2)" />
              <ellipse cx="0" cy="-16" rx="11" ry="14" fill="url(#orch-petal)" />
              <ellipse cx="-10" cy="14" rx="9" ry="13" fill="url(#orch-petal)" transform="rotate(-30, -10, 14)" />
              <ellipse cx="10" cy="14" rx="9" ry="13" fill="url(#orch-petal)" transform="rotate(30, 10, 14)" />
              <path d="M -5 2 C -5 -5 5 -5 5 2 C 5 8 -5 8 -5 2" fill="#ffd54f" stroke="#ff8f00" stroke-width="0.5" />
              <circle cx="0" cy="1" r="1.5" fill="#d84315" />
            </g>
          </g>
        `;
      default:
        return '';
    }
  };

  // Get raw path for chosen vessel (used in programmatic export)
  const getVesselPaths = (back: boolean): string => {
    if (back) {
      switch (selectedVessel.svgType) {
        case 'glass':
          return `
            <ellipse cx="400" cy="415" rx="50" ry="10" fill="#2d2218" opacity="0.3" />
            <path d="M350 415 C350 415 340 580 350 590 C360 600 440 600 450 590 C460 580 450 415 450 415" fill="#fcf6ec" opacity="0.08" />
          `;
        case 'ceramic':
          return `<ellipse cx="400" cy="415" rx="55" ry="12" fill="#0f1613" />`;
        case 'terracotta':
          return `<ellipse cx="400" cy="415" rx="60" ry="12" fill="#1b120c" />`;
        case 'kraft':
          return `<path d="M340 450 L400 590 L460 450 Z" fill="#8c7355" opacity="0.75" />`;
        default:
          return '';
      }
    } else {
      let ribbonSVG = '';
      if (selectedWrapping.id !== 'none') {
        const c = selectedWrapping.color;
        ribbonSVG = `
          <g>
            <rect x="365" y="430" width="70" height="15" rx="4" fill="${c}" stroke="rgba(0,0,0,0.15)" stroke-width="1" />
            <circle cx="400" cy="437.5" r="8" fill="${c}" stroke="rgba(0,0,0,0.1)" stroke-width="1" />
            <path d="M 400 437.5 C 385 420 370 430 400 437.5" fill="${c}" opacity="0.95" />
            <path d="M 400 437.5 C 415 420 430 430 400 437.5" fill="${c}" opacity="0.95" />
            <path d="M 398 437.5 Q 390 470 378 490" fill="none" stroke="${c}" stroke-width="6" stroke-linecap="round" />
            <path d="M 402 437.5 Q 410 470 422 490" fill="none" stroke="${c}" stroke-width="6" stroke-linecap="round" />
          </g>
        `;
      }

      switch (selectedVessel.svgType) {
        case 'glass':
          return `
            <path d="M350 490 Q 400 498 450 490 C 450 490 451 580 446 590 C436 600 364 600 354 590 C 349 580 350 490 350 490 Z" fill="#839b8c" fill-opacity="0.15" />
            <path d="M350 490 Q 400 498 450 490" fill="none" stroke="#faf7f2" stroke-width="0.75" stroke-opacity="0.4" />
            <path d="M350 415 C350 415 340 580 350 590 C360 600 440 600 450 590 C460 580 450 415 450 415 Z" fill="url(#glass-reflection)" />
            <path d="M350 415 C350 415 340 580 350 590 C360 600 440 600 450 590 C460 580 450 415 450 415 Z" fill="#ffb74d" fill-opacity="0.12" stroke="rgba(197, 168, 128, 0.4)" stroke-width="1.5" />
            <line x1="365" y1="418" x2="360" y2="588" stroke="#faf7f2" stroke-width="1" stroke-opacity="0.15" />
            <line x1="383" y1="418" x2="380" y2="594" stroke="#faf7f2" stroke-width="1" stroke-opacity="0.15" />
            <line x1="400" y1="418" x2="400" y2="596" stroke="#faf7f2" stroke-width="1.5" stroke-opacity="0.2" />
            <line x1="417" y1="418" x2="420" y2="594" stroke="#faf7f2" stroke-width="1" stroke-opacity="0.15" />
            <line x1="435" y1="418" x2="440" y2="588" stroke="#faf7f2" stroke-width="1" stroke-opacity="0.15" />
            <ellipse cx="400" cy="415" rx="50" ry="10" fill="none" stroke="url(#gold-rim)" stroke-width="3" />
            ${ribbonSVG}
          `;
        case 'ceramic':
          return `
            <path d="M345 415 C345 415 320 520 345 560 C365 585 435 585 455 560 C480 520 455 415 455 415 Z" fill="url(#ceramic-grad)" stroke="rgba(140, 115, 82, 0.25)" stroke-width="1.5" />
            <ellipse cx="400" cy="415" rx="55" ry="12" fill="none" stroke="#c5a880" stroke-width="2.5" />
            ${ribbonSVG}
          `;
        case 'terracotta':
          return `
            <path d="M340 415 C340 415 325 520 345 555 C360 575 440 575 455 555 C475 520 460 415 460 415 Z" fill="url(#terra-grad)" stroke="rgba(197, 168, 128, 0.15)" stroke-width="1.5" />
            <ellipse cx="400" cy="415" rx="60" ry="12" fill="none" stroke="#374a41" stroke-width="2.5" />
            ${ribbonSVG}
          `;
        case 'kraft':
          return `
            <path d="M310 450 L400 590 L370 440 Z" fill="url(#kraft-grad)" stroke="#806543" stroke-width="1" />
            <path d="M490 450 L400 590 L430 440 Z" fill="url(#kraft-grad)" stroke="#806543" stroke-width="1" />
            <path d="M330 465 L400 590 L470 465 Z" fill="#bd9f75" opacity="0.9" stroke="#9c805a" stroke-width="1" />
            ${ribbonSVG}
          `;
        default:
          return '';
      }
    }
  };

  // Compile full SVG code for downloading
  const handleExportPNG = async () => {
    if (stems.length === 0) {
      alert('Your Atelier is empty! Add flowers to export.');
      return;
    }
    setExporting(true);

    try {
      // Build programmatically perfect vector SVG representing the arrangement
      const stemsSVG = stems
        .slice()
        .sort((a, b) => a.zIndex - b.zIndex)
        .map((stem) => {
          const transX = (stem.x / 100) * 800;
          const transY = (stem.y / 100) * 600;
          return `
            <g transform="translate(${transX}, ${transY}) scale(${stem.scale}) rotate(${stem.rotation}) translate(-50, -220)">
              ${getFlowerSVGPaths(stem.flowerId)}
            </g>
          `;
        })
        .join('\n');

      const fullSVG = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="1600" height="1200">
          <defs>
            <!-- Background Gradients -->
            <radialGradient id="bg-grad" cx="50%" cy="50%" r="70%">
              <stop offset="0%" stop-color="#0a0a0d" />
              <stop offset="100%" stop-color="#040405" />
            </radialGradient>
            <radialGradient id="spot-glow" cx="50%" cy="40%" r="50%">
              <stop offset="0%" stop-color="#ffffff" stop-opacity="0.08" />
              <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
            </radialGradient>

            <!-- Flower Gradients -->
            <linearGradient id="rose-stem-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#1e3f20" />
              <stop offset="50%" stop-color="#2e5930" />
              <stop offset="100%" stop-color="#122b14" />
            </linearGradient>
            <radialGradient id="rose-petal-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#d32f2f" />
              <stop offset="40%" stop-color="#b71c1c" />
              <stop offset="70%" stop-color="#880e4f" />
              <stop offset="100%" stop-color="#310006" />
            </radialGradient>
            <linearGradient id="rose-leaf-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#3d6e42" />
              <stop offset="100%" stop-color="#1b3d20" />
            </linearGradient>
            <radialGradient id="peony-petal" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#fcd3de" />
              <stop offset="60%" stop-color="#f48fb1" />
              <stop offset="90%" stop-color="#e91e63" />
              <stop offset="100%" stop-color="#880e4f" />
            </radialGradient>
            <linearGradient id="peony-stem" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#2d5c31" />
              <stop offset="100%" stop-color="#1a3d1c" />
            </linearGradient>
            <linearGradient id="lily-petal-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#ffffff" />
              <stop offset="70%" stop-color="#faf2eb" />
              <stop offset="100%" stop-color="#ded1c5" />
            </linearGradient>
            <linearGradient id="lily-stem" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#3d6642" />
              <stop offset="100%" stop-color="#224226" />
            </linearGradient>
            <radialGradient id="carna-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#f5cdab" />
              <stop offset="60%" stop-color="#d49b6a" />
              <stop offset="100%" stop-color="#8c582e" />
            </radialGradient>
            <linearGradient id="tulip-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#ffffff" />
              <stop offset="60%" stop-color="#eef2f4" />
              <stop offset="100%" stop-color="#c7d5db" />
            </linearGradient>
            <linearGradient id="euca-leaf" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#a3b899" />
              <stop offset="50%" stop-color="#879f82" />
              <stop offset="100%" stop-color="#5d7259" />
            </linearGradient>
            <radialGradient id="laven-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#b39ddb" />
              <stop offset="60%" stop-color="#7e57c2" />
              <stop offset="100%" stop-color="#4527a0" />
            </radialGradient>

            <!-- Calla, Hydrangea, and Orchid Gradients -->
            <linearGradient id="calla-stem" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#224c28" />
              <stop offset="50%" stop-color="#326c3a" />
              <stop offset="100%" stop-color="#15331a" />
            </linearGradient>
            <linearGradient id="calla-spathe" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#3e1a47" />
              <stop offset="40%" stop-color="#1d0724" />
              <stop offset="85%" stop-color="#0d0210" />
              <stop offset="100%" stop-color="#050007" />
            </linearGradient>
            <linearGradient id="calla-spadix" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#ffe082" />
              <stop offset="100%" stop-color="#ffa000" />
            </linearGradient>
            <linearGradient id="hydr-stem" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#2e5932" />
              <stop offset="100%" stop-color="#1a3d1d" />
            </linearGradient>
            <radialGradient id="hydr-floret" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#bbd2f6" />
              <stop offset="50%" stop-color="#80a7e6" />
              <stop offset="90%" stop-color="#416bb5" />
              <stop offset="100%" stop-color="#223f78" />
            </radialGradient>
            <linearGradient id="orch-stem" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#4a6b4c" />
              <stop offset="100%" stop-color="#2c422d" />
            </linearGradient>
            <radialGradient id="orch-petal" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#ffffff" />
              <stop offset="75%" stop-color="#faf9f5" />
              <stop offset="100%" stop-color="#e8e5db" />
            </radialGradient>

            <!-- Vase Gradients -->
            <linearGradient id="glass-reflection" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#ffffff" stop-opacity="0.4" />
              <stop offset="25%" stop-color="#ffffff" stop-opacity="0.1" />
              <stop offset="50%" stop-color="#ffffff" stop-opacity="0" />
              <stop offset="85%" stop-color="#ffffff" stop-opacity="0.15" />
              <stop offset="100%" stop-color="#ffffff" stop-opacity="0.5" />
            </linearGradient>
            <linearGradient id="gold-rim" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#8c7352" />
              <stop offset="30%" stop-color="#d4af37" />
              <stop offset="50%" stop-color="#faf7f2" />
              <stop offset="70%" stop-color="#d4af37" />
              <stop offset="100%" stop-color="#8c7352" />
            </linearGradient>
            <linearGradient id="ceramic-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#d9cec1" />
              <stop offset="30%" stop-color="#faf7f2" />
              <stop offset="70%" stop-color="#f3eae0" />
              <stop offset="100%" stop-color="#beb1a0" />
            </linearGradient>
            <linearGradient id="terra-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#41564d" />
              <stop offset="35%" stop-color="#638073" />
              <stop offset="70%" stop-color="#4d665a" />
              <stop offset="100%" stop-color="#2b3b33" />
            </linearGradient>
            <linearGradient id="kraft-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#d4be9a" />
              <stop offset="50%" stop-color="#bd9f75" />
              <stop offset="100%" stop-color="#967954" />
            </linearGradient>
          </defs>

          <!-- 1. Background -->
          <rect width="800" height="600" fill="url(#bg-grad)" />
          <ellipse cx="400" cy="300" rx="350" ry="250" fill="url(#spot-glow)" />

          <!-- 2. Vessel Back Layer -->
          ${getVesselPaths(true)}

          <!-- 3. Stems Arrangement -->
          ${stemsSVG}

          <!-- 4. Vessel Front Layer -->
          ${getVesselPaths(false)}

          <!-- 5. Signature Watermark -->
          <text x="780" y="580" fill="#faf7f2" font-family="'Cormorant Garamond', serif" font-size="14" font-weight="200" opacity="0.2" text-anchor="end" letter-spacing="2">
            L'Atelier de Fleurs
          </text>
        </svg>
      `;

      // Convert SVG code into a downloadable binary PNG
      const blob = new Blob([fullSVG], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const image = new Image();
      image.crossOrigin = 'anonymous';

      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 1600;
        canvas.height = 1200;
        const context = canvas.getContext('2d');
        if (context) {
          context.drawImage(image, 0, 0, 1600, 1200);
          canvas.toBlob((pngBlob) => {
            if (pngBlob) {
              const pngURL = URL.createObjectURL(pngBlob);
              const downloadLink = document.createElement('a');
              downloadLink.href = pngURL;
              downloadLink.download = 'latelier-bouquet.png';
              downloadLink.click();
              URL.revokeObjectURL(pngURL);
            }
            setExporting(false);
          }, 'image/png');
        }
      };

      image.src = url;
    } catch (err) {
      console.error(err);
      alert('Unable to generate PNG image. Downloading SVG blueprint instead.');
      setExporting(false);
    }
  };

  const handleCopyShareDetails = () => {
    const text = `
🌸 A Bespoke Bouquet from L'Atelier de Fleurs 🌸

I hand-sculpted a custom floral arrangement for you at the digital design studio!
Vessel: ${selectedVessel.name}
Ribbon: ${selectedWrapping.name}

${cardMessage.trim() ? `✍️ Calligraphy Note Card:\n"${cardMessage}"\nTo: ${cardTo || 'You'} · From: ${cardFrom || 'Me'}` : ''}

Create your own botanical masterpiece at: ${window.location.origin}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent("🌸 A Bespoke Floral Bouquet For You");
    const body = encodeURIComponent(`
Hi ${cardTo || 'there'},

I designed a custom botanical flower arrangement for you at L'Atelier de Fleurs!

💐 Bouquet Details:
• Vessel Base: ${selectedVessel.name}
• Ribbon Tie: ${selectedWrapping.name}

${cardMessage.trim() ? `✍️ Hand-written Calligraphy Note:\n"${cardMessage}"\n\n— Warmly, ${cardFrom || 'Me'}` : 'Hope this brings a smile to your face!'}

Sculpt your own custom arrangements here: ${window.location.origin}
    `.trim());

    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleSendToFriend = async () => {
    const text = `
🌸 A Bespoke Bouquet from L'Atelier de Fleurs 🌸

I hand-sculpted a custom floral arrangement for you at the digital design studio!
Vessel: ${selectedVessel.name}
Ribbon: ${selectedWrapping.name}

${cardMessage.trim() ? `✍️ Calligraphy Note Card:\n"${cardMessage}"\nTo: ${cardTo || 'You'} · From: ${cardFrom || 'Me'}` : ''}
    `.trim();

    const shareData = {
      title: "L'Atelier de Fleurs — Custom Bouquet",
      text: text,
      url: window.location.origin,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setShowShareModal(true);
        }
      }
    } else {
      setShowShareModal(true);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* 1. Share Core */}
      <div className="glass rounded-2xl p-6 border border-white/5 shadow-2xl flex flex-col gap-6 animate-fade-in">
        <div>
          <h3 className="font-serif text-2xl text-white font-medium tracking-wide">
            Save &amp; Share
          </h3>
          <p className="text-xs text-[#b8b1a5]/50 font-sans mt-0.5">
            Export your digital botanical sculpture or send it to friends
          </p>
        </div>

        {/* Arrangement composition counts */}
        <div className="flex flex-col gap-3 font-sans text-sm border-b border-white/5 pb-5">
          <div className="flex justify-between items-center text-xs uppercase tracking-widest text-[#b8b1a5]/30">
            <span>Composition Summary</span>
            <span>{stems.length} stems</span>
          </div>

          <div className="flex flex-col gap-2 pl-1 max-h-[150px] overflow-y-auto pr-1">
            <div className="flex justify-between text-xs text-[#b8b1a5]/80">
              <span>🏺 Vessel Housing:</span>
              <span className="text-[#c5a880] font-semibold">{selectedVessel.name}</span>
            </div>
            {selectedWrapping.id !== 'none' && (
              <div className="flex justify-between text-xs text-[#b8b1a5]/80">
                <span>🎀 Ribbon wrapping:</span>
                <span className="text-[#c5a880] font-semibold">{selectedWrapping.name}</span>
              </div>
            )}

            {stems.length > 0 ? (
              <div className="mt-2 pt-2 border-t border-white/5 flex flex-col gap-1.5">
                {Object.entries(stemGroups).map(([flowerId, count]) => {
                  const flower = FLOWER_TYPES.find(f => f.id === flowerId);
                  if (!flower) return null;
                  return (
                    <div key={flowerId} className="flex justify-between items-center text-xs">
                      <span className="text-[#b8b1a5]/70">• {flower.name}</span>
                      <span className="text-[#faf7f2] font-semibold">x{count}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <span className="text-xs italic text-[#b8b1a5]/30 text-center py-4 block">
                No stems placed yet
              </span>
            )}
          </div>
        </div>

        {/* Note Card Attached Warning/Summary */}
        {cardMessage.trim().length > 0 && (
          <div className="bg-black/35 border border-white/5 rounded-xl p-3.5 text-xs font-sans">
            <span className="text-[9px] uppercase tracking-widest text-[#c5a880] block font-bold mb-1">
              ✍️ Calligraphy Card Attached
            </span>
            <p className="italic text-[#faf7f2]/90 leading-relaxed truncate">
              "{cardMessage}"
            </p>
            <span className="text-[10px] text-[#b8b1a5]/50 block mt-1">
              To: {cardTo || '____'} · From: {cardFrom || '____'}
            </span>
          </div>
        )}

        {/* Primary Export Actions */}
        <div className="flex flex-col gap-3 pt-2">
          {/* Download Image Button */}
          <button
            onClick={handleExportPNG}
            disabled={stems.length === 0 || exporting}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#c5a880] to-[#dfba89] text-[#040405] font-sans font-semibold text-xs uppercase tracking-widest hover:brightness-110 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none transition-all duration-300 shadow-xl shadow-[#dfba89]/5 flex items-center justify-center gap-2 cursor-pointer"
          >
            {exporting ? (
              <>
                <span className="animate-spin text-sm">⌛</span>
                <span>Rendering High-Res PNG...</span>
              </>
            ) : (
              <>
                <span>🖼️</span>
                <span>Download Bouquet Image (PNG)</span>
              </>
            )}
          </button>

          {/* Send to Friend Action */}
          <button
            onClick={handleSendToFriend}
            disabled={stems.length === 0}
            className="w-full btn-lux btn-lux-secondary py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold cursor-pointer"
          >
            <span>✉️</span>
            <span>Send to Friend</span>
          </button>

          {/* Reset Atelier Button */}
          {stems.length > 0 && (
            <button
              onClick={() => {
                if (confirm('Clear everything and reset?')) {
                  onResetAtelier();
                }
              }}
              className="w-full btn-lux btn-lux-danger py-2.5 rounded-xl text-[10px] cursor-pointer"
            >
              Clear Atelier &amp; Reset
            </button>
          )}
        </div>
      </div>

      {/* Share Modal Dialog */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="glass max-w-sm w-full rounded-2xl p-6 border border-white/10 shadow-2xl relative">
            <button
              onClick={() => setShowShareModal(false)}
              className="absolute top-4 right-4 text-sm text-[#b8b1a5]/60 hover:text-white"
            >
              ✕
            </button>

            <h4 className="font-serif text-xl text-white font-semibold mb-2">
              Share Arrangement
            </h4>
            <p className="text-xs text-[#b8b1a5]/50 font-sans leading-relaxed mb-5">
              Send this botanical creation along with your calligraphy card notes.
            </p>

            <div className="flex flex-col gap-3 font-sans">
              {/* Trigger email client */}
              <button
                onClick={handleEmailShare}
                className="w-full btn-lux btn-lux-secondary py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold cursor-pointer"
              >
                📬 Send via Email
              </button>

              {/* Copy share card description */}
              <button
                onClick={handleCopyShareDetails}
                className="w-full btn-lux btn-lux-gold py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold cursor-pointer"
              >
                {copiedText ? '✓ Copied Details!' : '📋 Copy Invitation Card'}
              </button>

              <button
                onClick={() => setShowShareModal(false)}
                className="w-full py-2.5 mt-2 text-center text-xs text-[#b8b1a5]/40 hover:text-white cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default SharePlayground;
