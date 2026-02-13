import { useState, useEffect, useMemo } from 'react';
import { useWorkoutStore } from '@/stores/workoutStore';
import type { WorkoutRecord } from '@/types';

/**
 * ホームページ - カレンダーとトレーニングメニュー表示
 */
export function HomePage() {
  const { workouts, loadWorkouts } = useWorkoutStore();
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    loadWorkouts();
  }, [loadWorkouts]);

  // 現在の月の日付を取得
  const { year, month, daysInMonth, firstDayOfWeek } = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    
    return { year, month, daysInMonth, firstDayOfWeek };
  }, [currentDate]);

  // トレーニング実施日をマップに変換
  const workoutDates = useMemo(() => {
    const dateMap = new Map<string, WorkoutRecord[]>();
    
    workouts.forEach(workout => {
      const dateKey = new Date(workout.date).toLocaleDateString('ja-JP');
      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, []);
      }
      dateMap.get(dateKey)!.push(workout);
    });
    
    return dateMap;
  }, [workouts]);

  // 今後のトレーニング予定（仮データ）
  const upcomingWorkouts = [
    { date: '2026-02-14', exercises: ['ベンチプレス', 'ダンベルフライ', 'プッシュアップ'], bodyPart: '胸' },
    { date: '2026-02-16', exercises: ['スクワット', 'レッグプレス', 'レッグカール'], bodyPart: '脚' },
    { date: '2026-02-18', exercises: ['デッドリフト', 'ラットプルダウン', 'ベントオーバーロウ'], bodyPart: '背中' },
  ];

  // 月を変更
  const changeMonth = (delta: number) => {
    setCurrentDate(new Date(year, month + delta, 1));
  };

  // 今日の日付
  const today = new Date();
  const isToday = (day: number) => {
    return today.getFullYear() === year && 
           today.getMonth() === month && 
           today.getDate() === day;
  };

  // その日にトレーニングがあるか
  const hasWorkout = (day: number) => {
    const dateKey = new Date(year, month, day).toLocaleDateString('ja-JP');
    return workoutDates.has(dateKey);
  };

  // カレンダーの日付配列を生成
  const calendarDays = useMemo(() => {
    const days: (number | null)[] = [];
    
    // 月初の空白
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }
    
    // 日付
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  }, [firstDayOfWeek, daysInMonth]);

  const weekDays = ['日', '月', '火', '水', '木', '金', '土'];
  const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 animate-fade-in">
          <h1 className="text-5xl font-display font-bold text-gray-900 mb-3 tracking-tight">
            トレーニングカレンダー
          </h1>
          <p className="text-lg text-gray-600">
            トレーニングの記録と予定を管理しましょう
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* カレンダー */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 animate-slide-up">
              {/* カレンダーヘッダー */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-display font-bold text-gray-900">
                  {year}年 {monthNames[month]}
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => changeMonth(-1)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    aria-label="前月"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setCurrentDate(new Date())}
                    className="px-4 py-2 rounded-lg bg-blue-50 text-blue-600 font-medium hover:bg-blue-100 transition-colors"
                  >
                    今月
                  </button>
                  <button
                    onClick={() => changeMonth(1)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    aria-label="次月"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* 曜日ヘッダー */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {weekDays.map((day, index) => (
                  <div
                    key={day}
                    className={`text-center text-sm font-semibold py-2 ${
                      index === 0 ? 'text-red-600' : index === 6 ? 'text-blue-600' : 'text-gray-600'
                    }`}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* カレンダーグリッド */}
              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day, index) => (
                  <div
                    key={index}
                    className={`aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-all ${
                      day === null
                        ? ''
                        : isToday(day)
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg'
                        : hasWorkout(day)
                        ? 'bg-gradient-to-br from-green-50 to-green-100 text-green-700 border-2 border-green-300 hover:shadow-md cursor-pointer'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 cursor-pointer'
                    }`}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* 凡例 */}
              <div className="flex items-center gap-6 mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-gradient-to-br from-blue-500 to-blue-600"></div>
                  <span className="text-sm text-gray-600">今日</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300"></div>
                  <span className="text-sm text-gray-600">トレーニング実施日</span>
                </div>
              </div>
            </div>
          </div>

          {/* トレーニングメニュー表 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-md">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h2 className="text-xl font-display font-bold text-gray-900">
                  今後の予定
                </h2>
              </div>

              <div className="space-y-4">
                {upcomingWorkouts.map((workout, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-gray-600">
                        {new Date(workout.date).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                        {workout.bodyPart}
                      </span>
                    </div>
                    <ul className="space-y-2">
                      {workout.exercises.map((exercise, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                          <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {exercise}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* 統計情報 */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">
                  今月の統計
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 rounded-lg bg-blue-50">
                    <div className="text-2xl font-display font-bold text-blue-600">
                      {workouts.filter(w => {
                        const d = new Date(w.date);
                        return d.getMonth() === month && d.getFullYear() === year;
                      }).length}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">トレーニング</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-green-50">
                    <div className="text-2xl font-display font-bold text-green-600">
                      {new Set(workouts.filter(w => {
                        const d = new Date(w.date);
                        return d.getMonth() === month && d.getFullYear() === year;
                      }).map(w => new Date(w.date).toDateString())).size}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">実施日数</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
