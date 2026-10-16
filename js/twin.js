/**
 * ReVive — 2D Interactive Virtual Facility (Digital Twin)
 * CLEARLY LABELED AS SIMULATED TELEMETRY.
 * 
 * Demonstrates physical waste objects (bottle, juice carton, chips packet,
 * battery, smartphone, pizza box) riding directly ON the conveyor belt,
 * pausing at optical scanner, and physically falling into illustrated
 * sorting bins behind the bin's front wall.
 */

import { appState } from './state.js';
import { WASTE_DATABASE } from './database.js';

let lastSimulatedItem = null;

// Lightweight, recognizable SVG illustrations of actual waste objects (Enlarged 1.5-2x with distinct physical materials)
const WASTE_OBJECT_SVGS = {
  pet_water_bottle: `
    <svg viewBox="0 0 50 88" width="48" height="84" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="petBottleBodyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#bae6fd" stop-opacity="0.85"/>
          <stop offset="25%" stop-color="#e0f2fe" stop-opacity="0.95"/>
          <stop offset="60%" stop-color="#7dd3fc" stop-opacity="0.75"/>
          <stop offset="100%" stop-color="#38bdf8" stop-opacity="0.9"/>
        </linearGradient>
        <linearGradient id="petCapGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#0369a1"/>
          <stop offset="45%" stop-color="#0ea5e9"/>
          <stop offset="100%" stop-color="#0284c7"/>
        </linearGradient>
        <linearGradient id="petLabelGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#0284c7"/>
          <stop offset="50%" stop-color="#38bdf8"/>
          <stop offset="100%" stop-color="#0369a1"/>
        </linearGradient>
      </defs>
      <!-- Contact shadow on belt -->
      <ellipse cx="25" cy="85" rx="18" ry="2.5" fill="rgba(0,0,0,0.32)"/>
      <!-- Cap with grip threading -->
      <rect x="20" y="3" width="10" height="7" rx="1.5" fill="url(#petCapGrad)" stroke="#0369a1" stroke-width="0.8"/>
      <line x1="22" y1="5" x2="22" y2="8" stroke="#bae6fd" stroke-width="0.8"/>
      <line x1="25" y1="5" x2="25" y2="8" stroke="#bae6fd" stroke-width="0.8"/>
      <line x1="28" y1="5" x2="28" y2="8" stroke="#bae6fd" stroke-width="0.8"/>
      <!-- Safety seal collar ring -->
      <rect x="19.5" y="10.5" width="11" height="2" rx="0.8" fill="#0284c7"/>
      <!-- Transparent Bottle Body -->
      <path d="M21 12.5 L21 18 L14 26 L14 78 Q14 84 25 84 Q36 84 36 78 L36 26 L29 18 L29 12.5 Z" fill="url(#petBottleBodyGrad)" stroke="#0284c7" stroke-width="1.2"/>
      <!-- Ribbed Grip Rings -->
      <path d="M14.5 34 Q25 36 35.5 34" stroke="#0284c7" stroke-width="0.9" fill="none" opacity="0.6"/>
      <path d="M14.5 44 Q25 46 35.5 44" stroke="#0284c7" stroke-width="0.9" fill="none" opacity="0.6"/>
      <path d="M14.5 56 Q25 58 35.5 56" stroke="#0284c7" stroke-width="0.9" fill="none" opacity="0.6"/>
      <path d="M14.5 66 Q25 68 35.5 66" stroke="#0284c7" stroke-width="0.9" fill="none" opacity="0.6"/>
      <!-- Branded Paper Label Wrapper -->
      <rect x="14" y="45" width="22" height="15" fill="url(#petLabelGrad)" stroke="#0369a1" stroke-width="0.8"/>
      <rect x="16" y="47" width="18" height="11" rx="1" fill="white" opacity="0.92"/>
      <text x="25" y="53" font-size="4" font-weight="900" fill="#0369a1" text-anchor="middle" font-family="sans-serif">PET 1</text>
      <text x="25" y="57" font-size="2.6" font-weight="bold" fill="#0284c7" text-anchor="middle" font-family="sans-serif">PURE WATER</text>
      <!-- Vertical Specular Glare Highlights -->
      <path d="M17 22 L17 78" stroke="white" stroke-width="2" stroke-linecap="round" opacity="0.85"/>
      <path d="M20 25 L20 40" stroke="white" stroke-width="1" stroke-linecap="round" opacity="0.6"/>
    </svg>
  `,
  tetra_pak_carton: `
    <svg viewBox="0 0 54 88" width="50" height="84" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="cartonFrontGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="60%" stop-color="#f8fafc"/>
          <stop offset="100%" stop-color="#e2e8f0"/>
        </linearGradient>
        <linearGradient id="cartonRoofGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#e2e8f0"/>
          <stop offset="100%" stop-color="#cbd5e1"/>
        </linearGradient>
        <linearGradient id="juiceOrangeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ea580c"/>
          <stop offset="60%" stop-color="#f97316"/>
          <stop offset="100%" stop-color="#fbbf24"/>
        </linearGradient>
      </defs>
      <!-- Contact shadow on belt -->
      <ellipse cx="27" cy="85" rx="21" ry="2.5" fill="rgba(0,0,0,0.32)"/>
      <!-- Folded Gable Top / Slanted Rooftop -->
      <polygon points="12,24 20,8 34,8 42,24" fill="url(#cartonRoofGrad)" stroke="#94a3b8" stroke-width="1.2"/>
      <!-- Top Seal Lip / Fin -->
      <rect x="20" y="5" width="14" height="3.5" rx="0.8" fill="#cbd5e1" stroke="#94a3b8" stroke-width="0.8"/>
      <!-- Spout / Plastic Screw Cap on top slope -->
      <ellipse cx="27" cy="14" rx="4.5" ry="2.5" fill="#dc2626" stroke="#991b1b" stroke-width="0.9"/>
      <ellipse cx="27" cy="13" rx="3" ry="1.5" fill="#ef4444"/>
      <!-- Main Rectangular Carton Body -->
      <rect x="12" y="24" width="30" height="60" rx="2" fill="url(#cartonFrontGrad)" stroke="#94a3b8" stroke-width="1.2"/>
      <!-- Bright Orange Fruit Splash Brand Banner -->
      <rect x="14" y="32" width="26" height="34" rx="2" fill="url(#juiceOrangeGrad)"/>
      <!-- Stylized Orange Citrus Slice -->
      <circle cx="27" cy="48" r="9" fill="#fef08a" stroke="#ea580c" stroke-width="1"/>
      <circle cx="27" cy="48" r="7.5" fill="#f97316"/>
      <!-- Citrus Segments -->
      <path d="M27 48 L27 41 M27 48 L33 44 M27 48 L33 52 M27 48 L27 55 M27 48 L21 52 M27 48 L21 44" stroke="#fef08a" stroke-width="0.9"/>
      <!-- Branding Typography -->
      <text x="27" y="38" font-size="4" font-weight="900" fill="white" text-anchor="middle" font-family="sans-serif" letter-spacing="0.5">ORANGE</text>
      <text x="27" y="63" font-size="3" font-weight="bold" fill="#7c2d12" text-anchor="middle" font-family="sans-serif">100% JUICE</text>
      <!-- Attached Drinking Straw with bend -->
      <line x1="36" y1="18" x2="41" y2="4" stroke="#fbbf24" stroke-width="2.2" stroke-linecap="round"/>
      <line x1="41" y1="4" x2="44" y2="7" stroke="#f59e0b" stroke-width="2.2" stroke-linecap="round"/>
      <!-- Edge Depth Highlight -->
      <line x1="14" y1="25" x2="14" y2="83" stroke="white" stroke-width="1.2" opacity="0.8"/>
      <text x="27" y="78" font-size="3.2" font-weight="bold" fill="#64748b" text-anchor="middle" font-family="sans-serif">Tetra Pak</text>
    </svg>
  `,
  chip_packet_mlp: `
    <svg viewBox="0 0 58 88" width="52" height="84" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="chipsMetallicGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#b91c1c"/>
          <stop offset="35%" stop-color="#ea580c"/>
          <stop offset="70%" stop-color="#f59e0b"/>
          <stop offset="100%" stop-color="#d97706"/>
        </linearGradient>
        <linearGradient id="crimpGold" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#78350f"/>
          <stop offset="30%" stop-color="#fbbf24"/>
          <stop offset="70%" stop-color="#b45309"/>
          <stop offset="100%" stop-color="#78350f"/>
        </linearGradient>
      </defs>
      <!-- Contact shadow on belt -->
      <ellipse cx="29" cy="85" rx="22" ry="2.5" fill="rgba(0,0,0,0.35)"/>
      <!-- Top Serrated Crimp Seal -->
      <path d="M10 14 L12 8 L14 14 L16 8 L18 14 L20 8 L22 14 L24 8 L26 14 L28 8 L30 14 L32 8 L34 14 L36 8 L38 14 L40 8 L42 14 L44 8 L46 14 L48 8 L48 16 L10 16 Z" fill="url(#crimpGold)" stroke="#78350f" stroke-width="0.8"/>
      <!-- Puffed Metallic Pillow Bag Body -->
      <path d="M10 16 C6 35 6 62 10 78 L48 78 C52 62 52 35 48 16 Z" fill="url(#chipsMetallicGrad)" stroke="#9a3412" stroke-width="1.2"/>
      <!-- Bottom Serrated Crimp Seal -->
      <path d="M10 78 L12 84 L14 78 L16 84 L18 78 L20 84 L22 78 L24 84 L26 78 L28 84 L30 78 L32 84 L34 78 L36 84 L38 78 L40 84 L42 78 L44 84 L46 78 L48 84 L48 76 L10 76 Z" fill="url(#crimpGold)" stroke="#78350f" stroke-width="0.8"/>
      <!-- Shiny Diagonal Foil Sheen & Crinkles -->
      <path d="M14 22 Q28 42 44 70" stroke="rgba(255,255,255,0.7)" stroke-width="3" stroke-linecap="round"/>
      <path d="M18 20 Q12 40 18 64" stroke="rgba(255,255,255,0.4)" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M38 28 Q44 48 38 72" stroke="rgba(0,0,0,0.25)" stroke-width="1.5" stroke-linecap="round"/>
      <!-- Snack Branding -->
      <ellipse cx="29" cy="42" rx="16" ry="12" fill="#7f1d1d" opacity="0.6"/>
      <text x="29" y="44" font-size="8.5" font-weight="900" fill="#fef08a" text-anchor="middle" font-family="Impact, Arial Black, sans-serif" letter-spacing="1">CHIPS</text>
      <text x="29" y="52" font-size="3.5" font-weight="bold" fill="#ffffff" text-anchor="middle" font-family="sans-serif">CRISPY POTATO</text>
      <!-- Stylized Potato Crisps Graphic -->
      <ellipse cx="24" cy="62" rx="5" ry="3.5" fill="#fef08a" stroke="#ca8a04" stroke-width="0.8" transform="rotate(-15 24 62)"/>
      <ellipse cx="32" cy="64" rx="5.5" ry="3.8" fill="#fde047" stroke="#ca8a04" stroke-width="0.8" transform="rotate(18 32 64)"/>
      <text x="29" y="74" font-size="2.6" font-weight="bold" fill="#fee2e2" text-anchor="middle" font-family="sans-serif">MULTI-LAYER FOIL</text>
    </svg>
  `,
  household_battery: `
    <svg viewBox="0 0 44 86" width="38" height="80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="batteryCopperGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#78350f"/>
          <stop offset="25%" stop-color="#d97706"/>
          <stop offset="50%" stop-color="#fbbf24"/>
          <stop offset="80%" stop-color="#b45309"/>
          <stop offset="100%" stop-color="#78350f"/>
        </linearGradient>
        <linearGradient id="batteryBlackGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#09090b"/>
          <stop offset="40%" stop-color="#27272a"/>
          <stop offset="70%" stop-color="#3f3f46"/>
          <stop offset="100%" stop-color="#18181b"/>
        </linearGradient>
        <linearGradient id="terminalMetal" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#71717a"/>
          <stop offset="50%" stop-color="#f4f4f5"/>
          <stop offset="100%" stop-color="#a1a1aa"/>
        </linearGradient>
      </defs>
      <!-- Contact shadow on belt -->
      <ellipse cx="22" cy="83" rx="16" ry="2.5" fill="rgba(0,0,0,0.38)"/>
      <!-- Positive (+) Terminal Nub -->
      <rect x="18" y="3" width="8" height="5" rx="1.5" fill="url(#terminalMetal)" stroke="#52525b" stroke-width="0.8"/>
      <rect x="19" y="3.5" width="2" height="4" fill="white" opacity="0.7"/>
      <!-- Upper Copper Section -->
      <path d="M11 8 L33 8 Q34 8 34 11 L34 28 L10 28 L10 11 Q10 8 11 8 Z" fill="url(#batteryCopperGrad)" stroke="#78350f" stroke-width="1"/>
      <!-- Polarity (+) Marker -->
      <text x="22" y="21" font-size="9" font-weight="900" fill="#fef3c7" text-anchor="middle" font-family="sans-serif">+</text>
      <!-- Lower Charcoal Battery Body -->
      <rect x="10" y="28" width="24" height="48" fill="url(#batteryBlackGrad)" stroke="#09090b" stroke-width="1"/>
      <!-- Negative (-) Base Terminal Ring -->
      <rect x="10" y="76" width="24" height="4" rx="0.5" fill="url(#terminalMetal)" stroke="#52525b" stroke-width="0.8"/>
      <text x="22" y="79" font-size="4" font-weight="900" fill="#27272a" text-anchor="middle" font-family="sans-serif">-</text>
      <!-- Battery Label Text & Specs -->
      <text x="22" y="44" font-size="6" font-weight="900" fill="#f4f4f5" text-anchor="middle" font-family="sans-serif" letter-spacing="0.5">AA</text>
      <text x="22" y="52" font-size="3.5" font-weight="bold" fill="#f59e0b" text-anchor="middle" font-family="sans-serif">ALKALINE</text>
      <text x="22" y="59" font-size="3.2" fill="#a1a1aa" text-anchor="middle" font-family="sans-serif">1.5V CELL</text>
      <!-- Warning crossed-out bin / hazard icon -->
      <rect x="18" y="63" width="8" height="7" rx="1" fill="#dc2626" opacity="0.9"/>
      <text x="22" y="68.5" font-size="4.5" font-weight="bold" fill="white" text-anchor="middle">⚠️</text>
      <!-- Specular Reflection Highlight down the cylinder -->
      <rect x="13" y="8" width="3" height="68" fill="white" opacity="0.25" rx="1"/>
    </svg>
  `,
  smartphone_ewaste: `
    <svg viewBox="0 0 46 88" width="42" height="84" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="phoneFrameGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#475569"/>
          <stop offset="50%" stop-color="#1e293b"/>
          <stop offset="100%" stop-color="#334155"/>
        </linearGradient>
        <linearGradient id="screenGlassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#090d16"/>
          <stop offset="100%" stop-color="#020617"/>
        </linearGradient>
        <linearGradient id="screenGlareGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="rgba(255,255,255,0.45)"/>
          <stop offset="40%" stop-color="rgba(255,255,255,0.08)"/>
          <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
        </linearGradient>
      </defs>
      <!-- Contact shadow on belt -->
      <ellipse cx="23" cy="85" rx="18" ry="2.5" fill="rgba(0,0,0,0.38)"/>
      <!-- Metallic Outer Chassis / Bumper -->
      <rect x="7" y="6" width="32" height="76" rx="6.5" fill="url(#phoneFrameGrad)" stroke="#64748b" stroke-width="1.2"/>
      <!-- Front OLED Screen Glass -->
      <rect x="9" y="8" width="28" height="72" rx="4.5" fill="url(#screenGlassGrad)"/>
      <!-- Top Dynamic Island / Speaker Ear Piece & Camera Punch Hole -->
      <rect x="17.5" y="10" width="11" height="3" rx="1.5" fill="#000000"/>
      <circle cx="26" cy="11.5" r="0.9" fill="#1e293b"/>
      <!-- Sleek Diagonal Screen Glare Reflection -->
      <path d="M10 12 L35 60 L35 40 L16 10 Z" fill="url(#screenGlareGrad)"/>
      <!-- Screen UI Displays: Digital Clock & Widget -->
      <text x="23" y="26" font-size="5" font-weight="bold" fill="#e2e8f0" text-anchor="middle" font-family="sans-serif">12:00</text>
      <text x="23" y="31" font-size="2.4" fill="#94a3b8" text-anchor="middle" font-family="sans-serif">Wed, Oct 16</text>
      <!-- App Icons Grid Mockup -->
      <rect x="12" y="38" width="4.5" height="4.5" rx="1.2" fill="#38bdf8"/>
      <rect x="18" y="38" width="4.5" height="4.5" rx="1.2" fill="#4ade80"/>
      <rect x="24" y="38" width="4.5" height="4.5" rx="1.2" fill="#f59e0b"/>
      <rect x="30" y="38" width="4.5" height="4.5" rx="1.2" fill="#a855f7"/>
      <!-- E-Waste Route Badge on Screen -->
      <rect x="12" y="58" width="22" height="12" rx="2" fill="#581c87" stroke="#7e22ce" stroke-width="0.8"/>
      <text x="23" y="64" font-size="3" font-weight="bold" fill="#f3e8ff" text-anchor="middle" font-family="sans-serif">E-WASTE</text>
      <text x="23" y="68" font-size="2.2" fill="#c084fc" text-anchor="middle" font-family="sans-serif">AUTHORIZED RECYCLING</text>
      <!-- Home Indicator Bar -->
      <rect x="17" y="75" width="12" height="1.2" rx="0.6" fill="#64748b"/>
    </svg>
  `,
  greasy_pizza_box: `
    <svg viewBox="0 0 76 58" width="72" height="54" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="pizzaTopLidGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#d97706"/>
          <stop offset="60%" stop-color="#b45309"/>
          <stop offset="100%" stop-color="#92400e"/>
        </linearGradient>
        <linearGradient id="pizzaFrontFlapGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#b45309"/>
          <stop offset="100%" stop-color="#78350f"/>
        </linearGradient>
        <radialGradient id="greaseStainGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#451a03" stop-opacity="0.85"/>
          <stop offset="65%" stop-color="#78350f" stop-opacity="0.65"/>
          <stop offset="100%" stop-color="#92400e" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <!-- Wide Contact shadow on belt -->
      <ellipse cx="38" cy="54" rx="32" ry="3" fill="rgba(0,0,0,0.35)"/>
      <!-- 3D Isometric Flat Cardboard Pizza Box -->
      <!-- Top Lid -->
      <polygon points="8,26 38,10 68,26 38,40" fill="url(#pizzaTopLidGrad)" stroke="#78350f" stroke-width="1.4"/>
      <!-- Left Side Thickness Edge -->
      <polygon points="8,26 8,36 38,50 38,40" fill="#92400e" stroke="#78350f" stroke-width="1.2"/>
      <!-- Right Front Flap Thickness Edge -->
      <polygon points="68,26 68,36 38,50 38,40" fill="url(#pizzaFrontFlapGrad)" stroke="#78350f" stroke-width="1.2"/>
      <!-- Front Opening Tab Notch -->
      <path d="M35 40 Q38 43 41 40" stroke="#fef3c7" stroke-width="1.5" fill="none"/>
      <!-- Printed Lid Graphic: Fresh Pizza Emblem -->
      <polygon points="32,20 44,20 38,32" fill="#ef4444" stroke="#b91c1c" stroke-width="0.8"/>
      <circle cx="36.5" cy="23.5" r="1.2" fill="#fbbf24"/>
      <circle cx="39.5" cy="26" r="1.1" fill="#fbbf24"/>
      <circle cx="38" cy="22" r="0.9" fill="#7f1d1d"/>
      <text x="38" y="18" font-size="3.5" font-weight="900" fill="#fef3c7" text-anchor="middle" font-family="sans-serif">HOT PIZZA</text>
      <!-- SOAKED OIL / GREASE CONTAMINATION STAIN -->
      <ellipse cx="50" cy="27" rx="11" ry="6" fill="url(#greaseStainGrad)"/>
      <ellipse cx="48" cy="28" rx="6" ry="3.5" fill="#451a03" opacity="0.75"/>
      <ellipse cx="26" cy="30" rx="7" ry="4" fill="url(#greaseStainGrad)"/>
      <text x="38" y="47" font-size="2.6" font-weight="bold" fill="#fef08a" text-anchor="middle" font-family="sans-serif">GREASY CARDBOARD</text>
    </svg>
  `
};

function getWasteItemSvg(item) {
  if (item && item.id && WASTE_OBJECT_SVGS[item.id]) {
    return WASTE_OBJECT_SVGS[item.id];
  }
  // Generic packaging parcel fallback (Enlarged)
  return `
    <svg viewBox="0 0 54 86" width="50" height="80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="boxCardboardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#d97706"/>
          <stop offset="100%" stop-color="#b45309"/>
        </linearGradient>
      </defs>
      <ellipse cx="27" cy="83" rx="20" ry="2.5" fill="rgba(0,0,0,0.32)" />
      <rect x="10" y="20" width="34" height="60" rx="3" fill="url(#boxCardboardGrad)" stroke="#78350f" stroke-width="1.5"/>
      <line x1="10" y1="46" x2="44" y2="46" stroke="#92400e" stroke-width="2.5"/>
      <line x1="27" y1="20" x2="27" y2="80" stroke="#92400e" stroke-width="2.5"/>
      <text x="27" y="42" font-size="16" text-anchor="middle">${item && item.emoji ? item.emoji : '📦'}</text>
    </svg>
  `;
}

function getBeltSurfaceY() {
  const stage = document.getElementById('twin-facility-stage');
  const belt = document.getElementById('conveyor-belt');
  if (stage && belt && typeof belt.getBoundingClientRect === 'function') {
    const sRect = stage.getBoundingClientRect();
    const bRect = belt.getBoundingClientRect();
    if (sRect && bRect && typeof bRect.top === 'number' && typeof sRect.top === 'number' && bRect.height > 0) {
      const computedY = Math.round(bRect.top - sRect.top);
      if (computedY > 0) return computedY;
    }
  }
  return 88;
}

const BIN_VISUALS = {
  dry_recyclables: {
    title: "Blue Bin",
    subtitle: "Clean Dry Recyclables",
    lidColor: "#1d4ed8",
    collarColor: "#1e40af",
    bodyBg: "linear-gradient(180deg, #dbeafe 0%, #bfdbfe 100%)",
    fillGradient: "linear-gradient(180deg, #60a5fa 0%, #2563eb 100%)",
    accentColor: "#2563eb",
    icon: "♻️",
    chuteLabel: "Blue Chute"
  },
  wet_organics: {
    title: "Green Bin",
    subtitle: "Wet Organic Compost",
    lidColor: "#15803d",
    collarColor: "#166534",
    bodyBg: "linear-gradient(180deg, #dcfce7 0%, #bbf7d0 100%)",
    fillGradient: "linear-gradient(180deg, #4ade80 0%, #16a34a 100%)",
    accentColor: "#16a34a",
    icon: "🌱",
    chuteLabel: "Green Chute"
  },
  hazardous_sanitary: {
    title: "Red Bin / Vault",
    subtitle: "Domestic Hazardous Waste",
    lidColor: "#b91c1c",
    collarColor: "#991b1b",
    bodyBg: "linear-gradient(180deg, #fee2e2 0%, #fecaca 100%)",
    fillGradient: "linear-gradient(180deg, #f87171 0%, #dc2626 100%)",
    accentColor: "#dc2626",
    icon: "⚠️",
    chuteLabel: "Hazard Chute"
  },
  landfill_rdf: {
    title: "Grey Bin",
    subtitle: "Landfill / Cement RDF",
    lidColor: "#334155",
    collarColor: "#1e293b",
    bodyBg: "linear-gradient(180deg, #f1f5f9 0%, #e2e8f0 100%)",
    fillGradient: "linear-gradient(180deg, #94a3b8 0%, #475569 100%)",
    accentColor: "#475569",
    icon: "🏭",
    chuteLabel: "RDF Chute"
  },
  separate_ewaste: {
    title: "E-Waste Vault",
    subtitle: "Authorized E-Waste Route",
    lidColor: "#6d28d9",
    collarColor: "#5b21b6",
    bodyBg: "linear-gradient(180deg, #f3e8ff 0%, #e9d5ff 100%)",
    fillGradient: "linear-gradient(180deg, #a855f7 0%, #7c3aed 100%)",
    accentColor: "#7c3aed",
    icon: "🔌",
    chuteLabel: "E-Waste Chute"
  }
};

export function initDigitalTwin() {
  renderTwinContainer();
  setupTwinEventListeners();
}

function renderTwinContainer() {
  const container = document.getElementById('digital-twin-container');
  if (!container) return;

  const state = appState.getState();
  const bins = state.bins;

  container.innerHTML = `
    <div class="dreamy-card p-5 sm:p-7 md:p-8">
      
      <!-- Section Header with Explicit SIMULATED Badge -->
      <div class="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200/60">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
              <span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              [SIMULATED 2D FACILITY PREVIEW]
            </span>
            <span class="text-xs text-slate-500 font-medium">Virtual Material Recovery Demonstration</span>
          </div>
          <h2 class="text-2xl sm:text-3xl font-bold text-forest-950 font-editorial-serif tracking-tight">
            Watch Waste Get Sorted
          </h2>
          <p class="text-xs text-forest-700 mt-0.5">
            Follow items through optical identification, pneumatic diversion, and physical drop into assigned destination bins.
          </p>
        </div>

        <!-- Infeed Controls & Replay Toolbar -->
        <div class="flex items-center gap-2 flex-wrap">
          <span class="text-xs font-bold text-forest-900 hidden sm:inline">Try Infeed:</span>
          <div class="flex flex-wrap gap-1.5" id="twin-spawner-buttons">
            <!-- Dynamically populated buttons -->
          </div>
          <button 
            id="btn-twin-replay-top"
            class="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5"
            title="Replay the sorting demonstration for the current item"
          >
            <span>🔁</span>
            <span>Replay Demo</span>
          </button>
        </div>
      </div>

      <!-- 3-Stage Visual Pipeline Stepper: "Waste Enters" → "Item Identified" → "Sorted into Bin" -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6" id="twin-stage-stepper">
        
        <!-- Stage 1 -->
        <div id="twin-step-1" class="p-3 sm:p-4 rounded-2xl border-2 transition-all duration-300 flex items-center gap-3.5 bg-emerald-50/90 border-emerald-500 shadow-md ring-2 ring-emerald-300/50">
          <div id="step-icon-1" class="w-9 h-9 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow-sm flex-shrink-0">
            1
          </div>
          <div>
            <div class="text-[10px] uppercase font-bold tracking-wider text-emerald-800">Stage 1</div>
            <div class="text-xs sm:text-sm font-bold text-forest-950 font-editorial-serif">Waste Enters</div>
            <div class="text-[10px] text-slate-500">Item placed onto conveyor infeed belt</div>
          </div>
        </div>

        <!-- Stage 2 -->
        <div id="twin-step-2" class="p-3 sm:p-4 rounded-2xl border-2 transition-all duration-300 flex items-center gap-3.5 bg-white/70 border-slate-200">
          <div id="step-icon-2" class="w-9 h-9 rounded-xl bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-sm shadow-sm flex-shrink-0">
            2
          </div>
          <div>
            <div class="text-[10px] uppercase font-bold tracking-wider text-slate-500">Stage 2</div>
            <div class="text-xs sm:text-sm font-bold text-forest-950 font-editorial-serif">Item Identified</div>
            <div class="text-[10px] text-slate-500">Camera & optical eye inspect materials</div>
          </div>
        </div>

        <!-- Stage 3 -->
        <div id="twin-step-3" class="p-3 sm:p-4 rounded-2xl border-2 transition-all duration-300 flex items-center gap-3.5 bg-white/70 border-slate-200">
          <div id="step-icon-3" class="w-9 h-9 rounded-xl bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-sm shadow-sm flex-shrink-0">
            3
          </div>
          <div>
            <div class="text-[10px] uppercase font-bold tracking-wider text-slate-500">Stage 3</div>
            <div class="text-xs sm:text-sm font-bold text-forest-950 font-editorial-serif">Sorted into Bin</div>
            <div class="text-[10px] text-slate-500">Pneumatic arm drops item directly into city bin</div>
          </div>
        </div>

      </div>

      <!-- Contamination Alert Banner -->
      <div id="twin-contamination-banner" class="hidden mb-6 p-3.5 rounded-2xl bg-amber-50 border-2 border-amber-400 text-amber-950 text-xs font-semibold flex items-center gap-2.5">
        <span class="text-xl">🚨</span>
        <span id="twin-contamination-text">Notice: Material inspection active on conveyor belt!</span>
      </div>

      <!-- ===================================================================
           2D CONVEYOR BELT & ILLUSTRATED BINS STAGE (INTEGRATED SINGLE STAGE)
           The bins sit directly beneath the Stage 3 end of the conveyor!
           =================================================================== -->
      <div id="twin-facility-stage" class="relative bg-gradient-to-b from-slate-100 via-slate-100/90 to-slate-200/90 rounded-3xl p-4 sm:p-6 border border-slate-300 shadow-inner overflow-hidden min-h-[580px] flex flex-col justify-between">
        
        <!-- Directional Movement Arrows Banner & Separate Conveyor Status Readout -->
        <div class="flex items-center justify-between mb-2 px-4 py-2 rounded-2xl bg-white/90 border border-slate-200/80 shadow-sm text-xs font-bold text-forest-900 z-10">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Belt Movement Direction:</span>
          </div>
          <div class="flex items-center gap-2.5 sm:gap-4 text-emerald-800 font-bold flow-arrow-pulse tracking-wide text-xs">
            <span>Infeed (Left)</span>
            <span>➔➔➔</span>
            <span>Optical Scanner (Center)</span>
            <span>➔➔➔</span>
            <span>Stage 3 Sorting Diverter (Right)</span>
          </div>
          
          <!-- Separate Small Status Panel: Carried Object Name & Speed -->
          <div id="conveyor-active-badge" class="flex items-center gap-2 px-3 py-1 rounded-xl bg-forest-950 text-white text-[11px] shadow-sm border border-forest-800">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span id="conveyor-active-name" class="font-bold text-emerald-300"><span id="twin-item-name">Conveyor Standby</span></span>
            <span class="text-slate-400 font-mono text-[10px]">1.2 m/s [SIM]</span>
          </div>
        </div>

        <!-- Overhead Optical Sensor Gantry Station -->
        <div class="absolute left-1/2 top-4 sm:top-5 -translate-x-1/2 z-30 flex flex-col items-center pointer-events-none">
          <div class="px-4 py-1.5 rounded-full bg-forest-950 text-xs font-bold text-emerald-300 shadow-xl flex items-center gap-2 border border-forest-800">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-400" id="sensor-gantry-led"></span>
            <span>Optical Eye & AI Material Scanner</span>
          </div>
          <!-- Vertical Scanning Laser Line -->
          <div id="twin-laser-beam" class="w-1.5 h-36 bg-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.95)] opacity-0 transition-opacity duration-300 laser-sweep"></div>
        </div>

        <!-- Floating Optical Scanner HUD Popup (Separate Small Status Panel at Stage 2) -->
        <div id="twin-optical-hud" class="hidden absolute left-1/2 top-2 -translate-x-1/2 z-40 p-3.5 rounded-2xl bg-white/95 backdrop-blur-md border-2 border-emerald-500 shadow-2xl scanner-hud-popup text-forest-950 w-72 sm:w-80 pointer-events-none">
          <div class="flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5 mb-2">
            <div class="flex items-center gap-2 text-xs font-bold">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span id="hud-item-name">Clear Plastic Bottle</span>
            </div>
            <span class="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">[AI IDENTIFIED]</span>
          </div>
          <div class="space-y-1 text-[11px]">
            <div class="flex items-center justify-between text-slate-600">
              <span>Estimated Material:</span>
              <span id="hud-material" class="font-bold text-forest-950 text-right">PET Polymer (Grade 1)</span>
            </div>
            <div class="flex items-center justify-between text-slate-600">
              <span>Assigned Stream:</span>
              <span id="hud-destination" class="font-bold text-blue-700 text-right">Blue Bin (Dry Recyclables)</span>
            </div>
            <div class="flex items-center justify-between text-slate-600">
              <span>Surface Check:</span>
              <span id="hud-contamination" class="font-bold text-emerald-700 text-right">Visual Surface Clean</span>
            </div>
          </div>
        </div>

        <!-- The Conveyor Belt Assembly (Upper Half) -->
        <div id="twin-conveyor-track" class="relative mt-20 sm:mt-24 mb-4 z-10">
          
          <!-- Left Roller Assembly (Infeed) -->
          <div class="absolute -left-3 top-1/2 -translate-y-1/2 z-20 w-12 h-16 bg-slate-800 rounded-2xl border-2 border-slate-900 shadow-xl flex items-center justify-center">
            <div class="w-8 h-8 rounded-full border-2 border-slate-400 bg-slate-700 flex items-center justify-center conveyor-roller">
              <div class="w-1.5 h-5 bg-slate-400 rounded-full"></div>
            </div>
          </div>

          <!-- Realistic Conveyor Belt Surface -->
          <div class="mx-6 relative">
            <!-- Upper Steel Guide Rail -->
            <div class="w-full h-2 bg-gradient-to-r from-slate-500 via-slate-200 to-slate-500 rounded-t-lg shadow-sm"></div>

            <!-- Animated Rubber Belt -->
            <div id="conveyor-belt" class="conveyor-belt-realistic w-full h-16 shadow-inner relative flex items-center overflow-visible border-y-2 border-slate-900">
              
              <!-- Directional Chevrons on Belt Surface -->
              <div class="w-full flex items-center justify-around opacity-30 select-none pointer-events-none text-white font-mono font-bold text-xs">
                <span>›››</span>
                <span>›››</span>
                <span>›››</span>
                <span>›››</span>
                <span>›››</span>
                <span>›››</span>
              </div>

            </div>

            <!-- Lower Steel Guide Rail -->
            <div class="w-full h-2 bg-gradient-to-r from-slate-500 via-slate-300 to-slate-500 rounded-b-lg shadow-sm"></div>
          </div>

          <!-- Right Roller Assembly & Diverter Arm (Sorter Chute) -->
          <div class="absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-12 h-16 bg-slate-800 rounded-2xl border-2 border-slate-900 shadow-xl flex items-center justify-center">
            <div class="w-8 h-8 rounded-full border-2 border-slate-400 bg-slate-700 flex items-center justify-center conveyor-roller">
              <div class="w-1.5 h-5 bg-slate-400 rounded-full"></div>
            </div>
            
            <!-- Diverter Paddle Arm -->
            <div id="twin-diverter-arm" class="absolute -left-2 top-0 w-3 h-14 bg-amber-400 border border-slate-900 rounded-full diverter-paddle shadow-md"></div>
            
            <!-- Pneumatic Air-Jet Puff Badge -->
            <div id="twin-air-jet-puff" class="hidden absolute -left-12 top-1 z-30 px-2 py-0.5 rounded-full bg-cyan-400 text-slate-950 font-bold text-[10px] shadow-lg air-jet-blast-anim whitespace-nowrap">
              💨 Air Blast!
            </div>
          </div>

        </div>

        <!-- ===================================================================
             RECOGNIZABLE PHYSICAL WASTE OBJECT (RIDES DIRECTLY ON THE BELT)
             Pure illustrated SVG object with contact shadow — NO floating text card!
             =================================================================== -->
        <div 
          id="twin-moving-item" 
          class="waste-object-carrier opacity-0 pointer-events-none"
          style="top: 88px; left: 4%; transform: translate(0, -100%);"
        >
          <div id="twin-waste-svg-holder">
            <!-- Dynamic SVG illustration injected here -->
          </div>
        </div>

        <!-- ===================================================================
             ACTUAL ILLUSTRATED SORTING BINS (DIRECTLY BENEATH STAGE 3 CONVEYOR)
             Connected by transparent sorting chutes leading straight into bins!
             =================================================================== -->
        <div class="relative mt-3 pt-3 border-t border-slate-200/70">
          
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold uppercase tracking-wider text-forest-900">
                Sorting Chutes & Destination Bins <span class="font-normal text-slate-400">[SIMULATED]</span>
              </span>
            </div>
            <div class="text-[11px] text-slate-500 flex items-center gap-1.5 font-medium">
              <span>Items physically fall into assigned bin below</span>
              <span>↓↓↓</span>
            </div>
          </div>

          <!-- 5 Illustrated 2D Sorting Bins Grid directly beneath conveyor chutes -->
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3" id="twin-bins-container">
            <!-- Rendered dynamically by renderTwinBins -->
          </div>
        </div>

        <!-- Live Sensor Status readout console -->
        <div class="mt-4 p-3 rounded-2xl bg-forest-950 text-emerald-300 font-mono text-xs flex flex-wrap items-center justify-between gap-3 shadow-inner border border-forest-900 z-10">
          <div class="flex items-center gap-2.5">
            <span class="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span id="twin-sensor-screen">FACILITY SCANNER: Ready for item infeed. Dispatch packaging or select an item above.</span>
          </div>
          <div class="text-[10px] text-emerald-400/70 font-sans">
            [SIMULATED TELEMETRY]
          </div>
        </div>

      </div>

      <!-- Post-Sorting Simple Explanation Banner with Instant Replay CTA -->
      <div id="twin-sorting-explanation" class="hidden my-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-100 via-teal-50 to-emerald-100 border-2 border-emerald-400 text-emerald-950 shadow-md transition-all duration-300">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="flex items-center gap-3.5">
            <div class="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-2xl shadow-sm flex-shrink-0">
              ✨
            </div>
            <div>
              <div class="text-[10px] uppercase font-extrabold tracking-wider text-emerald-800">
                Sorting Complete • Item Deposited into Bin [SIMULATED]
              </div>
              <h4 id="twin-explanation-text" class="text-base sm:text-lg font-bold text-forest-950 font-editorial-serif leading-tight">
                Plastic Bottle ➔ Blue Bin (Dry Waste)
              </h4>
              <p id="twin-explanation-subtext" class="text-xs text-emerald-900 mt-0.5 font-medium">
                Clean dry recyclables separated for municipal recycling and DWCC collection.
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2 self-end sm:self-center">
            <button 
              id="btn-replay-sorting"
              class="px-3.5 py-2 rounded-xl text-xs font-bold bg-white hover:bg-emerald-50 text-forest-900 border border-emerald-300 shadow-sm transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5"
            >
              <span>🔁</span>
              <span>Replay This Item</span>
            </button>
          </div>
        </div>
      </div>

    </div>
  `;

  renderTwinBins(bins);
  setupSpawnerButtons();
  setupReplayControls();
}

function renderTwinBins(bins) {
  const container = document.getElementById('twin-bins-container');
  if (!container) return;

  const binKeys = Object.keys(bins);
  container.innerHTML = binKeys.map(key => {
    const bin = bins[key];
    const visual = BIN_VISUALS[key] || {
      title: bin.name,
      subtitle: "Sorting Stream",
      lidColor: "#334155",
      collarColor: "#1e293b",
      bodyBg: "linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)",
      fillGradient: "linear-gradient(180deg, #94a3b8 0%, #475569 100%)",
      accentColor: bin.color || "#475569",
      icon: "📦",
      chuteLabel: "Chute"
    };

    const fillPercent = Math.min(100, Math.round((bin.fillCount / bin.capacity) * 100));
    const isNearFull = fillPercent >= 80;

    return `
      <div 
        id="bin-card-${bin.id}" 
        class="twin-illustrated-bin-card rounded-2xl p-3 border transition-all duration-300 shadow-sm relative overflow-hidden bg-white/95 border-slate-200 flex flex-col justify-between hover:shadow-md"
        data-bin-id="${bin.id}"
      >
        <!-- Top Chute Entry Funnel (Visibly directs item from conveyor into bin mouth) -->
        <div class="sorting-chute-funnel h-6 w-full rounded-t-lg mb-1 flex items-center justify-center text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider">
          <span>↓ ${visual.chuteLabel} ↓</span>
        </div>

        <!-- Top Stream Label & Fill Badge -->
        <div>
          <div class="flex items-start justify-between gap-1 mb-1">
            <div>
              <div class="text-[10px] uppercase font-extrabold tracking-wider" style="color: ${visual.accentColor}">
                ${visual.title}
              </div>
              <div class="text-xs font-bold text-slate-900 leading-tight">
                ${visual.subtitle}
              </div>
            </div>
            <span class="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white shadow-sm flex-shrink-0" style="background-color: ${visual.accentColor}">
              ${fillPercent}%
            </span>
          </div>
        </div>

        <!-- 2D Illustrated Bin Graphic Assembly with Layered Front Wall Occlusion -->
        <div class="bin-graphic-stage relative mx-auto my-2 flex flex-col items-center justify-end h-32 w-full select-none overflow-hidden">
          
          <!-- Floating Arrival Badge (+1 SORTED!) -->
          <div class="bin-arrival-badge absolute top-1 opacity-0 pointer-events-none font-bold text-[10px] px-2 py-0.5 rounded-full bg-emerald-600 text-white shadow-lg z-30">
            +1 SORTED!
          </div>

          <!-- Hinged Bin Lid (Flips open on arrival) -->
          <div class="bin-lid w-20 h-3.5 rounded-t-lg shadow-sm relative flex items-center justify-center cursor-default" style="background: ${visual.lidColor}; z-index: 30;">
            <div class="w-6 h-1 rounded-full bg-white/40"></div>
          </div>
          
          <!-- Bin Collar Front Lip (z-index: 28 so falling item disappears behind it) -->
          <div class="bin-collar-lip w-24 h-2.5 rounded-sm shadow-sm relative" style="background: ${visual.collarColor}; z-index: 28;"></div>
          
          <!-- Bin Tapered Body with Cutaway View showing Rising Fill Level -->
          <div class="bin-body w-20 h-22 rounded-b-xl relative overflow-hidden shadow-inner border border-slate-700/20 flex flex-col justify-end bg-slate-100">
            
            <!-- Watermark Stream Icon on Bin Face -->
            <div class="absolute inset-0 flex items-center justify-center opacity-15 pointer-events-none text-2xl z-10">
              ${visual.icon}
            </div>

            <!-- Rising Liquid/Material Fill Level Column -->
            <div class="bin-fill-level w-full relative z-10 shadow-sm" style="height: ${fillPercent}%; background: ${visual.fillGradient};">
              <div class="w-full h-1 bg-white/40"></div>
              <div class="text-center text-[8px] font-bold text-white drop-shadow-sm select-none py-0.5">
                ${fillPercent >= 15 ? fillPercent + '%' : ''}
              </div>
            </div>

            <!-- Bin Front Wall Face (z-index: 26) so falling item disappears behind it inside the container -->
            <div class="bin-front-wall absolute inset-0 pointer-events-none rounded-b-xl" style="background: ${visual.bodyBg}; opacity: 0.9; z-index: 26;">
              <!-- Reinforcement Grooves / Ribs -->
              <div class="absolute inset-x-1 inset-y-1 flex justify-around pointer-events-none opacity-20">
                <div class="w-0.5 h-full bg-black/40"></div>
                <div class="w-0.5 h-full bg-black/40"></div>
              </div>
            </div>
          </div>

          <!-- Bin Base Wheels -->
          <div class="w-20 flex justify-between px-1 -mt-1 z-20 pointer-events-none">
            <div class="w-3 h-3 rounded-full bg-slate-900 border border-slate-500 shadow-sm"></div>
            <div class="w-5 h-1 rounded bg-slate-700 self-center"></div>
            <div class="w-3 h-3 rounded-full bg-slate-900 border border-slate-500 shadow-sm"></div>
          </div>
        </div>

        <!-- Capacity Telemetry & Details -->
        <div class="pt-1.5 border-t border-slate-100 text-xs">
          <div class="flex items-center justify-between text-[10px] text-slate-600 font-medium">
            <span>Capacity:</span>
            <span class="font-mono font-bold text-slate-900">${bin.fillCount} / ${bin.capacity} <span class="text-[8px] font-normal text-slate-400">[SIM]</span></span>
          </div>

          <p class="text-[9px] text-slate-500 mt-0.5 line-clamp-1 leading-tight" title="${bin.acceptedTypes}">
            ${bin.acceptedTypes}
          </p>

          <!-- Status indicator and manual empty action -->
          <div class="mt-1.5 pt-1 border-t border-slate-100 flex items-center justify-between text-[9px]">
            <span class="flex items-center gap-1 font-medium ${isNearFull ? 'text-amber-700' : 'text-slate-500'}">
              <span class="w-1.5 h-1.5 rounded-full ${isNearFull ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'}"></span>
              ${isNearFull ? 'Near Full' : 'Active'}
            </span>
            <button 
              class="btn-empty-bin text-[9px] font-bold text-emerald-800 hover:text-emerald-950 underline cursor-pointer"
              data-bin="${bin.id}"
              title="Manually empty this simulated bin to test continuous operation"
            >
              Empty [SIM]
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Attach listener to manual empty buttons
  container.querySelectorAll('.btn-empty-bin').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const binId = btn.getAttribute('data-bin');
      if (binId) {
        appState.emptyBin(binId);
      }
    });
  });
}

function setupSpawnerButtons() {
  const container = document.getElementById('twin-spawner-buttons');
  if (!container) return;

  const testItemSpecs = [
    { label: "🥤 Plastic Bottle", id: "pet_water_bottle" },
    { label: "🧃 Beverage Carton", id: "tetra_pak_carton" },
    { label: "🍟 Chips Sachet", id: "chip_packet_mlp" },
    { label: "🔋 Battery", id: "household_battery" },
    { label: "📱 Smartphone", id: "smartphone_ewaste" },
    { label: "🍕 Pizza Box", id: "greasy_pizza_box" }
  ];

  container.innerHTML = testItemSpecs.map(spec => `
    <button 
      data-id="${spec.id}"
      class="twin-spawn-btn px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-emerald-50 text-forest-900 border border-slate-200 shadow-sm transition-all hover:scale-105 active:scale-95 flex items-center gap-1"
    >
      ${spec.label}
    </button>
  `).join('');

  container.querySelectorAll('.twin-spawn-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const foundItem = WASTE_DATABASE.find(item => item.id === id);
      if (foundItem) {
        lastSimulatedItem = foundItem;
        appState.dispatchItemToFacility(foundItem);
      }
    });
  });
}

function setupReplayControls() {
  const topReplay = document.getElementById('btn-twin-replay-top');
  const bannerReplay = document.getElementById('btn-replay-sorting');

  const triggerReplay = () => {
    const itemToReplay = lastSimulatedItem || appState.getState().currentItem || WASTE_DATABASE[0];
    if (itemToReplay) {
      lastSimulatedItem = itemToReplay;
      appState.dispatchItemToFacility(itemToReplay);
    }
  };

  if (topReplay) {
    topReplay.addEventListener('click', triggerReplay);
  }
  if (bannerReplay) {
    bannerReplay.addEventListener('click', triggerReplay);
  }
}

function setTwinStep(stepNum) {
  const steps = [
    { card: document.getElementById('twin-step-1'), icon: document.getElementById('step-icon-1'), activeBorder: 'border-emerald-500', activeRing: 'ring-emerald-300/50', activeBg: 'bg-emerald-50/90', iconBg: 'bg-emerald-600' },
    { card: document.getElementById('twin-step-2'), icon: document.getElementById('step-icon-2'), activeBorder: 'border-indigo-500', activeRing: 'ring-indigo-300/50', activeBg: 'bg-indigo-50/90', iconBg: 'bg-indigo-600' },
    { card: document.getElementById('twin-step-3'), icon: document.getElementById('step-icon-3'), activeBorder: 'border-purple-500', activeRing: 'ring-purple-300/50', activeBg: 'bg-purple-50/90', iconBg: 'bg-purple-600' }
  ];

  steps.forEach((s, idx) => {
    if (!s.card || !s.icon) return;
    if (idx + 1 === stepNum) {
      s.card.className = `p-3 sm:p-4 rounded-2xl border-2 transition-all duration-300 flex items-center gap-3.5 ${s.activeBg} ${s.activeBorder} shadow-md ring-2 ${s.activeRing} scale-[1.02]`;
      s.icon.className = `w-9 h-9 rounded-xl ${s.iconBg} text-white font-bold flex items-center justify-center text-sm shadow-sm flex-shrink-0`;
    } else {
      s.card.className = 'p-3 sm:p-4 rounded-2xl border-2 transition-all duration-300 flex items-center gap-3.5 bg-white/70 border-slate-200';
      s.icon.className = 'w-9 h-9 rounded-xl bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-sm shadow-sm flex-shrink-0';
    }
  });
}

function getBinTargetCoordinates(binId) {
  const stage = document.getElementById('twin-facility-stage');
  const targetBin = document.getElementById(`bin-card-${binId}`);

  if (stage && targetBin && typeof targetBin.getBoundingClientRect === 'function') {
    const sRect = stage.getBoundingClientRect();
    const bRect = targetBin.getBoundingClientRect();
    if (sRect.width > 0 && bRect.width > 0) {
      const targetX = bRect.left + (bRect.width / 2) - sRect.left;
      const chuteY = bRect.top - sRect.top - 12; // Chute entrance
      const mouthY = bRect.top - sRect.top + 28; // Bin mouth opening
      const insideY = bRect.top - sRect.top + 72; // Deep inside behind front wall
      return {
        x: Math.round(targetX),
        chuteY: Math.round(chuteY),
        mouthY: Math.round(mouthY),
        insideY: Math.round(insideY)
      };
    }
  }

  // Fallbacks for percentage layout / headless tests
  const fallbackX = {
    dry_recyclables: 60,
    wet_organics: 180,
    landfill_rdf: 300,
    hazardous_sanitary: 420,
    separate_ewaste: 540
  };
  return {
    x: fallbackX[binId] || 300,
    chuteY: 190,
    mouthY: 235,
    insideY: 280
  };
}

function setupTwinEventListeners() {
  const screen = document.getElementById('twin-sensor-screen');
  const contaminationBanner = document.getElementById('twin-contamination-banner');
  const contaminationText = document.getElementById('twin-contamination-text');
  const movingItem = document.getElementById('twin-moving-item');
  const svgHolder = document.getElementById('twin-waste-svg-holder');
  const activeName = document.getElementById('conveyor-active-name');
  const itemName = document.getElementById('twin-item-name');
  const laserBeam = document.getElementById('twin-laser-beam');
  const sensorLed = document.getElementById('sensor-gantry-led');
  const expBanner = document.getElementById('twin-sorting-explanation');
  const expText = document.getElementById('twin-explanation-text');
  const expSubtext = document.getElementById('twin-explanation-subtext');
  const opticalHud = document.getElementById('twin-optical-hud');
  const hudName = document.getElementById('hud-item-name');
  const hudMaterial = document.getElementById('hud-material');
  const hudDest = document.getElementById('hud-destination');
  const hudContam = document.getElementById('hud-contamination');
  const diverterArm = document.getElementById('twin-diverter-arm');
  const airJetPuff = document.getElementById('twin-air-jet-puff');

  const binFriendlyNames = {
    dry_recyclables: "Blue Bin (Clean Dry Recyclables)",
    wet_organics: "Green Bin (Wet Organic Food)",
    hazardous_sanitary: "Red Bin / Vault (Domestic Hazardous)",
    landfill_rdf: "Grey Bin (Landfill & Cement Fuel)",
    separate_ewaste: "Separate E-Waste Collection (Specialized Drop-Off)"
  };

  // Re-render bins when binsUpdated event fires
  appState.subscribe('binsUpdated', (bins) => {
    renderTwinBins(bins);
  });

  // Stage 1: Waste Enters — Recognizable physical object placed visibly ON conveyor belt
  appState.subscribe('twinStarted', ({ item }) => {
    lastSimulatedItem = item;
    setTwinStep(1);
    
    if (screen) screen.textContent = `STAGE 1: Waste Enters — [${item.name}] placed onto conveyor belt at 1.2 m/s. Heading to optical inspection chamber...`;
    if (contaminationBanner) contaminationBanner.classList.add('hidden');
    if (expBanner) expBanner.classList.add('hidden');
    if (opticalHud) opticalHud.classList.add('hidden');
    if (diverterArm) diverterArm.classList.remove('diverter-paddle-active');
    if (airJetPuff) airJetPuff.classList.add('hidden');

    // Reset any open bin lids and receiving bounce classes
    document.querySelectorAll('.bin-lid-open').forEach(el => el.classList.remove('bin-lid-open'));
    document.querySelectorAll('.bin-receiving-bounce').forEach(el => el.classList.remove('bin-receiving-bounce'));
    
    // Render the physical SVG waste object inside the carrier (No text card!)
    if (svgHolder) {
      svgHolder.innerHTML = getWasteItemSvg(item);
    }

    // Update separate status badge above conveyor
    if (activeName) {
      activeName.textContent = item.name;
    }
    if (itemName) {
      itemName.textContent = item.name;
    }
    
    if (movingItem) {
      movingItem.className = 'waste-object-carrier conveyor-glide will-change-transform';
      // Rests firmly ON the belt tread surface
      const beltY = getBeltSurfaceY();
      movingItem.style.top = `${beltY}px`;
      movingItem.style.left = '4%';
      movingItem.style.transform = 'translate(0, -100%) scale(1)';
      movingItem.style.opacity = '1';
    }
  });

  // Stage 2: Item Identified (Optical Camera & Laser Scan pause)
  appState.subscribe('twinSensorScanned', ({ item }) => {
    setTwinStep(2);
    if (screen) screen.textContent = `STAGE 2: Item Identified — ${item.simulationProperties.sensorDetection}`;
    
    // Glides horizontally to scanner station and pauses directly under laser
    if (movingItem) {
      const beltY = getBeltSurfaceY();
      movingItem.className = 'waste-object-carrier conveyor-glide will-change-transform';
      movingItem.style.top = `${beltY}px`;
      movingItem.style.left = '50%';
      movingItem.style.transform = 'translate(-50%, -100%) scale(1)';
    }
    
    if (laserBeam) laserBeam.style.opacity = '1';
    if (sensorLed) {
      sensorLed.classList.add('bg-amber-400', 'animate-ping');
      sensorLed.classList.remove('bg-emerald-400');
    }

    // Populate and show the separate Optical Scanner HUD Popup (Not on the object!)
    if (opticalHud && hudName && hudMaterial && hudDest && hudContam) {
      hudName.textContent = item.name;
      hudMaterial.textContent = item.estimatedComposition && item.estimatedComposition.length 
        ? item.estimatedComposition[0].split('(')[0].trim() 
        : (item.category || 'Standard Material');
      hudDest.textContent = binFriendlyNames[item.recommendedBin] || item.binLabel || "Municipal Stream";
      
      if (item.visualContaminationRisk && (item.visualContaminationRisk.toLowerCase().includes('hazard') || item.visualContaminationRisk.toLowerCase().includes('grease') || item.visualContaminationRisk.toLowerCase().includes('risk'))) {
        hudContam.textContent = "Contamination / Hazard Flagged";
        hudContam.className = "font-bold text-amber-700 text-right";
      } else {
        hudContam.textContent = "Clean / Zero Residue";
        hudContam.className = "font-bold text-emerald-700 text-right";
      }
      opticalHud.classList.remove('hidden');
    }

    if (item.simulationProperties.contaminationWarning && contaminationBanner && contaminationText) {
      contaminationText.textContent = item.simulationProperties.contaminationWarning;
      contaminationBanner.classList.remove('hidden');
    }
  });

  // Stage 3: Diverter & Falling through chute into assigned bin
  appState.subscribe('twinDiverting', ({ item }) => {
    setTwinStep(3);
    if (screen) screen.textContent = `STAGE 3: Diverting — ${item.simulationProperties.airJetDivert}`;
    if (laserBeam) laserBeam.style.opacity = '0';
    if (opticalHud) opticalHud.classList.add('hidden');
    
    if (sensorLed) {
      sensorLed.classList.remove('animate-ping', 'bg-amber-400');
      sensorLed.classList.add('bg-emerald-400');
    }

    // Diverter paddle arm swings down and air jet puff fires
    if (diverterArm) diverterArm.classList.add('diverter-paddle-active');
    if (airJetPuff) {
      airJetPuff.classList.remove('hidden');
      setTimeout(() => airJetPuff.classList.add('hidden'), 700);
    }

    // Item glides to Stage 3 diverter end of the belt
    if (movingItem) {
      const beltY = getBeltSurfaceY();
      movingItem.className = 'waste-object-carrier conveyor-glide will-change-transform';
      movingItem.style.top = `${beltY}px`;
      movingItem.style.left = '84%';
      movingItem.style.transform = 'translate(-50%, -100%) scale(1)';
    }

    // Open the assigned destination bin's lid in advance as the item approaches
    const targetBinCard = document.getElementById(`bin-card-${item.recommendedBin}`);
    if (targetBinCard) {
      targetBinCard.classList.add('ring-2', 'ring-emerald-400');
      const lid = targetBinCard.querySelector('.bin-lid');
      if (lid) lid.classList.add('bin-lid-open');
    }

    // After brief air-jet trigger, item physically falls through the chute toward the assigned bin opening!
    setTimeout(() => {
      if (movingItem) {
        const coords = getBinTargetCoordinates(item.recommendedBin);
        movingItem.className = 'waste-object-carrier chute-descent will-change-transform';
        movingItem.style.left = typeof coords.x === 'number' ? `${coords.x}px` : coords.x;
        movingItem.style.top = `${coords.chuteY}px`;
        movingItem.style.transform = 'translate(-50%, -50%) rotate(8deg) scale(0.95)';
      }
    }, 320);

    // Continue down into the mouth of the bin
    setTimeout(() => {
      if (movingItem) {
        const coords = getBinTargetCoordinates(item.recommendedBin);
        movingItem.style.top = `${coords.mouthY}px`;
        movingItem.style.transform = 'translate(-50%, -50%) rotate(12deg) scale(0.9)';
      }
    }, 720);
  });

  // Stage 4: Deposited — Plunges through bin opening, disappears behind front wall, fill level rises!
  appState.subscribe('twinDeposited', ({ item, bins }) => {
    const targetBinName = binFriendlyNames[item.recommendedBin] || item.binLabel || "Separate E-Waste Collection";

    if (screen) screen.textContent = `COMPLETED: [${item.name}] deposited into ${targetBinName}. Simulated sorting complete!`;
    
    // Visibly sink behind the bin's front wall and disappear inside the container!
    if (movingItem) {
      const coords = getBinTargetCoordinates(item.recommendedBin);
      movingItem.className = 'waste-object-carrier sinking-behind-front-wall will-change-transform';
      movingItem.style.top = `${coords.insideY}px`;
      
      setTimeout(() => {
        movingItem.style.opacity = '0';
        movingItem.style.left = '4%';
        movingItem.style.top = `${getBeltSurfaceY()}px`;
        movingItem.style.transform = 'translate(0, -100%) scale(1)';
        movingItem.className = 'waste-object-carrier opacity-0 pointer-events-none';
      }, 650);
    }

    if (diverterArm) {
      setTimeout(() => diverterArm.classList.remove('diverter-paddle-active'), 500);
    }

    // Update fill percentages and capacity in bins display at the exact moment of landing!
    renderTwinBins(bins);

    // Make the destination bin visibly react when the item lands inside!
    const targetBinCard = document.getElementById(`bin-card-${item.recommendedBin}`);
    if (targetBinCard) {
      targetBinCard.classList.remove('ring-2', 'ring-emerald-400');
      targetBinCard.classList.add('ring-4', 'ring-emerald-500', 'bin-receiving-bounce', 'shadow-xl');
      
      // Floating arrival badge
      const badge = targetBinCard.querySelector('.bin-arrival-badge');
      if (badge) {
        badge.classList.remove('anim-arrival-badge');
        void badge.offsetWidth; // trigger reflow
        badge.classList.add('anim-arrival-badge');
      }

      // Close lid and reset bounce after landing sequence finishes
      setTimeout(() => {
        targetBinCard.classList.remove('ring-4', 'ring-emerald-500', 'bin-receiving-bounce', 'shadow-xl');
        const lid = targetBinCard.querySelector('.bin-lid');
        if (lid) lid.classList.remove('bin-lid-open');
      }, 1500);
    }

    // Show friendly plain-English sorting explanation with instant replay action
    if (expBanner && expText && expSubtext) {
      expText.textContent = `${item.name} ➔ ${targetBinName}`;
      if (item.recommendedBin === 'dry_recyclables') {
        expSubtext.textContent = 'Clean dry packaging is separated for mechanical recycling and Dry Waste Collection Centre (DWCC) processing.';
      } else if (item.recommendedBin === 'wet_organics') {
        expSubtext.textContent = 'Food & wet waste is diverted from landfill directly to local composting and biomethanation.';
      } else if (item.recommendedBin === 'hazardous_sanitary') {
        expSubtext.textContent = 'Domestic hazardous items (batteries, chemical cells) are safely isolated into the red stream to protect sanitation workers.';
      } else if (item.recommendedBin === 'separate_ewaste') {
        expSubtext.textContent = 'Smartphones & electronic devices are diverted to authorized E-Waste dismantling facilities, never mixed with ordinary municipal garbage.';
      } else {
        expSubtext.textContent = 'Multi-layer composite plastics are baled for cement kiln co-processing (Refuse-Derived Fuel).';
      }
      expBanner.classList.remove('hidden');
    }

    // Reconnect replay button inside the banner
    setupReplayControls();
  });
}
