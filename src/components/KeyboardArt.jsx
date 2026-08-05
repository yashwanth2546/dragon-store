import React from 'react';

const U = 52;
const G = 8;
const KH = 44;
const R = 7;

const mainLayout = [
  [
    { w: 1, label: '`' }, { w: 1, label: '1' }, { w: 1, label: '2' }, { w: 1, label: '3' },
    { w: 1, label: '4' }, { w: 1, label: '5' }, { w: 1, label: '6' }, { w: 1, label: '7' },
    { w: 1, label: '8' }, { w: 1, label: '9' }, { w: 1, label: '0' }, { w: 1, label: '-' },
    { w: 1, label: '=' }, { w: 2, label: '⌫' },
  ],
  [
    { w: 1.5, label: 'Tab' }, { w: 1, label: 'Q' }, { w: 1, label: 'W' }, { w: 1, label: 'E' },
    { w: 1, label: 'R' }, { w: 1, label: 'T' }, { w: 1, label: 'Y' }, { w: 1, label: 'U' },
    { w: 1, label: 'I' }, { w: 1, label: 'O' }, { w: 1, label: 'P' }, { w: 1, label: '[' },
    { w: 1, label: ']' }, { w: 1.5, label: '\\' },
  ],
  [
    { w: 1.75, label: 'Caps' }, { w: 1, label: 'A' }, { w: 1, label: 'S' }, { w: 1, label: 'D' },
    { w: 1, label: 'F' }, { w: 1, label: 'G' }, { w: 1, label: 'H' }, { w: 1, label: 'J' },
    { w: 1, label: 'K' }, { w: 1, label: 'L' }, { w: 1, label: ';' }, { w: 1, label: "'" },
    { w: 2.25, label: 'Enter' },
  ],
  [
    { w: 2.25, label: 'Shift' }, { w: 1, label: 'Z' }, { w: 1, label: 'X' }, { w: 1, label: 'C' },
    { w: 1, label: 'V' }, { w: 1, label: 'B' }, { w: 1, label: 'N' }, { w: 1, label: 'M' },
    { w: 1, label: ',' }, { w: 1, label: '.' }, { w: 1, label: '/' }, { w: 2.75, label: 'Shift' },
  ],
  [
    { w: 1.25, label: 'Ctrl' }, { w: 1.25, label: 'Win' }, { w: 1.25, label: 'Alt' },
    { w: 6.25, label: '' }, { w: 1.25, label: 'Alt' }, { w: 1.25, label: 'Fn' },
    { w: 1.25, label: 'Menu' }, { w: 1.25, label: 'Ctrl' },
  ],
];

const fnRow = [
  { w: 1, label: 'Esc' }, { w: 1, label: 'F1' }, { w: 1, label: 'F2' }, { w: 1, label: 'F3' },
  { w: 1, label: 'F4' }, { w: 1, label: 'F5' }, { w: 1, label: 'F6' }, { w: 1, label: 'F7' },
  { w: 1, label: 'F8' }, { w: 1, label: 'F9' }, { w: 1, label: 'F10' }, { w: 1, label: 'F11' },
  { w: 1, label: 'F12' },
];

function layoutRows(rows, startY) {
  let y = startY;
  const out = [];
  for (const row of rows) {
    let x = 40;
    const keys = [];
    for (const k of row) {
      const kw = k.w * U + (k.w - 1) * G;
      keys.push({ x, y, w: kw, label: k.label });
      x += kw + G;
    }
    out.push({ y, keys });
    y += KH + G;
  }
  return out;
}

export function KeyboardArt({ variant = 'ace', className = '' }) {
  const main = layoutRows(mainLayout, variant === 'ace' ? 40 + KH + G : 40);
  const fn = layoutRows([fnRow], 40);
  const rows = variant === 'ace' ? [fn[0], ...main] : main;
  const totalH = (rows[rows.length - 1].y + KH) + 40;
  const totalW = 40 * 2 + 15 * U + 14 * G;
  const viewW = 1000;

  const scale = viewW / totalW;
  const viewH = totalH * scale;

  const accent = variant === 'ace' ? '#a855f7' : '#c7cad1';
  const plateFrom = variant === 'ace' ? '#1a1a26' : '#2b2d35';
  const plateTo = variant === 'ace' ? '#0b0b12' : '#14161c';
  const keyFrom = '#262635';
  const keyTo = '#14141c';
  const rgbKeys = variant === 'ace'
    ? ['A', 'S', 'D', 'F', 'W', 'E', 'R', 'T', 'G', 'H', 'J', 'K', 'L']
    : [];

  return (
    <svg
      viewBox={`0 0 ${viewW} ${viewH}`}
      className={className}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={variant === 'ace' ? 'MCHOSE ACE 68 GT keyboard' : 'Ajazz ALUX 68 Max keyboard'}
    >
      <defs>
        <linearGradient id={`plate-${variant}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={plateFrom} />
          <stop offset="1" stopColor={plateTo} />
        </linearGradient>
        <linearGradient id={`key-${variant}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={keyFrom} />
          <stop offset="1" stopColor={keyTo} />
        </linearGradient>
        <radialGradient id={`glow-${variant}`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={accent} stopOpacity={variant === 'ace' ? 0.5 : 0.28} />
          <stop offset="1" stopColor={accent} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* underglow */}
      <ellipse cx={viewW / 2} cy={viewH / 2} rx={viewW * 0.42} ry={viewH * 0.5} fill={`url(#glow-${variant})`} />

      {/* plate */}
      <g transform={`scale(${scale})`}>
        <rect
          x="0"
          y="0"
          width={totalW}
          height={totalH}
          rx={22}
          fill={`url(#plate-${variant})`}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="2"
        />
        <rect x="14" y="14" width={totalW - 28} height={totalH - 28} rx={16} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />

        {rows.map((row, ri) => (
          <g key={ri}>
            {row.keys.map((k, ki) => {
              const isAccent = rgbKeys.includes(k.label);
              const keyFill = `url(#key-${variant})`;
              return (
                <g key={ki}>
                  <rect
                    x={k.x}
                    y={k.y}
                    width={k.w}
                    height={KH}
                    rx={R}
                    fill={keyFill}
                    stroke={isAccent ? 'rgba(168,85,247,0.35)' : 'rgba(255,255,255,0.07)'}
                    strokeWidth="1.2"
                  />
                  {isAccent && (
                    <rect
                      x={k.x + 2}
                      y={k.y + 2}
                      width={k.w - 4}
                      height={KH - 4}
                      rx={R - 2}
                      fill="none"
                      stroke="rgba(168,85,247,0.18)"
                      strokeWidth="1"
                    />
                  )}
                  <line
                    x1={k.x + 3}
                    y1={k.y + 3}
                    x2={k.x + k.w - 3}
                    y2={k.y + 3}
                    stroke="rgba(255,255,255,0.10)"
                    strokeWidth="1"
                  />
                  {k.label && (
                    <text
                      x={k.x + k.w / 2}
                      y={k.y + KH / 2 + 4}
                      textAnchor="middle"
                      fontSize="11"
                      fill={k.label.length > 2 ? '#8a8a99' : '#d9d9e3'}
                      style={{ fontFamily: 'Chakra Petch, monospace', fontWeight: 600 }}
                    >
                      {k.label}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        ))}

        {/* brand plate */}
        <rect x={totalW - 170} y={totalH - 34} width={130} height={16} rx={8} fill="rgba(255,255,255,0.04)" />
        <text
          x={totalW - 105}
          y={totalH - 23}
          textAnchor="middle"
          fontSize="9"
          fill="#8a8a99"
          style={{ fontFamily: 'Chakra Petch, monospace', letterSpacing: '0.2em' }}
        >
          RYUG•R
        </text>
      </g>
    </svg>
  );
}
