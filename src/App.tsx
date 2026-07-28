import { useMemo, useState } from 'react';
import './App.css';
import { MoodSquare } from './components/MoodSquare';
import { cumulativeToPlantStage, type MoodLevel, type MoodRecord } from './lib/mood';

const TAGS = ['仕事', '学業', '人間関係', '体調', '運動', '睡眠'];

function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function seedRecords(now: Date): Record<string, MoodRecord> {
  // デモ表示用のサンプルデータ。実際にはRecord画面からの保存で埋まっていく想定。
  const seed: Record<string, MoodRecord> = {};
  const levels: MoodLevel[] = [3, 2, 1, 3, 0, 2, 3, 3, 1, 2];
  levels.forEach((level, i) => {
    const d = new Date(now.getFullYear(), now.getMonth(), i + 1);
    seed[toDateKey(d)] = { date: toDateKey(d), level };
  });
  return seed;
}

export default function App() {
  const today = useMemo(() => new Date(), []);
  const todayKey = toDateKey(today);

  const [records, setRecords] = useState<Record<string, MoodRecord>>(() => seedRecords(today));
  const [selectedLevel, setSelectedLevel] = useState<MoodLevel | null>(records[todayKey]?.level ?? null);
  const [memo, setMemo] = useState(records[todayKey]?.memo ?? '');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const totalRecordedDays = Object.keys(records).length;
  const plantStage = cumulativeToPlantStage(totalRecordedDays);

  function handleSave() {
    if (selectedLevel === null) return;
    setRecords((prev) => ({
      ...prev,
      [todayKey]: { date: todayKey, level: selectedLevel, memo: memo || undefined, tags: selectedTags },
    }));
  }

  function toggleTag(tag: string) {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }

  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const firstWeekday = new Date(today.getFullYear(), today.getMonth(), 1).getDay();

  const counts: Record<MoodLevel, number> = { 0: 0, 1: 0, 2: 0, 3: 0 };
  Object.values(records).forEach((r) => {
    counts[r.level] += 1;
  });

  const recentMemos = Object.values(records)
    .filter((r) => r.memo)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 5);

  return (
    <div className="page">
      <header className="page-header">
        <p className="eyebrow">気分日記</p>
        <h1>今日の色を、そのまま置いていくだけ。</h1>
      </header>

      <main className="grid">
        <section className="card">
          <h2>今日の気分は？</h2>
          <p className="meta">
            {today.getFullYear()}年{today.getMonth() + 1}月{today.getDate()}日
          </p>

          <div className="mascot">
            <MoodSquare level={selectedLevel ?? 2} plantStage={plantStage} size={72} />
          </div>

          <div className="picker" role="group" aria-label="今日の気分を選ぶ">
            {([0, 1, 2, 3] as MoodLevel[]).map((level) => (
              <MoodSquare
                key={level}
                level={level}
                size={44}
                selected={selectedLevel === level}
                onClick={() => setSelectedLevel(level)}
              />
            ))}
          </div>

          <input
            className="memo-input"
            type="text"
            placeholder="ひとことメモ（任意）"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
          />

          <p className="label">タグ（任意）</p>
          <div className="tags">
            {TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                className={`tag ${selectedTags.includes(tag) ? 'tag-active' : ''}`}
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>

          <button className="save-button" type="button" onClick={handleSave} disabled={selectedLevel === null}>
            記録する
          </button>
        </section>

        <section className="card">
          <h2>
            {today.getFullYear()}年{today.getMonth() + 1}月
          </h2>
          <div className="weekday-row">
            {['日', '月', '火', '水', '木', '金', '土'].map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
          <div className="calendar-grid">
            {Array.from({ length: firstWeekday }).map((_, i) => (
              <div key={`pad-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const d = new Date(today.getFullYear(), today.getMonth(), day);
              const key = toDateKey(d);
              const record = records[key];
              const isToday = key === todayKey;

              if (record) {
                return (
                  <MoodSquare
                    key={key}
                    level={record.level}
                    day={day}
                    plantStage={isToday ? plantStage : 'none'}
                    size={36}
                  />
                );
              }
              return (
                <div key={key} className={`empty-day ${isToday ? 'empty-day-today' : ''}`}>
                  {day}
                </div>
              );
            })}
          </div>
        </section>

        <section className="card">
          <h2>気分の記録</h2>
          <p className="meta">
            {today.getFullYear()}年{today.getMonth() + 1}月
          </p>
          <div className="stats">
            {([3, 2, 1, 0] as MoodLevel[]).map((level) => (
              <div className="stat" key={level}>
                <MoodSquare level={level} size={32} />
                <span>{counts[level]}日</span>
              </div>
            ))}
          </div>

          <p className="label">今月のメモ</p>
          <div className="memo-list">
            {recentMemos.length === 0 && <p className="empty-note">まだメモはありません</p>}
            {recentMemos.map((r) => (
              <div className="memo-row" key={r.date}>
                <MoodSquare level={r.level} size={24} />
                <div>
                  <p className="memo-date">{r.date}</p>
                  <p className="memo-text">{r.memo}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
