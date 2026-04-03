import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { darkPalette } from '@/theme/colors';
import { useLogStore } from '@/store/logStore';

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

  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    const lastDay = new Date(viewYear, viewMonth + 1, 0);
    const daysInMonth = lastDay.getDate();

    // Monday = 0, Sunday = 6
    let startDow = firstDay.getDay() - 1;
    if (startDow < 0) startDow = 6;

    const cells: (number | null)[] = [];
    for (let i = 0; i < startDow; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    // Pad to complete last row
    while (cells.length % 7 !== 0) cells.push(null);

    return cells;
  }, [viewYear, viewMonth]);

  const stats = useMemo(() => {
    let logged = 0;
    let totalScore = 0;
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      const key = formatDateKey(viewYear, viewMonth, d);
      const log = logs[key];
      if (log) {
        logged++;
        totalScore += log.vitality_score;
      }
    }
    const avg = logged > 0 ? Math.round(totalScore / logged) : 0;
    return { logged, avg };
  }, [logs, viewYear, viewMonth]);

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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={goToPrevMonth} hitSlop={12}>
          <Ionicons name="chevron-back" size={20} color={darkPalette.textSecondary} />
        </Pressable>
        <Text style={styles.title}>{monthName}</Text>
        <Pressable onPress={goToNextMonth} hitSlop={12}>
          <Ionicons name="chevron-forward" size={20} color={darkPalette.textSecondary} />
        </Pressable>
      </View>

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

          const cellDate = new Date(viewYear, viewMonth, day);
          const isToday = isSameDay(cellDate, today);
          const isFuture = cellDate > today;
          const key = formatDateKey(viewYear, viewMonth, day);
          const log = logs[key];
          const hasLog = !!log && !isFuture;

          const circleColor = hasLog
            ? getScoreColor(log.vitality_score)
            : darkPalette.surfaceElevated;

          return (
            <View key={`day-${day}`} style={styles.cell}>
              <View
                style={[
                  styles.dayCircle,
                  { backgroundColor: isFuture ? 'transparent' : circleColor },
                  isToday && styles.todayBorder,
                ]}
              >
                <Text
                  style={[
                    styles.dayNumber,
                    isFuture && styles.futureText,
                    hasLog && styles.loggedText,
                  ]}
                >
                  {day}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <Text style={styles.statsText}>
          {stats.logged} {t('days_logged')}
        </Text>
        <Text style={styles.statsSeparator}>·</Text>
        <Text style={styles.statsText}>
          {t('avg_score')}: {stats.avg}
        </Text>
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
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: darkPalette.text,
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
    width: '14.285%' as any,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayBorder: {
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  dayNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: darkPalette.textSecondary,
  },
  futureText: {
    color: darkPalette.textTertiary,
    opacity: 0.5,
  },
  loggedText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    gap: 6,
  },
  statsText: {
    fontSize: 12,
    color: darkPalette.textTertiary,
    fontWeight: '500',
  },
  statsSeparator: {
    fontSize: 12,
    color: darkPalette.textTertiary,
  },
});
