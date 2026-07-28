import { FACE_LINE_COLOR, MOOD_LEVELS, type EyeStyle, type MoodLevel, type MouthStyle, type PlantStage } from '../lib/mood';

interface MoodSquareProps {
  level: MoodLevel;
  day?: number;
  plantStage?: PlantStage;
  size?: number;
  selected?: boolean;
  onClick?: () => void;
}

const dark = FACE_LINE_COLOR;

function Eyes({ style }: { style: EyeStyle }) {
  if (style === 'cross') {
    return (
      <>
        <path d="M9 12 L13 16 M13 12 L9 16" stroke={dark} strokeWidth={1.6} strokeLinecap="round" />
        <path d="M19 12 L23 16 M23 12 L19 16" stroke={dark} strokeWidth={1.6} strokeLinecap="round" />
      </>
    );
  }
  if (style === 'caret') {
    return (
      <>
        <path d="M8 15 L11 12 L14 15" stroke={dark} strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18 15 L21 12 L24 15" stroke={dark} strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </>
    );
  }
  return (
    <>
      <circle cx={11} cy={14} r={1.7} fill={dark} />
      <circle cx={21} cy={14} r={1.7} fill={dark} />
    </>
  );
}

function Mouth({ style }: { style: MouthStyle }) {
  if (style === 'smile') {
    return <path d="M10 21 Q16 26 22 21" stroke={dark} strokeWidth={1.8} fill="none" strokeLinecap="round" />;
  }
  if (style === 'frown') {
    return <path d="M10 24 Q16 19 22 24" stroke={dark} strokeWidth={1.8} fill="none" strokeLinecap="round" />;
  }
  return <line x1={10} y1={22} x2={22} y2={22} stroke={dark} strokeWidth={1.8} strokeLinecap="round" />;
}

// 頭上の芽・花。土台(16,12)を下端として、上方向(y座標が小さい方向)に伸びる。
// この座標のまま「頭上オーバーレイ用SVG」のviewBoxの下端に合わせて描画する。
function Plant({ stage }: { stage: PlantStage }) {
  if (stage === 'none') return null;
  const stem = <line x1={16} y1={12} x2={16} y2={stage === 'sprout' ? 7 : 3} stroke="#5DA85E" strokeWidth={1.6} strokeLinecap="round" />;
  const leafLeft = <ellipse cx={13} cy={6} rx={2.4} ry={1.3} fill="#5DA85E" transform="rotate(-30 13 6)" />;
  const leafRight = <ellipse cx={19} cy={6} rx={2.4} ry={1.3} fill="#5DA85E" transform="rotate(30 19 6)" />;

  if (stage === 'sprout') {
    return (
      <>
        <line x1={16} y1={12} x2={16} y2={7} stroke="#5DA85E" strokeWidth={1.6} strokeLinecap="round" />
        <ellipse cx={13} cy={7.5} rx={2.6} ry={1.4} fill="#5DA85E" transform="rotate(-30 13 7.5)" />
      </>
    );
  }
  if (stage === 'twinLeaf') {
    return (
      <>
        {stem}
        {leafLeft}
        {leafRight}
      </>
    );
  }
  if (stage === 'bud') {
    return (
      <>
        {stem}
        {leafLeft}
        {leafRight}
        <ellipse cx={16} cy={2} rx={2.4} ry={3} fill="#E88BAE" />
      </>
    );
  }
  // bloom
  return (
    <>
      {stem}
      {leafLeft}
      {leafRight}
      <circle cx={16} cy={1.5} r={1.6} fill="#F6CB4E" />
      <circle cx={12.5} cy={3} r={1.8} fill="#E88BAE" />
      <circle cx={19.5} cy={3} r={1.8} fill="#E88BAE" />
      <circle cx={16} cy={-0.5} r={1.8} fill="#E88BAE" />
      <circle cx={16} cy={5} r={1.8} fill="#E88BAE" />
    </>
  );
}

// 芽・花はこのぶんだけ上にはみ出す（頭上オーバーレイのviewBox高さ / 本体32との比率）
const PLANT_OVERLAY_RATIO = 15 / 32;

export function MoodSquare({ level, day, plantStage = 'none', size = 40, selected, onClick }: MoodSquareProps) {
  const config = MOOD_LEVELS[level];
  const hasPlant = plantStage !== 'none';

  const face = (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      aria-hidden={onClick ? true : undefined}
      role={onClick ? undefined : 'img'}
      aria-label={onClick ? undefined : config.label}
      style={{ display: 'block' }}
    >
      <rect width={32} height={32} rx={9} fill={config.background} />
      {day !== undefined && (
        <text x={4} y={9} fontSize={6} fill={dark} opacity={0.55}>
          {day}
        </text>
      )}
      <Eyes style={config.eyeStyle} />
      <Mouth style={config.mouthStyle} />
    </svg>
  );

  // 芽・花は本体の外枠サイズに影響しない絶対配置のオーバーレイにする。
  // こうしておくと、記録した瞬間に芽が生えても、マス自体の位置・カレンダーの行の高さがずれない。
  const wrapped = (
    <span style={{ position: 'relative', display: 'inline-block', width: size, height: size }}>
      {hasPlant && (
        <svg
          viewBox="0 -3 32 15"
          width={size}
          height={size * PLANT_OVERLAY_RATIO}
          style={{ position: 'absolute', bottom: '100%', left: 0 }}
          aria-hidden="true"
        >
          <Plant stage={plantStage} />
        </svg>
      )}
      {face}
    </span>
  );

  if (!onClick) return wrapped;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      aria-label={config.label}
      style={{
        display: 'inline-flex',
        padding: 0,
        border: 'none',
        background: 'none',
        cursor: 'pointer',
        borderRadius: 8,
        outline: selected ? `2px solid ${config.background}` : undefined,
        outlineOffset: 2,
      }}
    >
      {wrapped}
    </button>
  );
}
