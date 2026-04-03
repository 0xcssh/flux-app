import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { darkPalette } from '@/theme/colors';
import { useLogStore } from '@/store/logStore';
import { formatLocalDate } from '@/lib/dateUtils';
import type { DailyLogEntry } from '@/types/log';

const DAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getScoreColor(score: number): string {
  if (score >= 70) return '#22C55E';
  if (score >= 40) return '#F59E0B';
  return '#EF4444';
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function getPredictedScore(dayOfWeek: number, allLogs: DailyLogEntry[]): number | null {
  if (allLogs.length < 7) return null;
  const dayLogs = allLogs.filter(
    (l) => new Date(l.log_date + 'T12:00:00').getDay() === dayOfWeek
  );
  if (dayLogs.length === 0) return null;
  return Math.round(
    dayLogs.reduce((sum, l) => sum + l.vitality_score, 0) / dayLogs.length
  );
}

export default function PhaseCalendar() {
  const { t } = useTranslation('cycle');
  const logs = useLogStore((s) => s.logs);
  const today = new Date();

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const monthName = new Date(viewYear, viewMonth).toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const allLogs = useMemo(() => Object.values(logs), [logs]);
  const totalLogCount = allLogs.length;
  const hasPredictions = totalLogCount >= 7;

  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    const lastDay = new Date(viewYear, viewMonth + 1, 0);
    const daysInMonth = lastDay.getDate();

    let startDow = firstDay.getDay() - 1;
    if (startDow < 0) startDow = 6;

    const cells: (number | null)[] = [];
    for (let i = 0; i < startDow; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);

    return cells;
  }, [viewYear, viewMonth]);

  const stats = useMemo(() => {
    let logged = 0;
    let totalScore = 0;
    let bestScore = -1;
    let bestDay = 0;
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    for (let d = 1; d <= daysInMonth; d++) {
      const key = formatDateKey(viewYear, viewMonth, d);
      const log = logs[key];
      if (log) {
        logged++;
        totalScore += log.vitality_score;
        if (log.vitality_score > bestScore) {
          bestScore = log.vitality_score;
          bestDay = d;
        }
      }
    }

    const avg = logged > 0 ? Math.round(totalScore / logged) : 0;

    // Find predicted best future day in this month
    let predictedBestDay = 0;
    let predictedBestScore = -1;
    if (hasPredictions) {
      const todayStr = formatLocalDate(today);
      for (let d = 1; d <= daysInMonth; d++) {
        const key = formatDateKey(viewYear, viewMonth, d);
        if (key <= todayStr) continue; // skip past & today
        const cellDate = new Date(viewYear, viewMonth, d);
        const dow = cellDate.getDay();
        const predicted = getPredictedScore(dow, allLogs);
        if (predicted !== null && predicted > predictedBestScore) {
          predictedBestScore = predicted;
          predictedBestDay = d;
        }
      }
    }

    return { logged, avg, bestDay, bestScore, predictedBestDay, predictedBestScore, daysInMonth };
  }, [logs, viewYear, viewMonth, allLogs, hasPredictions, today]);

  function goToPrevMonth() {
    if (viewMonth === 0) {
      setViewYear(viewYear - 1);
      setViewMonth(11);
    } else {
      setViewMonth(viewMonth - 1);
    }
  }

  function goToNextMonth() {
    if (viewMonth === 11) {
      setViewYear(viewYear + 1);
      setViewMonth(0);
    } else {
      setViewMonth(viewMonth + 1);
    }
  }

  const todayStr = formatLocalDate(today);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={goToPrevMonth} hitSlop={12}>
          <Ionicons name="chevron-back" size={20} color={darkPalette.textSecondary} />
        </Pressable>
        <Text style={styles.title}>{t('cycle_calendar', { defaultValue: 'Cycle Calendar' })}</Text>
        <Pressable onPress={goToNextMonth} hitSlop={12}>
          <Ionicons name="chevron-forward" size={20} color={darkPalette.textSecondary} />
        </Pressable>
      </View>

      {/* Month name subtitle */}
      <Text style={styles.monthSubtitle}>{monthName}</Text>

      {/* Day headers */}
      <View style={styles.dayHeaderRow}>
        {DAY_HEADERS.map((d) => (
          <Text key={d} style={styles.dayHeaderText}>
            {d}
          </Text>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={styles.grid}>
        {calendarDays.map((day, idx) => {
          if (day === null) {
            return <View key={`empty-${idx}`} style={styles.cell} />;
          }

          const key = formatDateKey(viewYear, viewMonth, day);
          const cellDate = new Date(viewYear, viewMonth, day);
          const isToday = isSameDay(cellDate, today);
          const isPast = key < todayStr;
          const isFuture = key > todayStr;
          const log = logs[key];
          const hasLog = !!log;

          // Determine what to display
          let circleStyle: object[];
          let dayNumberStyle: object[];
          let scoreText: string | null = null;

          if (isPast && hasLog) {
            // Past with actual data - solid filled circle
            const color = getScoreColor(log.vitality_score);
            circleStyle = [styles.dayCircle, { backgroundColor: color }];
            dayNumberStyle = [styles.dayNumber, styles.loggedText];
            scoreText = String(log.vitality_score);
          } else if (isPast && !hasLog) {
            // Past without data - empty gray circle
            circleStyle = [styles.dayCircle, { backgroundColor: darkPalette.surfaceElevated }];
            dayNumberStyle = [styles.dayNumber, { color: darkPalette.textTertiary }];
          } else if (isToday) {
            // Today - blue border
            if (hasLog) {
              const color = getScoreColor(log.vitality_score);
              circleStyle = [styles.dayCircle, { backgroundColor: color }, styles.todayBorder];
              dayNumberStyle = [styles.dayNumber, styles.loggedText];
              scoreText = String(log.vitality_score);
            } else {
              circleStyle = [
                styles.dayCircle,
                { backgroundColor: darkPalette.surfaceElevated },
                styles.todayBorder,
              ];
              dayNumberStyle = [styles.dayNumber, { color: darkPalette.textSecondary }];
              scoreText = '?';
            }
          } else {
            // Future
            const dow = cellDate.getDay();
            const predicted = hasPredictions ? getPredictedScore(dow, allLogs) : null;
            if (predicted !== null) {
              // Future with prediction - dashed border
              const color = getScoreColor(predicted);
              circleStyle = [
                styles.dayCircle,
                styles.predictedCircle,
                { borderColor: color },
              ];
              dayNumberStyle = [styles.dayNumber, { color, opacity: 0.8 }];
              scoreText = String(predicted);
            } else {
              // Future without prediction - dim empty
              circleStyle = [
                styles.dayCircle,
                { backgroundColor: darkPalette.surfaceElevated, opacity: 0.4 },
              ];
              dayNumberStyle = [styles.dayNumber, { color: darkPalette.textTertiary, opacity: 0.5 }];
            }
          }

          return (
            <View key={`day-${day}`} style={styles.cell}>
              <View style={circleStyle}>
                <Text style={[...dayNumberStyle, { fontSize: 10 }]}>{day}</Text>
                {scoreText !== null && (
                  <Text
                    style={[
                      styles.scoreLabel,
                      hasLog && (isPast || isToday)
                        ? { color: '#FFFFFF' }
                        : isToday && !hasLog
                        ? { color: darkPalette.textSecondary }
                        : { color: dayNumberStyle[1] && 'color' in (dayNumberStyle[1] as Record<string, unknown>) ? (dayNumberStyle[1] as Record<string, string>).color : darkPalette.textTertiary },
                    ]}
                  >
                    {scoreText}
                  </Text>
                )}
              </View>
            </View>
          );
        })}
      </View>

      {/* Legend */}
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#22C55E' }]} />
          <Text style={styles.legendText}>
            {t('legend_actual', { defaultValue: 'Actual' })}
          </Text>
        </View>
        {hasPredictions && (
          <View style={styles.legendItem}>
            <View
              style={[
                styles.legendDot,
                {
                  backgroundColor: 'transparent',
                  borderWidth: 1.5,
                  borderColor: '#22C55E',
                  borderStyle: 'dashed',
                },
              ]}
            />
            <Text style={styles.legendText}>
              {t('legend_predicted', { defaultValue: 'Predicted' })}
            </Text>
          </View>
        )}
      </View>

      {/* Stats row */}
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <Text style={styles.statsText}>
            {t('days_logged_month', {
              logged: stats.logged,
              total: stats.daysInMonth,
              defaultValue: `${stats.logged}/${stats.daysInMonth} days`,
            })}
          </Text>
          <Text style={styles.statsSeparator}>·</Text>
          <Text style={styles.statsText}>
            {t('avg_score_month', {
              score: stats.avg,
              defaultValue: `Avg: ${stats.avg}`,
            })}
          </Text>
        </View>
        {stats.bestDay > 0 && (
          <View style={styles.statsRow}>
            <Text style={styles.statsText}>
              {t('best_day_month', {
                day: `${stats.bestDay} (${stats.bestScore})`,
                defaultValue: `Best: ${stats.bestDay} (${stats.bestScore})`,
              })}
            </Text>
            {stats.predictedBestDay > 0 && (
              <>
                <Text style={styles.statsSeparator}>·</Text>
                <Text style={[styles.statsText, { color: darkPalette.primary }]}>
                  {t('predicted_best', {
                    day: String(stats.predictedBestDay),
                    defaultValue: `Predicted best: ${stats.predictedBestDay}`,
                  })}
                </Text>
              </>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: darkPalette.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: darkPalette.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: darkPalette.text,
  },
  monthSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: darkPalette.textSecondary,
    textAlign: 'center',
    marginBottom: 12,
  },
  dayHeaderRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayHeaderText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '600',
    color: darkPalette.textTertiary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: '14.285%' as unknown as number,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 1,
  },
  dayCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  predictedCircle: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    opacity: 0.7,
  },
  todayBorder: {
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  dayNumber: {
    fontSize: 10,
    fontWeight: '600',
    color: darkPalette.textSecondary,
  },
  loggedText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  scoreLabel: {
    fontSize: 8,
    fontWeight: '600',
    marginTop: -1,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 10,
    color: darkPalette.textTertiary,
    fontWeight: '500',
  },
  statsContainer: {
    marginTop: 10,
    gap: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  statsText: {
    fontSize: 11,
    color: darkPalette.textTertiary,
    fontWeight: '500',
  },
  statsSeparator: {
    fontSize: 11,
    color: darkPalette.textTertiary,
  },
});
