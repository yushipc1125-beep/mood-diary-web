// 気分レベル：0=最悪 〜 3=最高
export type MoodLevel = 0 | 1 | 2 | 3;

export type EyeStyle = 'dot' | 'caret' | 'cross';
export type MouthStyle = 'flat' | 'smile' | 'frown';

export interface MoodConfig {
  label: string;
  background: string;
  eyeStyle: EyeStyle;
  mouthStyle: MouthStyle;
}

export const MOOD_LEVELS: Record<MoodLevel, MoodConfig> = {
  0: { label: '最悪', background: '#F17171', eyeStyle: 'cross', mouthStyle: 'frown' },
  1: { label: '悪い', background: '#F2A74B', eyeStyle: 'dot', mouthStyle: 'frown' },
  2: { label: '普通', background: '#F6CB4E', eyeStyle: 'dot', mouthStyle: 'flat' },
  3: { label: '最高', background: '#7BC67E', eyeStyle: 'caret', mouthStyle: 'smile' },
};

export const FACE_LINE_COLOR = '#4A3728';

// 累計記録日数に応じた育成ステージ
export type PlantStage = 'none' | 'sprout' | 'twinLeaf' | 'bud' | 'bloom';

export function cumulativeToPlantStage(totalRecordedDays: number): PlantStage {
  if (totalRecordedDays >= 30) return 'bloom';
  if (totalRecordedDays >= 14) return 'bud';
  if (totalRecordedDays >= 7) return 'twinLeaf';
  if (totalRecordedDays >= 3) return 'sprout';
  return 'none';
}

export interface MoodRecord {
  date: string; // YYYY-MM-DD
  level: MoodLevel;
  memo?: string;
  tags?: string[];
}

export const STORAGE_KEY = 'mood-diary-records';

export function loadRecords(): Record<string, MoodRecord> | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Record<string, MoodRecord>;
  } catch {
    // 壊れたデータやプライベートブラウジング等で読み込めない場合は初期状態にフォールバックする
    return null;
  }
}

export function saveRecords(records: Record<string, MoodRecord>): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    // 保存に失敗しても記録画面自体は使えるようにしておく（ストレージ容量超過等）
  }
}
