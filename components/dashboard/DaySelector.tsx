import React, { createContext, useContext, useState, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
} from 'react-native';
import { darkPalette } from '@/theme/colors';
import { useLogStore } from '@/store/logStore';

function getTodayDate(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// --- Context ---

interface SelectedDateContextType {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
}

export const SelectedDateContext = createContext<SelectedDateContextType>({
  selectedDate: getTodayDate(),
  setSelectedDate: () => {},
});

export function SelectedDateProvider({ children }: { children: React.ReactNode }) {
  const [selectedDate, setSelectedDate] = useState(getTodayDate);
  const value = useMemo(() => ({ selectedDate, setSelectedDate }), [selectedDate]);
  return (
    <SelectedDateContext.Provider value={value}>
      {children}
    </SelectedDateContext.Provider>
  );
}

export function useSelectedDate() {
  return useContext(SelectedDateContext);
}

// --- Day Selector Component ---

interface DayItem {
  dateStr: string;
  dayAbbr: string;
  dayNumber: number;
  isToday: boolean;
}

function buildDays(count: number): DayItem[] {
  const days: DayItem[] = [];
  const now = new Date();
  const todayStr = getTodayDate();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const seen = new Set<string>();

  // 3 days past + today + 3 days future = 7 cells
  const pastDays = 3;
  for (let i = -pastDays; i < count - pastDays; i++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (seen.has(dateStr)) continue;
    seen.add(dateStr);
    days.push({
      dateStr,
      dayAbbr: dayNames[d.getDay()],
      dayNumber: d.getDate(),
      isToday: dateStr === todayStr,
    });
  }
  return days;
}

const CELL_WIDTH = 56;
const CELL_HEIGHT = 76;
const DAY_COUNT = 8; // 7 past days + today

export default function DaySelector() {
  const { selectedDate, setSelectedDate } = useSelectedDate();
  const logs = useLogStore((s) => s.logs);
  const days = useMemo(() => buildDays(DAY_COUNT), []);
  const flatListRef = useRef<FlatList>(null);

  const getScoreColor = useCallback((score: number): string => {
    if (score >= 70) return darkPalette.secondary;
    if (score >= 40) return darkPalette.accent;
    return darkPalette.error;
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: DayItem }) => {
      const log = logs[item.dateStr];
      const isSelected = item.dateStr === selectedDate;
      const score = log?.vitality_score ?? null;

      return (
        <Pressable
          style={[
            styles.cell,
            isSelected && styles.cellSelected,
            item.isToday && styles.cellToday,
          ]}
          onPress={() => setSelectedDate(item.dateStr)}
        >
          <Text
            style={[
              styles.dayAbbr,
              isSelected && styles.dayAbbrSelected,
            ]}
          >
            {item.dayAbbr}
          </Text>

          <View
            style={[
              styles.scoreCircle,
              item.isToday && !isSelected && styles.scoreCircleToday,
              isSelected && styles.scoreCircleSelected,
              score != null && { borderColor: getScoreColor(score) },
            ]}
          >
            {score != null ? (
              <Text
                style={[
                  styles.scoreText,
                  { color: getScoreColor(score) },
                ]}
              >
                {score}
              </Text>
            ) : (
              <Text style={styles.noScoreText}>
                {item.isToday ? '?' : '\u2014'}
              </Text>
            )}
          </View>

          <Text
            style={[
              styles.dayNumber,
              isSelected && styles.dayNumberSelected,
            ]}
          >
            {item.dayNumber}
          </Text>
        </Pressable>
      );
    },
    [logs, selectedDate, setSelectedDate, getScoreColor],
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={days}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.dateStr}-${index}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ width: 6 }} />}
        initialScrollIndex={3}
        getItemLayout={(_, index) => ({
          length: CELL_WIDTH + 6,
          offset: (CELL_WIDTH + 6) * index,
          index,
        })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  listContent: {
    paddingHorizontal: 0,
  },
  cell: {
    width: CELL_WIDTH,
    height: CELL_HEIGHT,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: 'transparent',
  },
  cellSelected: {
    backgroundColor: darkPalette.surfaceElevated,
  },
  cellToday: {
    // just a marker, styling applied via scoreCircleToday
  },
  dayAbbr: {
    fontSize: 11,
    fontWeight: '600',
    color: darkPalette.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dayAbbrSelected: {
    color: darkPalette.text,
  },
  scoreCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: darkPalette.border,
  },
  scoreCircleToday: {
    borderColor: darkPalette.primary,
  },
  scoreCircleSelected: {
    borderWidth: 2,
  },
  scoreText: {
    fontSize: 13,
    fontWeight: '800',
  },
  noScoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: darkPalette.textTertiary,
  },
  dayNumber: {
    fontSize: 11,
    fontWeight: '600',
    color: darkPalette.textTertiary,
  },
  dayNumberSelected: {
    color: darkPalette.textSecondary,
  },
});
